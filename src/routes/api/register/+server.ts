import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';

/** @type {import('./$types').RequestHandler} */
export async function POST({ url }: { url: URL }) {
	if (!url.searchParams.has('username') || !url.searchParams.has('password')) {
		return new Response(
			JSON.stringify({
				error: { message: 'Missing username or password parameter' },
				code: { status: 400 }
			})
		);
	}

	const result =
		await sql`SELECT * FROM users WHERE username = ${url.searchParams.get('username')}`;

	// check if username is already used
	if (result.rowCount > 0) {
		return new Response(
			JSON.stringify({ success: false, error: { message: "Nom d'utilisateur déjà pris" } })
		);
	}

	try {
		// encrypt password
		const password = await bcrypt.hash(url.searchParams.get('password')!, 10);

		await sql`INSERT INTO users (username, password) values (${url.searchParams.get('username')}, ${password})`;
		return new Response(JSON.stringify({ success: true }));
	} catch (error) {
		return new Response(JSON.stringify({ success: false }));
	}
}
