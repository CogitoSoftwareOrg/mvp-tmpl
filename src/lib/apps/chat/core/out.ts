import type { ChatEventMemory, EventType } from './models';

export interface ChatEventIndexer {
	add(memory: ChatEventMemory[]): Promise<void>;
	search(
		query: string,
		tokens: number,
		chatId: string,
		days?: number,
		type?: EventType
	): Promise<ChatEventMemory[]>;
}
