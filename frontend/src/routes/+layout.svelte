<script>
	import '../app.css';
	import { auth } from '$lib/stores/auth';
	import { onMount } from 'svelte';

	onMount(() => {
		auth.initialize();
	});
</script>

<div class="flex min-h-screen flex-col">
	<main class="flex-grow">
		<slot />
	</main>
</div>
