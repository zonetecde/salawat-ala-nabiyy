import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
	// Vérifie que le code existe

	const responseExist = await fetch(`/api/exist?code=${params.slug}`);
	const jsonExist = await responseExist.json();

	if (!jsonExist.exist) {
		console.log('not found');
		return error(404, 'Not found');
	}

	// Récupère les données du groupe

	const response2 = await fetch(`/api/get-group-data?code=${params.slug}`);
}
