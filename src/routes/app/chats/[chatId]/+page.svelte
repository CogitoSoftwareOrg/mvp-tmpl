<script lang="ts">
	import { page } from '$app/state';
	import { MessagesRoleOptions, MessagesStatusOptions } from '$lib';

	import {
		chatsStore,
		messagesStore,
		Messages,
		MessageControls,
		chatApi
	} from '$lib/apps/chat/client';
	import { userStore } from '$lib/apps/user/client';

	const chatId = $derived(page.params.chatId);
	const chat = $derived(chatsStore.chats.find((chat) => chat.id === chatId));
	const messages = $derived(messagesStore.messages);

	const aiSender = {
		id: 'ai',
		avatar: 'https://via.placeholder.com/150',
		name: 'AI',
		role: 'ai'
	};

	async function handleSend(content: string) {
		if (!chat) return;
		await chatApi.sendMessage({
			chat: chat.id,
			role: MessagesRoleOptions.user,
			status: MessagesStatusOptions.final,
			content
		});
	}
</script>

{#if chat && messages}
	<div class="flex flex-col gap-4">
		<header>
			<h1 class="text-2xl font-bold">{chat?.title || chat?.id}</h1>
		</header>
		<Messages {messages} userSender={userStore.sender} {aiSender} />
		<MessageControls {messages} onSend={handleSend} />
	</div>
{:else}
	<div class="flex flex-col gap-4">
		<div class="flex flex-col gap-4">
			<h1 class="text-2xl font-bold">Loading...</h1>
		</div>
	</div>
{/if}
