<script lang="ts">
	import { chatsStore } from '$lib/apps/chat/client';

	const chats = $derived(chatsStore.chats);
</script>

<div class="flex flex-col gap-4">
	{#each chats as chat}
		<div class="card">
			<div class="card-body">
				<h2 class="card-title">{chat.title}</h2>
			</div>
		</div>
	{/each}
</div>
