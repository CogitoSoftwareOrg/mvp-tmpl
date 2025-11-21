<script lang="ts">
	import { chatsStore } from '$lib/apps/chat/client';
	import { userStore } from '$lib/apps/user/client';
	import { subStore } from '$lib/apps/user/client';

	const user = $derived(userStore.user);
	const sub = $derived(subStore.sub);
	const chats = $derived(chatsStore.chats);
</script>

<div>
	<h1>App</h1>
</div>
