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

export class Chat {
	constructor(public readonly data: ChatsResponse<ChatExpand>) {}

	static fromResponse(res: ChatsResponse<ChatExpand>): Chat {
		return new Chat(res);
	}

	getMessages(): MessagesResponse[] {
		return (this.data.expand?.messages_via_chat as MessagesResponse[]) || [];
	}
}
