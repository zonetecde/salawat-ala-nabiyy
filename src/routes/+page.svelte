<script lang="ts">
	import toast from 'svelte-french-toast';
	import { fade, slide } from 'svelte/transition';

	let createGroupVisible = false;
	let joinGroupVisible = false;
	let groupData = '';

	function createGroup(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		if (!groupData) {
			toast.error('Veuillez entrer un nom de groupe');
			return;
		}

		fetch('/api/create-group?name=' + groupData, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ groupName: groupData })
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.success) {
					window.location.href = `/${groupData}`;
				} else {
					toast.error("Une erreur s'est produite");
				}
			});
	}

	function joinGroup(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		if (!groupData) {
			toast.error('Veuillez entrer un code de groupe');
			return;
		}

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
					window.location.href = `/${res.code}`;
				} else {
					toast.error("Ce groupe n'existe pas");
				}
			});
	}
</script>

<div
	class="h-screen w-screen bg-purple-400 p-5 text-center flex items-center justify-center relative"
>
	<div class="w-full flex justify-center items-center flex-col -mt-14 md:w-4/12">
		<img src="salawat.png" alt="salawat" width="70%" />

		<p>Que la paix et la bénédiction d'Allah soient sur notre Maitre Muhammad</p>

		<button
			class="mt-5 bg-purple-700 text-white p-3 rounded-lg shadow-lg hover:bg-purple-800"
			on:click={() => (createGroupVisible = true)}
		>
			Créer un groupe
		</button>

		<p class="mt-5 text-gray-700">— ou —</p>

		<button
			class="mt-5 bg-purple-700 text-white p-3 rounded-lg shadow-lg hover:bg-purple-800"
			on:click={() => (joinGroupVisible = true)}
		>
			Rejoindre un groupe
		</button>
	</div>

	{#if createGroupVisible || joinGroupVisible}
		<div
			class="bg-black bg-opacity-65 absolute inset-0 flex items-center justify-center"
			transition:slide
		>
			<div
				class="bg-purple-400 rounded-2xl border-4 border-purple-800 shadow-xl shadow-purple-400 h-2/5 w-11/12 md:w-4/12 relative"
			>
				<div class="flex justify-center items-center p-5 flex-col h-full">
					<h1 class="text-2xl mt-4">
						{createGroupVisible ? 'Créer un groupe' : 'Rejoindre un groupe'}
					</h1>
					<button
						class="text-3xl absolute top-2 right-2 bg-purple-900 rounded-2xl px-1 py-1 text-white hover:bg-purple-800"
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

					<div class="w-full flex justify-center items-center flex-col my-auto mt-12">
						<input
							type="text"
							bind:value={groupData}
							placeholder={createGroupVisible ? 'Nom du groupe' : 'Code du groupe'}
							autocomplete="off"
							class="w-11/12 p-3 rounded-lg border-2 border-purple-800 focus:outline-none focus:border-purple-700"
						/>
					</div>

					<button
						class="my-auto bg-purple-700 text-white p-3 rounded-lg shadow-lg hover:bg-purple-800"
						on:click={createGroupVisible ? createGroup : joinGroup}
					>
						{createGroupVisible ? 'Créer' : 'Rejoindre'}
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
