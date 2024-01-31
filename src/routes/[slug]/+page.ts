import { error } from '@sveltejs/kit';
import { userId } from '../../store/store';
import { browser } from '$app/environment';
import GroupData from '$lib/groupData';

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
	// Vérifie que le code existe
	if (browser) {
		const responseExist = await fetch(`/api/exist?code=${params.slug}`);
		const jsonExist = await responseExist.json();

		if (!jsonExist.exist) {
			return error(404, 'Not found');
		}

		// Récupère les données du groupe
		let userSecretValue = localStorage.getItem('userId') ?? '';

		const reponseGroupData = await fetch(
			`/api/get-group-data?code=${params.slug}&userSecret=${userSecretValue}`
		);

		return await reponseGroupData.json();
	}
}
