<script lang="ts">
	import { page } from '$app/state';

	import { messagesStore } from '$lib/apps/chat/client';

	const { children } = $props();

	const chatId = $derived(page.params.chatId);

	$effect(() => {
		if (!chatId) return;

		messagesStore.load(chatId).then(() => {
			messagesStore.subscribe(chatId);
		});
		return () => {
			messagesStore.unsubscribe();
		};
	});
</script>

{@render children()}
