<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
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
		TextAlignJustify,
		Menu,
		X
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
	const mobileSidebarOpen = $derived(uiStore.mobileSidebarOpen);

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

	// Close mobile sidebar on navigation
	afterNavigate(() => {
		uiStore.setMobileSidebarOpen(false);
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

	// Swipe gesture handling for mobile sidebar
	let touchStartX = $state(0);
	let touchCurrentX = $state(0);
	let isSwiping = $state(false);
	const SWIPE_THRESHOLD = 50;
	const EDGE_WIDTH = 30;

	function handleTouchStart(e: TouchEvent) {
		const touch = e.touches[0];
		touchStartX = touch.clientX;
		touchCurrentX = touch.clientX;

		// Only allow swipe from edge when sidebar is closed
		if (!mobileSidebarOpen && touchStartX > EDGE_WIDTH) return;

		isSwiping = true;
	}

	function handleTouchMove(e: TouchEvent) {
		if (!isSwiping) return;
		const touch = e.touches[0];
		touchCurrentX = touch.clientX;
	}

	function handleTouchEnd() {
		if (!isSwiping) return;

		const deltaX = touchCurrentX - touchStartX;

		if (!mobileSidebarOpen && deltaX > SWIPE_THRESHOLD) {
			// Swipe right to open
			uiStore.setMobileSidebarOpen(true);
		} else if (mobileSidebarOpen && deltaX < -SWIPE_THRESHOLD) {
			// Swipe left to close
			uiStore.setMobileSidebarOpen(false);
		}

		isSwiping = false;
		touchStartX = 0;
		touchCurrentX = 0;
	}
</script>

{#await globalPromise}
	<Splash />
{:then}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="flex h-screen flex-col overflow-hidden bg-base-100 md:flex-row"
		ontouchstart={handleTouchStart}
		ontouchmove={handleTouchMove}
		ontouchend={handleTouchEnd}
	>
		<!-- Mobile Header -->
		<header class="flex h-10 shrink-0 items-center border-b border-base-300 px-2 md:hidden">
			<Button
				color="neutral"
				circle
				size="sm"
				onclick={() => uiStore.setMobileSidebarOpen(true)}
				variant="ghost"
			>
				<Menu class="size-6" />
			</Button>
		</header>

		{#if mobileSidebarOpen}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div
				class="fixed inset-0 z-40 bg-black/50 md:hidden"
				onclick={() => uiStore.setMobileSidebarOpen(false)}
			></div>
		{/if}

		<!-- Mobile Sidebar Drawer -->
		<aside
			class={[
				'fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-base-300 bg-base-100 transition-transform duration-300 ease-in-out md:hidden',
				mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
			]}
		>
			<!-- Mobile Sidebar Header -->
			<div class="flex h-14 items-center justify-between border-b border-base-300 px-4">
				<a href="/app" class="flex items-center gap-2">
					<Heart class="size-6 text-primary" />
					<span class="font-semibold">MVP Template</span>
				</a>
				<button
					onclick={() => uiStore.setMobileSidebarOpen(false)}
					class="btn btn-square btn-ghost btn-sm"
					aria-label="Close menu"
				>
					<X class="size-5" />
				</button>
			</div>

			<!-- Mobile Sidebar Navigation -->
			<nav class="flex flex-1 flex-col overflow-hidden">
				<div class="shrink-0 px-3 pt-4">
					<Button block class="rounded-xl" disabled={loading} onclick={handleNewChat}>
						<Plus class="size-5" />
						<span>New Chat</span>
					</Button>
				</div>

				<div class="divider my-2"></div>

				<div class="flex-1 overflow-y-auto px-2">
					<ul class="menu w-full gap-1">
						{#each chats as chat}
							<li class="w-full">
								<a
									href={`/app/chats/${chat.id}`}
									class={[
										'btn flex w-full items-center justify-start gap-2 rounded-xl btn-ghost px-4 transition-all',
										isActive(`/app/chats/${chat.id}`) ? 'btn-soft' : ''
									]}
								>
									{chat.id.slice(0, 2)}.
									<span class="truncate font-medium">{chat.title || chat.id}</span>
								</a>
							</li>
						{/each}
					</ul>
				</div>
			</nav>

			<div class="divider my-1"></div>

			{#if user}
				<div class="mb-2 px-2">
					<button
						class="btn btn-block justify-start btn-ghost"
						onclick={() => uiStore.toggleFeedbackModal()}
					>
						<MessageSquare class="size-5" />
						Feedback
					</button>
				</div>
			{/if}

			<!-- Mobile Theme Controller -->
			<div class="mb-2 px-2">
				<ThemeController expanded navStyle />
			</div>

			<!-- Mobile Profile Card -->
			<div class="border-t border-base-300">
				{#if user}
					<a
						href="/app/settings"
						class="flex items-center gap-3 p-3 transition-colors hover:bg-base-200"
					>
						{#if userStore.avatarUrl}
							<img src={userStore.avatarUrl} alt={user.name} class="size-10 rounded-full" />
						{:else}
							<div class="flex size-10 items-center justify-center rounded-full bg-base-300">
								{user.name?.at(0)?.toUpperCase() ?? 'U'}
							</div>
						{/if}
						<div class="flex-1 overflow-hidden">
							<div class="truncate text-sm font-semibold">{user.name || 'User'}</div>
							<div class="truncate text-xs opacity-60">{user.email}</div>
						</div>
						<Settings class="size-5 opacity-60" />
					</a>
				{:else}
					<a
						href="/app/auth/sign-up"
						class="flex items-center gap-3 p-3 transition-colors hover:bg-base-200"
					>
						<div class="size-10 rounded-full bg-base-300"></div>
						<div class="flex-1">
							<div class="text-sm font-semibold">Log in</div>
						</div>
					</a>
				{/if}
			</div>
		</aside>

		<!-- Desktop Sidebar -->
		<aside
			class={[
				'hidden flex-col border-r border-base-300 transition-all duration-300 ease-in-out md:flex'
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
						<span class="text-lg font-semibold">MVP Template</span>
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
				<div class="shrink-0 px-2 pt-4">
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
		<main class="flex-1 overflow-hidden">
			<div class="mx-auto h-full max-w-7xl p-0 md:px-4 lg:px-6">
				{@render children()}
			</div>
		</main>
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
