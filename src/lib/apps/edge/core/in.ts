import type { Principal } from '$lib/apps/user/core';

export interface StreamChatCmd {
	principal: Principal;
	chatId: string;
	query: string;
}

export interface AddSourceCmd {
	principal: Principal;
	mode: 'file' | 'url';
	file?: File;
	title?: string;
	url?: string;
	metadata?: Record<string, unknown>;
}

export interface EdgeApp {
	streamChat(cmd: StreamChatCmd): Promise<ReadableStream>;

	addSource(cmd: AddSourceCmd): Promise<void>;
}
