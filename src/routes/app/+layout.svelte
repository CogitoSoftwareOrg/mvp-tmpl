<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import {
		PanelLeft,
		Plus,
		House,
		Users,
		Settings,
		ChevronLeft,
		ChevronRight,
		Heart,
		Book,
		MessageSquare,
		Play,
		TextAlignJustify
	} from 'lucide-svelte';

	import { chatApi, chatsStore } from '$lib/apps/chat/client';
	import { uiStore } from '$lib/shared/ui/ui.svelte';
	import { userStore, subStore, FeedbackForm } from '$lib/apps/user/client';
	import { Button, Modal, ThemeController, AuthWall, Paywall } from '$lib/shared/ui';
	import { ChatsStatusOptions } from '$lib';

	import Splash from './Splash.svelte';

	const { children, data } = $props();
	const globalPromise = $derived(data.globalPromise);

	const user = $derived(userStore.user);
	const sub = $derived(subStore.sub);
	const sidebarOpen = $derived(uiStore.globalSidebarOpen);

	const chats = $derived(chatsStore.chats);

	$effect(() => {
		globalPromise.then(({ user, sub, chats }) => {
			if (user) userStore.user = user;
			if (sub) subStore.sub = sub;
			if (chats) chatsStore.set(chats);
		});
	});

	$effect(() => {
		const userId = userStore.user?.id;
		if (!userId) return;
		userStore.subscribe(userId);
		chatsStore.subscribe(userId);
		return () => {
			userStore.unsubscribe();
			chatsStore.unsubscribe();
		};
	});

	$effect(() => {
		const subId = subStore.sub?.id;
		if (!subId) return;
		subStore.subscribe(subId);
		return () => subStore.unsubscribe();
	});

	function isActive(path: string) {
		return page.url.pathname === path;
	}

	let loading = $state(false);
	async function handleNewChat() {
		if (!user) return uiStore.setAuthWallOpen(true);
		let emptyChat = chatsStore.getEmpty();

		if (!emptyChat) {
			loading = true;
			emptyChat = await chatApi.create({
				title: 'New Chat',
				status: ChatsStatusOptions.empty,
				user: user.id
			});
			loading = false;
		}

		goto(`/app/chats/${emptyChat.id}`);
	}
</script>

{#await globalPromise}
	<Splash />
{:then}
	<div class="flex h-screen overflow-hidden bg-base-100">
		<!-- Sidebar -->
		<aside
			class={[
				'flex-col border-r border-base-300 transition-all duration-300 ease-in-out',
				'hidden md:flex'
			]}
			class:w-64={sidebarOpen}
			class:w-16={!sidebarOpen}
		>
			<!-- Header -->
			<div
				class={[
					'flex h-16 items-center border-b border-base-300 px-2',
					sidebarOpen ? 'justify-between' : 'justify-center'
				]}
			>
				{#if sidebarOpen}
					<a href="/app" class="flex items-center gap-2">
						<div class="text-2xl font-bold text-primary"><Heart class="size-8 text-primary" /></div>
						<span class="text-lg font-semibold">YouStory</span>
					</a>
				{/if}
				<button
					onclick={() => uiStore.toggleGlobalSidebar()}
					class="btn btn-square btn-ghost"
					aria-label="Toggle sidebar"
				>
					{#if sidebarOpen}
						<ChevronLeft class="size-6" />
					{:else}
						<ChevronRight class="size-6" />
					{/if}
				</button>
			</div>

			<!-- Navigation -->
			<nav class="flex flex-1 flex-col overflow-hidden">
				<div class="shrink-0 pt-4 px-2">
					<Button
						block
						class="rounded-xl"
						disabled={loading}
						square={!sidebarOpen}
						onclick={handleNewChat}
					>
						<Plus class="size-6" />
						{#if sidebarOpen}
							<span class="text-nowrap"> New Chat </span>
						{/if}
					</Button>
				</div>

				<div class="divider my-1"></div>

				<div class="flex-1 overflow-y-auto px-1">
					<ul class="menu w-full gap-2">
						{#each chats as chat}
							<li class="w-full">
								<a
									href={`/app/chats/${chat.id}`}
									class={[
										'btn flex w-full items-center gap-2 rounded-xl btn-ghost transition-all',
										sidebarOpen ? 'btn-circle justify-start px-4' : 'justify-center',
										isActive(`/app/chats/${chat.id}`) ? 'btn-soft' : ''
									]}
									title={!sidebarOpen ? chat.title || chat.id : ''}
								>
									{chat.id.slice(0, 2)}.
									{#if sidebarOpen}
										<span class="font-medium text-nowrap">{chat.title || chat.id}</span>
									{/if}
								</a>
							</li>
						{/each}
					</ul>
				</div>
			</nav>

			<div class="divider my-1"></div>

			{#if user}
				<div class="mb-2 flex justify-center p-0">
					<button
						class={['btn justify-start btn-ghost', sidebarOpen ? 'btn-block' : 'btn-circle']}
						onclick={() => uiStore.toggleFeedbackModal()}
					>
						<MessageSquare class={sidebarOpen ? 'size-7' : 'mx-auto size-8'} />
						{#if sidebarOpen}
							Feedback
						{:else}
							<span class="sr-only">Feedback</span>
						{/if}
					</button>
				</div>
			{/if}
			<!-- Theme Controller -->
			<div class={['mb-2 border-base-300', sidebarOpen ? '' : 'flex justify-center']}>
				<ThemeController expanded={sidebarOpen} navStyle />
			</div>

			<!-- Profile Card -->
			<div class="border-t border-base-300">
				{#if user}
					<a
						href="/app/settings"
						class="flex items-center gap-3 p-2 transition-colors hover:bg-base-200"
						class:justify-center={!sidebarOpen}
						title={!sidebarOpen ? 'Settings' : ''}
					>
						{#if userStore.avatarUrl}
							<img
								src={userStore.avatarUrl}
								alt={user.name}
								class="size-10 rounded-full text-center"
							/>
						{:else}
							<div
								class="flex size-10 items-center justify-center rounded-full bg-base-300 text-center"
							>
								{user.name?.at(0)?.toUpperCase() ?? 'U'}
							</div>
						{/if}

						{#if sidebarOpen}
							<div class="flex-1 overflow-hidden">
								<div class="truncate text-sm font-semibold">{user.name || 'User'}</div>
								<div class="truncate text-xs opacity-60">{user.email}</div>
							</div>
							<Settings class="size-5 opacity-60" />
						{/if}
					</a>
				{:else}
					<a
						href="/app/auth/sign-up"
						class="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-base-300"
						class:justify-center={!sidebarOpen}
						title={!sidebarOpen ? 'Settings' : 'Auth'}
					>
						<p class="size-10 rounded-full bg-base-300"></p>
						{#if sidebarOpen}
							<div class="flex-1 overflow-hidden">
								<div class="truncate text-sm font-semibold">Log in</div>
							</div>
						{/if}
					</a>
				{/if}
			</div>
		</aside>

		<!-- Main Content -->
		<main class="flex-1 pb-14 sm:pb-0">
			<div class="mx-auto h-full max-w-7xl p-0 md:px-4 lg:px-6">
				{@render children()}
			</div>
		</main>

		<footer class="mobile-dock-footer dock dock-sm z-50 sm:hidden">
			<a href="/app/chats" data-sveltekit-preload-data="tap" class="dock-item">
				<TextAlignJustify
					class={page.url.pathname === '/app/chats' ? 'text-primary' : 'text-neutral'}
				/>
			</a>

			<div>
				<Button circle disabled={loading} class="dock-item" onclick={handleNewChat}>
					<Plus class="size-6" />
				</Button>
			</div>

			<a
				href={user ? '/app/settings' : '/app/auth/sign-up'}
				data-sveltekit-preload-data="tap"
				class="dock-item"
			>
				<Settings
					class={page.url.pathname.startsWith('/app/settings') ||
					page.url.pathname.startsWith('/app/auth')
						? 'text-primary'
						: 'text-neutral'}
				/>
			</a>
		</footer>
	</div>
{/await}

<Modal
	class="max-h-[90vh] max-w-[90vw] sm:max-h-[95vh]"
	backdrop
	open={uiStore.paywallOpen}
	onclose={() => uiStore.setPaywallOpen(false)}
>
	<Paywall stripePrices={(data as any)?.stripePrices ?? []} />
</Modal>

<Modal
	class="max-w-md"
	backdrop
	open={uiStore.authWallOpen}
	onclose={() => uiStore.setAuthWallOpen(false)}
>
	<AuthWall />
</Modal>

<Modal
	class="max-w-2xl"
	backdrop
	open={uiStore.feedbackModalOpen}
	onclose={() => uiStore.setFeedbackModalOpen(false)}
>
	<FeedbackForm />
</Modal>
