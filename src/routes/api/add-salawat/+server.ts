import { sql } from '@vercel/postgres';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }: { request: Request }) {
	const form = await request.json();

	const groupCode: string = form.code;
	const nombre: number = form.salawat;
	const userSecret: string = form.userSecret;

	if (!nombre || !groupCode || !userSecret) {
		return new Response(JSON.stringify({ message: 'Missing parameter', success: false }));
	}

	const result = await sql`SELECT * FROM groupes WHERE code = ${groupCode}`;

	// check if group exist
	if (result.rowCount === 0) {
		return new Response(JSON.stringify({ success: false, message: 'Group not found' }));
	}

	try {
		await sql`INSERT INTO salawat (groupe_code, nombre, user_secret) values (${groupCode}, ${nombre}, ${userSecret})`;
		return new Response(JSON.stringify({ success: true }));
	} catch (error) {
		return new Response(JSON.stringify({ success: false }));
	}
}
