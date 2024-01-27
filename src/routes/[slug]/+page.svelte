<script lang="ts">
	import GroupData from '$lib/groupData';
	import { onMount } from 'svelte';

	/** @type {import('./$types').PageData} */
	export let data: GroupData;

	let progressionActuelle = 0;
	let salawatAujourdhui = 0;

	onMount(() => {
		const progression = (data.sommeAujourdhui / data.objectifJournalier) * 100;
		const duration = 1350; // 4 secondes

		// animation de la progression
		let i = 0;
		const interval = setInterval(() => {
			if (i >= progression) {
				progressionActuelle = progression;
				clearInterval(interval);
			} else {
				i += (progression / duration) * 10;
				progressionActuelle = i;
			}
		}, 10);

		// animation du nombre de salawat
		let j = 0;
		const interval2 = setInterval(() => {
			if (j >= data.sommeAujourdhui) {
				salawatAujourdhui = data.sommeAujourdhui;
				clearInterval(interval2);
			} else {
				j += (data.sommeAujourdhui / duration) * 10;
				salawatAujourdhui = j;
			}
		}, 10);
	});
</script>

<svelte:head>
	<title>Salawat 'Ala Nabiyy - {data.groupeName}</title>
</svelte:head>

<div
	class="h-screen w-screen bg-[#8faebd] p-5 text-center flex items-center justify-center relative flex-col"
>
	<div
		class="bg-[#47849c] md:h-[50%] md:w-[20%] max-h-[400px] max-w-[200px] w-[40%] h-[35%] rounded-xl relative"
	>
		<img
			src="salawat2.png"
			alt="Salawat"
			class="w-[70%] absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"
		/>

		<div
			class="bg-[#29525c] absolute bottom-0 w-full rounded-b-xl"
			style={'height: ' + progressionActuelle + '%'}
		></div>
	</div>

	<p class="mt-12 text-4xl font-bold">{Math.floor(salawatAujourdhui)} salawat</p>
	<p>Objectif journalier : {data.objectifJournalier}</p>
</div>
