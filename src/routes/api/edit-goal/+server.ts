import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }: { request: Request }) {
	// get username and password from body
	const form = await request.json();
	const code: string = form.code;
	const nouvelObjectif: number = form.objectif;
	const type: 'Jour' | 'Total' = form.type;

	const result = await sql`SELECT * FROM groupes WHERE code = ${code};`;

	// check if group exists
	if (result.rowCount === 0) {
		return new Response(JSON.stringify({ success: false, message: 'Groupe non trouvé' }));
	}

	// modifie l'objectif
	if (type === 'Jour') {
		await sql`UPDATE groupes SET objectif_journalier = ${nouvelObjectif} WHERE code = ${code};`;
	} else {
		await sql`UPDATE groupes SET objectif_total = ${nouvelObjectif} WHERE code = ${code};`;
	}

	return new Response(JSON.stringify({ success: true }));
}
