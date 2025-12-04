import type { Importance, Principal } from '$lib/apps/user/core';
import type { Collections, MessagesResponse, Update } from '$lib/shared';

import type { Chat, ChatEventMemory, EventType, OpenAIMessage } from './models';

export interface SendUserMessageCmd {
	principal: Principal;
	chatId: string;
	query: string;
}

export type ChatEventMemoryGetCmd = {
	query: string;
	tokens: number;
	chatId: string;
};

export type ChatEventMemoryPutCmd = {
	dtos: { chatId: string; content: string; importance: Importance; type: EventType }[];
};

export interface ChatApp {
	postProcessMessage(aiMsgId: string, content: string): Promise<void>;

	update(chatId: string, dto: Update<Collections.Chats>): Promise<Chat>;
	prepareMessages(
		chatId: string,
		query: string
	): Promise<{ aiMsg: MessagesResponse; userMsg: MessagesResponse }>;
	getHistory(chatId: string, tokens: number): Promise<OpenAIMessage[]>;

	getMemories(cmd: ChatEventMemoryGetCmd): Promise<ChatEventMemory[]>;
	putMemories(cmd: ChatEventMemoryPutCmd): Promise<void>;
}
