import { sql } from '@vercel/postgres';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }: { request: Request }) {
	const form = await request.json();

	console.log(form);

	const groupName: string = form.groupName;
	const creatorSecret: string = form.creatorSecret;

	console.log(groupName, creatorSecret);

	if (!groupName || !creatorSecret) {
		return new Response(
			JSON.stringify({ error: { message: 'Missing name parameter' }, code: { status: 400 } })
		);
	}

	const code = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

	const result = await sql`SELECT * FROM groupes WHERE code = ${code}`;

	// check if code is already used
	if (result.rowCount > 0) {
		return POST({ request });
	}

	try {
		await sql`INSERT INTO groupes (name, code, creator_secret) values (${groupName}, ${code}, ${creatorSecret})`;
		return new Response(JSON.stringify({ success: true, code: code }));
	} catch (error) {
		return new Response(JSON.stringify({ success: false }));
	}
}
