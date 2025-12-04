import type { ChatExpand, ChatsResponse, MessagesResponse } from '$lib';

export type Sender = {
	id: string;
	avatar: string;
	name: string;
	role: string;
};

export type MessageChunk = {
	text: string;
	msgId: string;
	i?: number;
};

export enum EventType {
	Story = 'story',
	Chat = 'chat',
	Action = 'action',
	Decision = 'decision'
}
export enum Importance {
	Low = 'low',
	Medium = 'medium',
	High = 'high'
}

export type UtilsMode = 'name';

export type ChatEventMemory = {
	type: EventType;
	content: string;
	chatId: string;
	tokens: number;
	importance: Importance;
};

export type OpenAIMessage = {
	role: 'user' | 'assistant' | 'system' | 'tool';
	content: string;
	tool_calls?: {
		id: string;
		type: 'function';
		function: {
			name: string;
			arguments: string;
		};
	}[];
	tool_call_id?: string;
	tool_call_name?: string;
	tool_call_args?: Record<string, unknown>;
};
export class Chat {
	constructor(public readonly data: ChatsResponse<ChatExpand>) {}

	static fromResponse(res: ChatsResponse<ChatExpand>): Chat {
		return new Chat(res);
	}

	getMessages(): MessagesResponse[] {
		return (this.data.expand?.messages_via_chat as MessagesResponse[]) || [];
	}
}
