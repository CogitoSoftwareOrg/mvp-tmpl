<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import { page } from '$app/state';
	import { MessagesRoleOptions, MessagesStatusOptions } from '$lib';
	import { Pencil, Check, X } from 'lucide-svelte';
	import { onMount } from 'svelte';

	import {
		chatsStore,
		messagesStore,
		Messages,
		MessageControls,
		chatApi
	} from '$lib/apps/chat/client';
	import { userStore } from '$lib/apps/user/client';
	import { Button } from '$lib/shared/ui';

	const chatId = $derived(page.params.chatId);
	const chat = $derived(chatsStore.chats.find((chat) => chat.id === chatId));
	const messages = $derived(messagesStore.messages);

	const aiSender = {
		id: 'ai',
		avatar: 'https://via.placeholder.com/150',
		name: 'AI',
		role: 'ai'
	};

	let isEditingTitle = $state(false);
	let newTitle = $derived(chat?.title || '');
	let messagesContainer: HTMLDivElement | undefined = $state();
	let footerElement: HTMLElement | undefined = $state();

	const mobile = $derived(new MediaQuery('(max-width: 768px)'));

	// Handle viewport changes on mobile to prevent layout shift
	onMount(() => {
		if (!mobile || typeof window === 'undefined' || !window.visualViewport) return;

		let initialMessagesHeight: number | null = null;
		let footerHeight: number | null = null;

		// Store initial heights when elements are mounted
		const storeInitialHeights = () => {
			if (messagesContainer && footerElement) {
				initialMessagesHeight = messagesContainer.offsetHeight;
				footerHeight = footerElement.offsetHeight;
			}
		};

		// Use a small delay to ensure elements are rendered
		setTimeout(storeInitialHeights, 100);

		const updateLayout = () => {
			if (!messagesContainer || !footerElement || !window.visualViewport) return;

			const viewport = window.visualViewport;
			const viewportHeight = viewport.height;
			const windowHeight = window.innerHeight;

			// Calculate keyboard height
			const keyboardHeight = windowHeight - viewportHeight;

			if (keyboardHeight > 50) {
				// Keyboard is open - fix footer position above keyboard
				footerElement.style.position = 'fixed';
				footerElement.style.bottom = '0';
				footerElement.style.left = '0';
				footerElement.style.right = '0';
				footerElement.style.zIndex = '1000';
				footerElement.style.width = '100%';
				footerElement.style.backgroundColor = 'var(--fallback-b1, oklch(var(--b1)))';

				// Keep messages container at its original height to prevent layout shift
				if (initialMessagesHeight !== null) {
					messagesContainer.style.height = `${initialMessagesHeight}px`;
					messagesContainer.style.overflow = 'auto';
				}
			} else {
				// Keyboard is closed - restore normal layout
				footerElement.style.position = '';
				footerElement.style.bottom = '';
				footerElement.style.left = '';
				footerElement.style.right = '';
				footerElement.style.zIndex = '';
				footerElement.style.width = '';
				footerElement.style.backgroundColor = '';

				// Restore messages container to flex behavior
				messagesContainer.style.height = '';
				messagesContainer.style.overflow = '';

				// Update initial height for next time
				initialMessagesHeight = messagesContainer.offsetHeight;
			}
		};

		window.visualViewport.addEventListener('resize', updateLayout);
		window.visualViewport.addEventListener('scroll', updateLayout);

		// Also listen to window resize as fallback
		window.addEventListener('resize', storeInitialHeights);

		return () => {
			window.visualViewport?.removeEventListener('resize', updateLayout);
			window.visualViewport?.removeEventListener('scroll', updateLayout);
			window.removeEventListener('resize', storeInitialHeights);
		};
	});

	async function handleSend(content: string) {
		if (!chat) return;
		await chatApi.sendMessage({
			chat: chat.id,
			role: MessagesRoleOptions.user,
			status: MessagesStatusOptions.final,
			content
		});
	}

	async function saveTitle() {
		if (!chat) return;
		if (newTitle.trim() !== chat.title) {
			await chatApi.update(chat.id, { title: newTitle });
		}
		isEditingTitle = false;
	}

	function cancelEdit() {
		if (chat) newTitle = chat.title || '';
		isEditingTitle = false;
	}
</script>

{#if chat && messages}
	<div class="flex h-full w-full flex-col">
		<!-- Desktop Header with title editing -->
		<header
			class="hidden h-12 shrink-0 items-center justify-between border-b border-base-300 px-4 sm:flex"
		>
			<div class="flex flex-1 items-center gap-2 overflow-hidden">
				{#if isEditingTitle}
					<form
						onsubmit={(e) => {
							e.preventDefault();
							saveTitle();
						}}
						class="flex w-full max-w-md items-center gap-2"
					>
						<input type="text" class="input input-sm input-bordered w-full" bind:value={newTitle} />
						<Button circle size="sm" color="success" type="submit">
							<Check size={16} />
						</Button>
						<Button circle size="sm" variant="ghost" onclick={cancelEdit}>
							<X size={16} />
						</Button>
					</form>
				{:else}
					<h1 class="truncate text-lg font-bold">{chat.title || 'New Chat'}</h1>
					<Button
						circle
						size="sm"
						variant="ghost"
						class="transition-opacity hover:bg-base-200"
						onclick={() => {
							isEditingTitle = true;
							newTitle = chat.title || '';
						}}
					>
						<Pencil size={14} class="text-base-content/70" />
					</Button>
				{/if}
			</div>
		</header>

		<!-- Messages Area -->
		<div bind:this={messagesContainer} class="flex-1 overflow-hidden">
			<Messages class="h-full" {messages} userSender={userStore.sender} {aiSender} />
		</div>

		<!-- Footer / Input -->
		{#if chatId}
			<footer
				bind:this={footerElement}
				class="shrink-0 border-t border-base-300 bg-base-100 p-2 pt-[0.4rem]"
			>
				<MessageControls {chatId} {messages} onSend={handleSend} />
			</footer>
		{/if}
	</div>
{:else}
	<div class="flex h-full items-center justify-center">
		<span class="loading loading-spinner loading-lg text-primary"></span>
	</div>
{/if}
