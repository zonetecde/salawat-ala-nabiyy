import { error } from '@sveltejs/kit';
import { userId } from '../../store/store';

/** @type {import('./$types').PageLoad} */
export async function load({ params, fetch }) {
	// Vérifie que le code existe
	const responseExist = await fetch(`/api/exist?code=${params.slug}`);
	const jsonExist = await responseExist.json();

	if (!jsonExist.exist) {
		return error(404, 'Not found');
	}

	// Récupère les données du groupe
	let userSecretValue = '';

	userId.subscribe((value) => {
		userSecretValue = value;
		console.log(value);
	});

	console.log(userSecretValue);

	const reponseGroupData = await fetch(
		`/api/get-group-data?code=${params.slug}&userSecret=${userSecretValue}`
	);

	return await reponseGroupData.json();
}
