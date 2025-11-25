<script lang="ts">
	import { page } from '$app/state';

	import { messagesStore, ChatControlPanel } from '$lib/apps/chat/client';
	import { uiStore, Sidebar } from '$lib/shared/ui';

	const { children } = $props();

	const chatId = $derived(page.params.chatId);
	const rightSidebarOpen = $derived(uiStore.rightSidebarOpen);

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

<div class="flex h-full w-full">
	<div class="h-full flex-1 overflow-hidden">
		{@render children()}
	</div>

	<aside class="hidden w-64 shrink-0 border-l border-base-300 md:flex md:flex-col">
		<ChatControlPanel />
	</aside>

	<!-- Mobile Right Sidebar Drawer -->
	<Sidebar
		open={rightSidebarOpen ?? false}
		position="right"
		mobileWidth="w-72"
		showToggle={false}
		onclose={() => uiStore.setRightSidebarOpen(false)}
	>
		{#snippet header({ expanded })}
			<h2 class="text-lg font-semibold">Control Panel</h2>
		{/snippet}
		{#snippet children({ expanded })}
			<ChatControlPanel compact />
		{/snippet}
	</Sidebar>
</div>
