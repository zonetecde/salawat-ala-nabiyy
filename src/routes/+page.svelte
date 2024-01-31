<script lang="ts">
	import { onMount } from 'svelte';
	import toast from 'svelte-french-toast';
	import { fade, fly, slide } from 'svelte/transition';
	import { userId } from '../store/store';

	let createGroupVisible = false;
	let joinGroupVisible = false;
	let registerVisible = false;
	let loginVisible = false;
	let groupData = '';
	let username = '';
	let password = '';
	let passwordConfirmation = '';
	let isConnected = false;

	let userSecretValue: string;

	userId.subscribe((value) => {
		userSecretValue = value;
	});

	onMount(() => {
		if (localStorage.getItem('userId')) {
			userId.set(localStorage.getItem('userId')!);
		}

		if (localStorage.getItem('username')) {
			username = localStorage.getItem('username')!;
			isConnected = true;
		}

		// récupère l'url pour savoir si on doit afficher le formulaire de connexion ou d'inscription
		const url = window.location.href;
		if (url.includes('login')) {
			loginVisible = true;
		} else if (url.includes('register')) {
			registerVisible = true;
		}
	});

	function createGroup() {
		if (!groupData) {
			toast.error('Veuillez entrer un nom de groupe');
			return;
		}

		if (!userSecretValue) {
			toast.error('Vous devez être connecté pour créer un groupe.');
			return;
		}

		fetch('/api/create-group', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ groupName: groupData, creatorSecret: userSecretValue })
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.success) {
					window.location.href = `/${res.code}`;
				} else {
					toast.error("Une erreur s'est produite");
				}
			});
	}

	function joinGroup() {
		if (!groupData) {
			toast.error('Veuillez entrer un code de groupe');
			return;
		}

		groupData = groupData.trim().replaceAll(' ', '');

		// vérifie que c'est un nombre de 6 chiffres
		if (!/^\d{6}$/.test(groupData)) {
			toast.error("Ce groupe n'existe pas");
			return;
		}

		fetch('/api/exist?code=' + groupData, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.exist) {
					window.location.href = `/${groupData}`;
				} else {
					toast.error("Ce groupe n'existe pas");
				}
			});
	}

	function register() {
		if (!username || !password) {
			toast.error('Veuillez remplir tous les champs');
			return;
		}

		if (password !== passwordConfirmation) {
			toast.error('Les mots de passe ne correspondent pas');
			return;
		}

		// if username contain spaces or special characters
		if (!/^[a-zA-Z0-9_]+$/.test(username)) {
			toast.error(
				'Le nom d’utilisateur ne doit contenir que des lettres, des chiffres et des tirets'
			);
			return;
		}

		// if password is less than 6 characters
		if (password.length < 6) {
			toast.error('Le mot de passe doit contenir au moins 6 caractères');
			return;
		}

		fetch('/api/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ username, password })
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.success) {
					toast.success('Votre compte a été créé avec succès');
					// store userId in local storage
					localStorage.setItem('userId', res.userId);
					localStorage.setItem('username', username);
					userId.set(res.userId);

					// redirect to home page
					registerVisible = false;
					isConnected = true;
				} else {
					toast.error(res.message);
				}
			});
	}

	function login() {
		if (!username || !password) {
			toast.error('Veuillez remplir tous les champs');
			return;
		}

		fetch('/api/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ username, password })
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.success) {
					toast.success('Vous êtes connecté');
					// store userId in local storage
					localStorage.setItem('userId', res.userId);
					localStorage.setItem('username', username);
					userId.set(res.userId);

					// redirect to home page
					loginVisible = false;
					isConnected = true;
				} else {
					toast.error(res.message);
				}
			});
	}

	function keyPressLogin(e: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		if (e.key === 'Enter') {
			registerVisible ? register() : login();
		}
	}

	function groupInputKeyPressed(
		e: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }
	) {
		if (e.key === 'Enter') {
			createGroupVisible ? createGroup() : joinGroup();
		}
	}
</script>

<div
	class="h-screen w-screen bg-[#8faebd] p-5 text-center flex items-center justify-center relative"
>
	{#if !isConnected}
		<div class="absolute top-2 md:top-8 flex justify-center gap-x-2">
			<button on:click={() => (registerVisible = true)} class="hover:underline"
				>Créer un compte</button
			>
			<p>•</p>
			<button on:click={() => (loginVisible = true)} class="hover:underline">Se connecter</button>
		</div>
	{:else}
		<div class="absolute top-2 md:top-8 flex flex-col justify-center gap-x-2">
			<p>As salam 'alaykum, {username}</p>
			<button
				class="hover:underline"
				on:click={() => {
					localStorage.removeItem('userId');
					localStorage.removeItem('username');
					userId.set('');
					isConnected = false;
				}}
			>
				Se déconnecter
			</button>
		</div>
	{/if}

	<div class="w-full flex justify-center items-center flex-col -mt-3 md:w-4/12">
		<img src="salawat.png" alt="salawat" width="70%" />

		<p>Que la paix et la bénédiction d'Allah soient sur notre Maitre Muhammad</p>

		<button
			class="mt-5 bg-blue-700 text-white p-3 rounded-lg shadow-lg hover:bg-blue-800"
			on:click={() => (createGroupVisible = true)}
		>
			Créer un groupe
		</button>

		<p class="mt-5 text-gray-700">— ou —</p>

		<button
			class="mt-5 bg-blue-700 text-white p-3 rounded-lg shadow-lg hover:bg-blue-800"
			on:click={() => (joinGroupVisible = true)}
		>
			Rejoindre un groupe
		</button>
	</div>

	{#if createGroupVisible || joinGroupVisible}
		<div
			class="bg-black bg-opacity-65 absolute inset-0 flex items-center justify-center"
			transition:fly
		>
			<div
				class="bg-blue-400 rounded-2xl border-4 border-blue-800 shadow-xl shadow-blue-400 h-3/5 min-h-[325px] lg:h-2/5 xl:h-[30%] w-11/12 md:w-8/12 lg:w-4/12 relative"
			>
				<div class="flex items-center justify-center p-5 flex-col h-full">
					<button
						class="text-3xl absolute top-2 right-2 bg-blue-900 rounded-2xl px-1 py-1 text-white hover:bg-blue-800"
						on:click={() => {
							createGroupVisible = false;
							joinGroupVisible = false;
							groupData = '';
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-6 h-6"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
						</svg>
					</button>
					<h1 class="text-2xl mt-4">
						{createGroupVisible ? 'Créer un groupe' : 'Rejoindre un groupe'}
					</h1>
					<div class="w-full">
						<div class="w-full flex justify-center items-center flex-col mt-12">
							<input
								type="text"
								bind:value={groupData}
								placeholder={createGroupVisible ? 'Nom du groupe' : 'Code du groupe'}
								autocomplete="off"
								class="w-11/12 p-3 rounded-lg border-2 border-blue-800 focus:outline-none focus:border-blue-700"
								on:keyup={groupInputKeyPressed}
							/>
						</div>

						<button
							class="my-auto bg-blue-700 text-white p-3 px-6 rounded-lg shadow-lg hover:bg-blue-800 mt-12"
							on:click={createGroupVisible ? createGroup : joinGroup}
						>
							{createGroupVisible ? 'Créer' : 'Rejoindre'}
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
	{#if registerVisible || loginVisible}
		<div
			class="bg-black bg-opacity-65 absolute inset-0 flex items-center justify-center"
			transition:fly
		>
			<div
				class="bg-blue-400 rounded-2xl border-4 border-blue-800 shadow-xl shadow-blue-400 lg:h-3/5 w-11/12 md:w-8/12 lg:w-5/12 xl:w-4/12 relative"
			>
				<div class="flex justify-center items-center p-5 flex-col h-full overflow-y-auto">
					<h1 class="text-2xl mt-14">
						{registerVisible ? 'Créer un compte' : 'Se connecter'}
					</h1>
					<button
						class="text-3xl absolute top-2 right-2 bg-blue-900 rounded-2xl px-1 py-1 text-white hover:bg-blue-800"
						on:click={() => {
							registerVisible = false;
							loginVisible = false;
							username = '';
							password = '';
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-6 h-6"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
						</svg>
					</button>

					<div class="w-full flex justify-center items-center flex-col my-auto mt-10">
						<input
							type="text"
							bind:value={username}
							placeholder="Nom d'utilisateur"
							autocomplete="off"
							class="w-11/12 p-3 rounded-lg border-2 border-blue-800 focus:outline-none focus:border-blue-700"
							on:keyup={keyPressLogin}
						/>
						<input
							type="password"
							bind:value={password}
							placeholder="Mot de passe"
							autocomplete="off"
							class="w-11/12 p-3 rounded-lg border-2 border-blue-800 focus:outline-none focus:border-blue-700 mt-5"
							on:keyup={keyPressLogin}
						/>
						{#if registerVisible}
							<input
								type="password"
								bind:value={passwordConfirmation}
								placeholder="Confirmer le mot de passe"
								autocomplete="off"
								class="w-11/12 p-3 rounded-lg border-2 border-blue-800 focus:outline-none focus:border-blue-700 mt-5"
								on:keyup={keyPressLogin}
							/>
						{/if}
					</div>

					<button
						class="my-auto bg-blue-700 text-white p-3 rounded-lg shadow-lg hover:bg-blue-800 mt-5"
						on:click={registerVisible ? register : login}
					>
						{registerVisible ? "S'enregistrer" : 'Se connecter'}
					</button>

					<button
						class="mt-5 text-gray-700"
						on:click={() => {
							registerVisible = !registerVisible;
							loginVisible = !loginVisible;
						}}
					>
						{registerVisible ? 'Vous avez déjà un compte ?' : "Vous n'avez pas de compte ?"}
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
