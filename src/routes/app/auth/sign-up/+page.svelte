<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { pb } from '$lib';
	import ThemeController from '$lib/shared/ui/ThemeController.svelte';
	import posthog from 'posthog-js';
	import Oauth from '../Oauth.svelte';
	import { AlertCircle } from 'lucide-svelte';
	import { userStore } from '$lib/apps/user/client';

	const user = $derived(userStore.user);

	let username = $state('');
	let email = $state('');
	let password = $state('');
	let passwordConfirm = $state('');
	let agreed = $state(true);
	let loading = $state(false);
	let error: any | null = $state(null);

	let disabled = $derived(
		email.length === 0 ||
			password.length === 0 ||
			username.length === 0 ||
			password !== passwordConfirm ||
			!agreed
	);

	let oldPassword = $state('');
	$effect(() => {
		if (user) {
			oldPassword = localStorage.getItem('guest_password') ?? '';
		}
	});

	const onSubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		error = null;
		loading = true;

		if (!user || !oldPassword) {
			error = { message: 'Invalid guest account' };
			loading = false;
			return;
		}

		if (password !== passwordConfirm) {
			error = { message: 'Passwords do not match' };
			loading = false;
			return;
		}

		try {
			await pb!.collection('users').update(user.id, {
				email,
				oldPassword,
				password,
				passwordConfirm,
				name: username
			});

			posthog.capture('user_signed_up', {
				email: email,
				name: username
			});

			await goto('/app');
			await invalidate('app:global');
		} catch (err: any) {
			console.error(err);
			error = err;
		} finally {
			loading = false;
		}
	};
</script>

<div class="mx-auto mt-8 max-w-lg px-4">
	<ThemeController />

	<h1 class="mb-6 text-center text-3xl font-bold">Create New Account</h1>

	<div class="mb-4">
		<Oauth bind:loading bind:error bind:agreed />
	</div>

	<div class="divider">OR</div>

	<form onsubmit={onSubmit} class="card space-y-4 bg-base-100 p-6 shadow-lg">
		<!-- Error Message -->
		{#if error}
			<div class="alert alert-error">
				<AlertCircle class="h-6 w-6 shrink-0 stroke-current" />
				<span class="text-sm">{error.message || 'An error occurred during signup'}</span>
			</div>
		{/if}

		<!-- Username -->
		<div class="form-control w-full">
			<label for="username" class="label">
				<span class="label-text">Username*</span>
			</label>
			<input
				id="username"
				type="text"
				placeholder="Your username"
				bind:value={username}
				required
				class="input-bordered input w-full"
			/>
		</div>

		<!-- Email -->
		<div class="form-control w-full">
			<label for="email" class="label">
				<span class="label-text">Email*</span>
			</label>
			<input
				id="email"
				type="email"
				placeholder="you@example.com"
				bind:value={email}
				required
				class="input-bordered input w-full"
			/>
		</div>

		<!-- Password -->
		<div class="form-control w-full">
			<label for="password" class="label">
				<span class="label-text">Password*</span>
			</label>
			<input
				id="password"
				type="password"
				placeholder="••••••••"
				bind:value={password}
				required
				class="input-bordered input w-full"
			/>
		</div>

		<!-- Confirm Password -->
		<div class="form-control w-full">
			<label for="confirmPassword" class="label">
				<span class="label-text">Confirm Password*</span>
			</label>
			<input
				id="confirmPassword"
				type="password"
				placeholder="••••••••"
				bind:value={passwordConfirm}
				required
				class="input-bordered input w-full"
			/>
		</div>

		<!-- Submit Button -->
		<div class="form-control mt-2 w-full">
			<button type="submit" class="btn w-full btn-primary" disabled={disabled || loading}>
				{#if loading}
					<span class="loading loading-spinner"></span>
					Loading…
				{:else}
					Create Account
				{/if}
			</button>
		</div>
	</form>
	<!-- Terms -->
	<p class="mt-2 text-sm text-neutral">
		By creating an account, you agree to the
		<a href="/legal/terms-and-conditions" class="link link-primary" target="_blank"
			>terms and conditions</a
		>
		and
		<a href="/legal/privacy-policy" class="link link-primary" target="_blank">privacy policy</a>.
	</p>

	<p class="mt-4 text-center text-sm">
		Already have an account?
		<a href="/app/auth/sign-in" class="link font-semibold link-secondary">Sign in!</a>
	</p>
</div>
