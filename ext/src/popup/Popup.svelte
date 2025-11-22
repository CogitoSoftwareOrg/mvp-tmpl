<script lang="ts">
	import { onMount } from 'svelte';

	onMount(() => {
		console.log('Popup mounted');
	});

	let count = $state(0);
</script>

<main class="min-w-[380px] min-h-[560px] p-4">
	<h3>Svelte Popup</h3>
	<button onclick={() => count++}>Clicked {count} times</button>
</main>
