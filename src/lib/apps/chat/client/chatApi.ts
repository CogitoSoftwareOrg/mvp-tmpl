import { Collections, pb, type Create, type Update } from '$lib';
import type { MessageChunk } from '$lib/apps/chat/core';

import { messagesStore } from './messages.svelte.ts';

type SendMessageDto = {
	type: 'character' | 'story';
	characterId?: string;
	storyId?: string;
	eventId?: string;
	content: string;
	msg: Create<Collections.Messages>;
};

class ChatApi {
	// Create new chat
	async create(dto: Create<Collections.Chats>) {
		const chat = await pb.collection(Collections.Chats).create(dto);
		return chat;
	}

	// Update chat
	async update(id: string, dto: Update<Collections.Chats>) {
		const chat = await pb.collection(Collections.Chats).update(id, dto);
		return chat;
	}

	async sendMessage(dto: SendMessageDto) {
		if (!dto.content) throw new Error('Content is required');

		messagesStore.addOptimisticMessage(dto.msg);

		const url =
			dto.type === 'story'
				? `/api/stories/${dto.storyId}/events/${dto.eventId}/chats/${dto.msg.chat}/sse?q=${encodeURIComponent(dto.content)}`
				: `/api/characters/${dto.characterId}/chats/${dto.msg.chat}/sse?q=${encodeURIComponent(dto.content)}`;

		const es = new EventSource(url, {
			withCredentials: true
		});

		es.addEventListener('chunk', (e) => {
			const chunk = JSON.parse(e.data) as MessageChunk;
			messagesStore.addChunk(chunk);
		});
		es.addEventListener('error', (e) => {
			console.error(e);
			es.close();
		});
		es.addEventListener('done', () => {
			es.close();
		});
	}
}

export const chatApi = new ChatApi();
