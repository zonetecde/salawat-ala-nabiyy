<script lang="ts">
	import GroupData from '$lib/groupData';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { userId } from '../../store/store';
	import toast from 'svelte-french-toast';
	import '@carbon/charts-svelte/styles.css';
	import { BarChartSimple, ScaleTypes, ChartTheme, Alignments } from '@carbon/charts-svelte';
	import { browser } from '$app/environment';

	/** @type {import('./$types').PageData} */
	export let data: GroupData;

	let progressionActuelle = 0;
	let salawatAujourdhui = 0;
	let objectif = 0;
	let animDebutFait = false;

	let userSecretValue: string;
	let page: 'Jour' | 'Total' = 'Jour';

	let objectifAnnuel = data.objectifTotal;
	let objectifJournalier = data.objectifJournalier;
	let objectifInput: number = 0;

	let isFetching = false;

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

	function handleAddSalawat(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		// vérifie que l'utilisateur est connecté
		if (!userSecretValue) {
			toast.error(
				"Vous devez être connecté pour ajouter des salawat (revenez sur la page d'accueil)"
			);
			return;
		}

		if (salawatInput < 1) {
			return;
		}

		if (isFetching) {
			return;
		}

		isFetching = true;

		fetch('/api/add-salawat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ code: data.code, salawat: salawatInput, userSecret: userSecretValue })
		})
			.then((res) => res.json())
			.then(async (res) => {
				if (res.success) {
					toast.success('Salawat ajoutées avec succès');

					// on met à jour les données
					data.sommeAujourdhui += Number(salawatInput);
					data.sommeTotal += Number(salawatInput);

					// on met à jour l'affichage
					progressionAnim();

					// on ferme la fenêtre
					addSalawatVisible = false;

					// met à jour les datas
					const reponseGroupData = await fetch(
						`/api/get-group-data?code=${data.code}&userSecret=${userSecretValue}`
					);

					data = await reponseGroupData.json();
				} else {
					toast.error("Une erreur s'est produite : " + res.message);
				}

				isFetching = false;
			});
	}

	let setObjectifVisible = false;

	function handleChangeObjectif(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		// Regarde si l'utilisateur connecté est l'admin
		if (userSecretValue !== data.adminSecret) {
			toast.error("Vous n'êtes pas l'admin de ce groupe");
			return;
		}

		objectifInput = page === 'Jour' ? objectifJournalier : objectifAnnuel;

		setObjectifVisible = true;
	}

	function handleEditObjectif(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		if (isFetching) {
			return;
		}

		// vérifie que l'objectif est différent de 0
		if (objectifInput < 1) {
			toast.error("L'objectif doit être supérieur à 0");
			return;
		}

		// vérifie que le nouvel objectif est différent de l'ancien
		if (objectifInput === (page === 'Jour' ? objectifJournalier : objectifAnnuel)) {
			setObjectifVisible = false;
			return;
		}

		isFetching = true;

		// api call pour modifier l'objectif du groupe
		fetch('/api/edit-goal', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ code: data.code, objectif: objectifInput, type: page })
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.success) {
					toast.success('Objectif modifié avec succès');
					page === 'Jour' ? (objectifJournalier = objectifInput) : (objectifAnnuel = objectifInput);
					data.objectifJournalier = objectifJournalier;
					data.objectifTotal = objectifAnnuel;
					setObjectifVisible = false;
				} else {
					toast.error("Une erreur s'est produite : " + res.message);
				}

				isFetching = false;
			});
	}
</script>

<svelte:head>
	<title>Salawat 'Ala Nabiyy - {data.groupeName}</title>
</svelte:head>

<div class="h-screen bg-[#8faebd] p-5 text-center flex items-center justify-center flex-col">
	<div
		class="absolute top-0 left-0 right-0 h-12 bg-[#7999b3] text-blue-950 flex flex-row items-center text-2xl border-b-2 border-blue-950"
	>
		<button
			class={'w-[50%] h-full flex items-center justify-center duration-150 outline-none ' +
				(page === 'Jour' ? 'bg-[#5e89c2]' : '')}
			on:click={() => (page = 'Jour')}
		>
			<p>Aujourd'hui</p>
		</button>
		<div class="h-full border-r-2 border-blue-950" />
		<button
			class={'w-[50%] h-full flex items-center justify-center duration-150 outline-none ' +
				(page === 'Total' ? 'bg-[#5e89c2]' : '')}
			on:click={() => (page = 'Total')}
		>
			<p>Total</p>
		</button>
	</div>

	{#if browser && localStorage.getItem('userId') === null}
		<div class="absolute flex flex-col text-slate-800 right-4 text-right top-14">
			<span>
				<a href="/?login" class="hover:underline">Connectez-vous</a> ou
				<a href="/?register" class="hover:underline">créez un compte</a>
			</span>

			<p class="text-sm">pour ajouter des salawat</p>
		</div>
	{/if}

	<p class="mt-3">Nom du groupe : {data.groupeName ?? ''}</p>
	<p class="-mb-6">Code : {data.code ?? ''}</p>

	<!-- BARRE DE PROGRESSION -->

	<div
		class={'bg-[#47849c] md:h-[50%] md:w-[20%] max-h-[400px] max-w-[200px] w-[40%] h-[35%] rounded-xl relative mt-14 ' +
			(progressionActuelle < 5 ? 'rounded-b-none' : '')}
	>
		<div
			class={'bg-[#386874] duration-200 max-h-full absolute bottom-0 w-full ' +
				(progressionActuelle > 98 ? 'rounded-t-xl ' : ' ') +
				(progressionActuelle < 5 ? ' rounded-b-none' : 'rounded-b-xl')}
			style={'height: ' + progressionActuelle + '%'}
		></div>

		<img
			src="salawat2.png"
			alt="Salawat"
			class="w-[70%] absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"
		/>
	</div>

	<p class="mt-12 text-4xl font-bold">{Math.floor(salawatAujourdhui)} salawat</p>
	<button on:click={handleChangeObjectif}
		>Objectif {page === 'Jour' ? 'journalier' : 'total'} : {objectif ?? 0}</button
	>

	<button
		class="mt-5 bg-blue-600 text-white p-3 rounded-lg shadow-lg hover:bg-blue-700 duration-150"
		on:click={() => (addSalawatVisible = true)}
	>
		Ajouter des salawat
	</button>

	<!-- Affichage du "rank" de la personne si elle a déjà déposé au moins une salawat -->
	{#if data.sommePersonnel > 0}
		<p class="px-1.5 mt-5 text-base absolute bottom-1.5">
			Vous êtes {data.rankPersonnel}<span style="font-variant-position: super;"
				>{data.rankPersonnel === 1 ? 'er' : 'ème'}</span
			>
			au classement avec {data.sommePersonnel}
			salawat
		</p>
	{/if}

	{#if addSalawatVisible}
		<div
			class="bg-black bg-opacity-65 fixed inset-0 flex items-center justify-center z-40"
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

	{#if setObjectifVisible}
		<div
			class="bg-black bg-opacity-65 fixed inset-0 flex items-center justify-center z-40"
			transition:fly
		>
			<div
				class="bg-blue-400 rounded-2xl border-4 border-blue-800 shadow-xl shadow-blue-400 h-3/5 lg:h-2/5 xl:h-[30%] w-11/12 md:w-8/12 lg:w-4/12 relative"
			>
				<button
					class="absolute top-2 right-2 text-white hover:text-gray-200"
					on:click={() => (setObjectifVisible = false)}
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

				<div class="h-full flex flex-col justify-center items-center px-4">
					<p class="text-2xl font-bold">
						Modifier l'objectif {page === 'Jour' ? 'journalier' : 'annuel'} du groupe
					</p>

					<input
						type="number"
						min="1"
						name="salawat"
						class="h-14 px-3 w-1/2 mt-5 border-2 border-sky-800 rounded-lg outline-none text-center text-2xl focus:border-blue-800"
						bind:value={objectifInput}
						placeholder={page === 'Jour' ? '1000' : '100000'}
					/>

					<div class="flex flex-col justify-center items-center mt-5">
						<button
							class="bg-blue-700 border-blue-900 border-2 text-white py-2 px-6 rounded-lg shadow-lg hover:bg-blue-700 duration-150"
							on:click={handleEditObjectif}
						>
							Modifier
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}

	{#if data.code === undefined}
		<div
			class="bg-black bg-opacity-65 fixed inset-0 flex items-center justify-center z-40 flex-col pb-28"
			transition:fly
		>
			<img src="spinner.svg" alt="spinner" class="w-60 md:w-[400px] animate-spin" />

			<p class="text-white text-2xl font-bold -mt-5">Chargement des données...</p>
		</div>
	{/if}
</div>

<!-- Informations complémentaire -->

<div class="bg-[#7999b3] text-blue-950 flex flex-col items-center justify-center p-5">
	<p class="text-xl font-bold text-center">Informations complémentaires</p>
	<i class="text-xs text-center">Actualiser la page pour voir les changements </i>

	<table class="mt-5 border border-black">
		<tr class="border-b border-black">
			<td class="w-[75%] pl-2 py-1">Nombre de membres ayant participé aujourd'hui :</td>
			<td>{data.nombreParticipantsAujourdhui ?? 0}</td>
		</tr>
		<tr class="border-b border-black">
			<td class="w-[75%] pl-2 py-1">Nombre de membres ayant participé (total) :</td>
			<td>{data.nombreParticipants ?? 0}</td>
		</tr>

		<tr class="border-b border-black">
			<td class="w-[75%] pl-2 py-1">Nombre de salawat ces 7 derniers jours :</td>
			<td>{data.somme7derniersJours ?? 0}</td>
		</tr>

		<tr class="border-b border-black">
			<td class="w-[75%] pl-2 py-1">Nombre de salawat ces 30 derniers jours :</td>
			<td>{data.somme30derniersJours ?? 0}</td>
		</tr>

		<tr class="border-b border-black">
			<td class="w-[75%] pl-2 py-1">Nombre de salawat ces 365 derniers jours :</td>
			<td>{data.somme365derniersJours ?? 0}</td>
		</tr>

		<tr class="border-b border-black">
			<td class="w-[75%] pl-2 py-1">Nombre de salawat par personne en moyenne :</td>
			<td>{data.moyenneParticipant ?? 0}</td>
		</tr>

		<tr class="border-b border-black">
			<td class="w-[75%] pl-2 py-1">Nombre de salawat par jour en moyenne :</td>
			<td>{data.moyenneJour ?? 0}</td>
		</tr>

		<tr class="border-b border-black">
			<td class="w-[75%] pl-2 py-1">Nombre de jour actif du groupe :</td>
			<td>{data.nombreJoursAvecSalawat ?? 0}</td>
		</tr>
		<tr class="border-b border-black">
			<td class="w-[75%] pl-2 py-1">Record en une journée :</td>
			<td>{data.recordJournee ?? 0}</td>
		</tr>
	</table>

	<div class="md:w-[80%] w-[100%] mt-10 h-[400px] z-10">
		<BarChartSimple
			data={data.jourNombre}
			options={{
				title: 'Graphique du nombre de salawat par jour',
				theme: ChartTheme.G10,
				axes: {
					left: {
						mapsTo: 'nombre',
						scaleType: ScaleTypes.LINEAR
					},
					bottom: { mapsTo: 'date', scaleType: ScaleTypes.TIME }
				},
				legend: {
					alignment: Alignments.RIGHT,
					enabled: false
				}
			}}
		/>
	</div>

	{#if browser && localStorage.getItem('userId')}
		<p class="text-black mt-3">Connecté en tant que {localStorage.getItem('username')}</p>
		<button
			class="hover:underline text-black"
			on:click={() => {
				localStorage.removeItem('userId');
				localStorage.removeItem('username');
				userId.set('');
				window.location.reload();
			}}
		>
			Se déconnecter
		</button>
	{:else}
		<a href="/?login" class="hover:underline text-black mt-3">Se connecter</a>
		<a href="/?register" class="hover:underline text-black">Créer un compte</a>
	{/if}
</div>
