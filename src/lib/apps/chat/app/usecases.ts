import type { MemoryApp } from '$lib/apps/memory/core';
import {
	Collections,
	MessagesRoleOptions,
	MessagesStatusOptions,
	pb,
	type ChatExpand,
	type ChatsResponse,
	ChatsStatusOptions
} from '$lib/shared';
import { grok, LLMS, TOKENIZERS } from '$lib/shared/server';

import {
	Chat,
	type ChatApp,
	type MessageChunk,
	type OpenAIMessage,
	type SendUserMessageCmd
} from '../core';

const HISTORY_TOKENS = 2000;

export class ChatAppImpl implements ChatApp {
	constructor(private readonly memoryApp: MemoryApp) {}

	async run(cmd: SendUserMessageCmd): Promise<string> {
		const { aiMsg, history } = await this.prepare(cmd);
		const completion = await grok.chat.completions.create({
			model: LLMS.GROK_4_1_FAST_NON_REASONING,
			messages: [...history, { role: 'user', content: cmd.query }]
		});
		const content = completion.choices[0].message.content || '';
		await this.postProcess(aiMsg.id, content);
		return aiMsg.content || '';
	}

	async runStream(cmd: SendUserMessageCmd): Promise<ReadableStream> {
		const { aiMsg, history } = await this.prepare(cmd);
		const postProcess = this.postProcess;
		const encoder = new TextEncoder();

		return new ReadableStream({
			async start(controller) {
				try {
					const sendEvent = (event: string, data: string) => {
						controller.enqueue(encoder.encode(`event: ${event}\n`));
						controller.enqueue(encoder.encode(`data: ${data}\n\n`));
					};

					let content = '';

					const stream = await grok.chat.completions.create({
						model: LLMS.GROK_4_1_FAST_NON_REASONING,
						stream: true,
						messages: [...history, { role: 'user', content: cmd.query }],
						stream_options: { include_usage: true }
					});

					for await (const chunk of stream) {
						if (chunk.choices && chunk.choices.length > 0 && chunk.choices[0]?.delta) {
							const text = chunk.choices[0].delta.content || '';
							if (!text) continue;
							content += text;
							const msg: MessageChunk = {
								text,
								msgId: aiMsg.id
							};
							sendEvent('chunk', JSON.stringify(msg));
						}
					}

					await postProcess(aiMsg.id, content);
					sendEvent('done', '');
				} catch (error) {
					controller.error(error);
				} finally {
					controller.close();
				}
			}
		});
	}

	private async prepare(cmd: SendUserMessageCmd) {
		const chatRec: ChatsResponse<ChatExpand> = await pb
			.collection(Collections.Chats)
			.getOne(cmd.chatId, { expand: 'messages_via_chat' });
		const chat = Chat.fromResponse(chatRec);
		const history = this.trimMessages(chat, HISTORY_TOKENS);

		if (chat.data.status === ChatsStatusOptions.empty) {
			await pb.collection(Collections.Chats).update(cmd.chatId, {
				status: ChatsStatusOptions.going
			});
		}

		const userMsg = await pb.collection(Collections.Messages).create({
			chat: cmd.chatId,
			role: MessagesRoleOptions.user,
			content: cmd.query,
			status: MessagesStatusOptions.final
		});
		const aiMsg = await pb.collection(Collections.Messages).create({
			chat: cmd.chatId,
			role: MessagesRoleOptions.ai,
			status: MessagesStatusOptions.streaming,
			content: ''
		});

		return { userMsg, aiMsg, history };
	}

	private async postProcess(aiMsgId: string, content: string) {
		await pb.collection(Collections.Messages).update(aiMsgId, {
			content,
			status: MessagesStatusOptions.final
		});
	}

	private trimMessages(chat: Chat, tokens: number): OpenAIMessage[] {
		const allMessages = chat.getMessages().filter((msg) => msg.content);
		const reversedMessages = [...allMessages].reverse();

		const messages: OpenAIMessage[] = [];
		let totalTokens = 0;

		for (const msg of reversedMessages) {
			const msgTokens = TOKENIZERS[LLMS.GROK_4_FAST].encode(msg.content).length;
			if (totalTokens + msgTokens > tokens) break;

			totalTokens += msgTokens;
			messages.push({
				role: msg.role === MessagesRoleOptions.user ? 'user' : 'assistant',
				content: msg.content
			});
		}

		messages.reverse();
		return messages;
	}
}
