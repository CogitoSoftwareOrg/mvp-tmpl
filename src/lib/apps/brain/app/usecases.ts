import z from 'zod';

import type { MessagesResponse } from '$lib/shared';
import type { Agent, Tool } from '$lib/shared/server';
import type { ChatApp, OpenAIMessage } from '$lib/apps/chat/core';
import type { UserApp } from '$lib/apps/user/core';

import type { BrainApp, BrainRunCmd, Mode } from '../core';
import { SaveMemoriesToolSchema, SaveMemoriesArgs } from '../core/tools';

const HISTORY_TOKENS = 2000;
const USER_MEMORY_TOKENS = 5000;
const CHAT_EVENT_MEMORY_TOKENS = 5000;
// const ARTIFCAT_MEMORY_TOKENS = 5000;

export class BrainAppImpl implements BrainApp {
	private tools: Tool[] = [];

	constructor(
		private readonly agents: Record<Mode, Agent>,
		private readonly chatApp: ChatApp,
		private readonly userApp: UserApp
	) {
		const saveMemoriesTool: Tool = {
			// @ts-expect-error - not typed
			schema: SaveMemoriesToolSchema,
			// @ts-expect-error - not typed
			callback: async (
				args: z.infer<typeof SaveMemoriesArgs> & { userId: string; chatId: string }
			) => {
				const { userMemories, chatEventMemories } = args;
				await Promise.all([
					this.userApp.putMemories({
						dtos: userMemories.map((user) => ({
							userId: args.userId,
							content: user.content,
							importance: user.importance
						}))
					}),
					this.chatApp.putMemories({
						dtos: chatEventMemories.map((chatEvent) => ({
							chatId: args.chatId,
							content: chatEvent.content,
							importance: chatEvent.importance,
							type: chatEvent.type
						}))
					})
				]);
			}
		};

		this.tools.push(saveMemoriesTool);
	}

	async ask(cmd: BrainRunCmd): Promise<string> {
		const { chatId, userId, query } = cmd;
		const { history, aiMsg, knowledge } = await this.prepare(chatId, userId, query);
		const agent = this.agents['simple'];
		const result = await agent.run({
			history,
			dynamicArgs: {},
			tools: this.tools,
			knowledge
		});
		await this.chatApp.postProcessMessage(aiMsg.id, result);
		return result;
	}

	async askStream(cmd: BrainRunCmd): Promise<ReadableStream> {
		const { chatId, userId, query } = cmd;
		const { history, aiMsg, knowledge } = await this.prepare(chatId, userId, query);

		const agent = this.agents['simple'];
		const chatApp = this.chatApp;
		const tools = this.tools;

		return new ReadableStream({
			async start(controller) {
				try {
					let content = '';
					const stream = await agent.runStream({
						tools,
						history: history,
						knowledge,
						dynamicArgs: {
							userId: cmd.userId,
							chatId: cmd.chatId
						}
					});
					const reader = stream.getReader();
					while (true) {
						const { value, done } = await reader.read();
						if (done) break;
						content += value;
						controller.enqueue(JSON.stringify({ text: value, msgId: aiMsg!.id }));
					}
					await chatApp.postProcessMessage(aiMsg!.id, content);
				} catch (error) {
					controller.error(error);
				} finally {
					controller.close();
				}
			}
		});
	}

	// PRIVATE UTILS
	async prepare(
		chatId: string,
		userId: string,
		query: string
	): Promise<{
		history: OpenAIMessage[];
		aiMsg: MessagesResponse;
		userMsg: MessagesResponse;
		knowledge: string;
	}> {
		const { aiMsg, userMsg } = await this.chatApp.prepareMessages(chatId, query);

		const knowledge = await this.buildKnowledge(userId, chatId, query);

		const history = await this.chatApp.getHistory(chatId, HISTORY_TOKENS);

		return { history, aiMsg, userMsg, knowledge };
	}

	async buildKnowledge(userId: string, chatId: string, query: string): Promise<string> {
		let knowledge = '';

		console.log('userMemories', userId, query.slice(0, 50));
		const userMemories = await this.userApp.getMemories({
			userId: userId,
			query: query,
			tokens: USER_MEMORY_TOKENS
		});
		if (userMemories.length > 0) {
			knowledge += '\n\nUser memories:';
			knowledge += userMemories.map((user) => `- ${user.content}`).join('\n');
		}

		console.log('chatEventMemories', chatId, query.slice(0, 50));
		const chatEventMemories = await this.chatApp.getMemories({
			chatId: chatId,
			query: query,
			tokens: CHAT_EVENT_MEMORY_TOKENS
		});
		if (chatEventMemories.length > 0) {
			knowledge += '\n\nChat event memories:';
			knowledge += chatEventMemories.map((chatEvent) => `- ${chatEvent.content}`).join('\n');
		}

		// const artifactMemories = await this.artifactApp.getMemories({
		// 	userId: userId,
		// 	query: query,
		// 	tokens: ARTIFCAT_MEMORY_TOKENS
		// });
		// if (artifactMemories.length > 0) {
		// 	knowledge += '\n\nArtifact memories:';
		// 	knowledge += artifactMemories.map((artifact) => `- ${artifact.data.payload}`).join('\n');
		// }

		return knowledge;
	}
}
