<script lang="ts">
	import GroupData from '$lib/groupData';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { userId } from '../../store/store';
	import toast from 'svelte-french-toast';

	/** @type {import('./$types').PageData} */
	export let data: GroupData;

	let progressionActuelle = 0;
	let salawatAujourdhui = 0;
	let objectif = 0;
	let animDebutFait = false;

	let userSecretValue: string;
	let page: 'Jour' | 'Total' = 'Jour';

	$: if (page === 'Jour') {
		if (animDebutFait) {
			progressionActuelle = (data.sommeAujourdhui / data.objectifJournalier) * 100;
			salawatAujourdhui = data.sommeAujourdhui;
		}
		objectif = data.objectifJournalier;
	} else if (page === 'Total') {
		if (animDebutFait) {
			progressionActuelle = (data.sommeTotal / data.objectifTotal) * 100;
			salawatAujourdhui = data.sommeTotal;
		}
		objectif = data.objectifTotal;
	}

	userId.subscribe((value) => {
		userSecretValue = value;
	});

	let addSalawatVisible = false;
	let salawatInput: number = 33;

	onMount(() => {
		if (localStorage.getItem('userId')) {
			userId.set(localStorage.getItem('userId')!);
		}

		progressionAnim();
	});

	function progressionAnim() {
		let progression: number;
		let somme: number;

		if (page === 'Jour') {
			progression = (data.sommeAujourdhui / data.objectifJournalier) * 100;
			somme = data.sommeAujourdhui;
		} else if (page === 'Total') {
			progression = (data.sommeTotal / data.objectifTotal) * 100;
			somme = data.sommeTotal;
		}

		const duration = 1350;

		// animation de la progression
		let i = progressionActuelle; // Initialisez i à progressionActuelle
		const interval = setInterval(() => {
			if (i >= progression) {
				progressionActuelle = progression;
				animDebutFait = true;
				clearInterval(interval);
			} else {
				i += (progression / duration) * 10;
				progressionActuelle = i;
			}
		}, 10);

		// animation du nombre de salawat
		let j = salawatAujourdhui; // Initialisez j à salawatAujourdhui
		const interval2 = setInterval(() => {
			if (j >= somme) {
				salawatAujourdhui = somme;
				animDebutFait = true;
				clearInterval(interval2);
			} else {
				j += (somme / duration) * 10;
				salawatAujourdhui = j;
			}
		}, 10);
	}

	let isRequesting = false;

	function handleAddSalawat(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		if (salawatInput < 1) {
			return;
		}

		if (isRequesting) {
			return;
		}

		isRequesting = true;

		fetch('/api/add-salawat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ code: data.code, salawat: salawatInput, userSecret: userSecretValue })
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.success) {
					toast.success('Salawat ajoutées avec succès');

					// on met à jour les données
					data.sommeAujourdhui += Number(salawatInput);
					data.sommeTotal += Number(salawatInput);

					// on met à jour l'affichage
					progressionAnim();

					// on ferme la fenêtre
					addSalawatVisible = false;
				} else {
					toast.error("Une erreur s'est produite : " + res.message);
				}

				isRequesting = false;
			});
	}
</script>

<svelte:head>
	<title>Salawat 'Ala Nabiyy - {data.groupeName}</title>
</svelte:head>

<div
	class="h-screen w-screen bg-[#8faebd] p-5 text-center flex items-center justify-center relative flex-col"
>
	<div
		class="absolute top-0 left-0 right-0 h-12 bg-[#7999b3] text-blue-950 flex flex-row items-center text-2xl border-b-2 border-blue-950"
	>
		<button
			class={'w-[50%] h-full flex items-center justify-center duration-150 ' +
				(page === 'Jour' ? 'bg-[#5e89c2]' : '')}
			on:click={() => (page = 'Jour')}
		>
			<p>Aujourd'hui</p>
		</button>
		<div class="h-full border-r-2 border-blue-950" />
		<button
			class={'w-[50%] h-full flex items-center justify-center duration-150 ' +
				(page === 'Total' ? 'bg-[#5e89c2]' : '')}
			on:click={() => (page = 'Total')}
		>
			<p>Total</p>
		</button>
	</div>

	<div
		class="bg-[#47849c] md:h-[50%] md:w-[20%] max-h-[400px] max-w-[200px] w-[40%] h-[35%] rounded-xl relative"
	>
		<div
			class={'bg-[#386874] duration-200 max-h-full absolute bottom-0 w-full rounded-b-xl ' +
				(progressionActuelle > 98 ? 'rounded-t-xl' : '')}
			style={'height: ' + progressionActuelle + '%'}
		></div>

		<img
			src="salawat2.png"
			alt="Salawat"
			class="w-[70%] absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"
		/>
	</div>

	<p class="mt-12 text-4xl font-bold">{Math.floor(salawatAujourdhui)} salawat</p>
	<p>Objectif {page === 'Jour' ? 'journalier' : 'total'} : {objectif}</p>

	<button
		class="mt-5 bg-blue-600 text-white p-3 rounded-lg shadow-lg hover:bg-blue-700 duration-150"
		on:click={() => (addSalawatVisible = true)}
	>
		Ajouter des salawat
	</button>

	{#if addSalawatVisible}
		<div
			class="bg-black bg-opacity-65 absolute inset-0 flex items-center justify-center"
			transition:fly
		>
			<div
				class="bg-blue-400 rounded-2xl border-4 border-blue-800 shadow-xl shadow-blue-400 h-3/5 lg:h-2/5 xl:h-[30%] w-11/12 md:w-8/12 lg:w-4/12 relative"
			>
				<button
					class="absolute top-2 right-2 text-white hover:text-gray-200"
					on:click={() => (addSalawatVisible = false)}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="black"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>

				<div class="h-full flex flex-col justify-center items-center">
					<p class="text-2xl font-bold">Ajouter des salawat</p>

					<input
						type="number"
						min="1"
						name="salawat"
						class="h-14 px-3 w-1/2 mt-5 border-2 border-sky-800 rounded-lg outline-none text-center text-2xl focus:border-blue-800"
						bind:value={salawatInput}
						placeholder="33"
					/>

					<div class="flex flex-col justify-center items-center mt-5">
						<button
							class="bg-blue-700 border-blue-900 border-2 text-white py-2 px-6 rounded-lg shadow-lg hover:bg-blue-700 duration-150"
							on:click={handleAddSalawat}
						>
							Bismillah
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
