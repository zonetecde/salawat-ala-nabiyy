import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }: { url: URL }) {
	if (!url.searchParams.has('username') || !url.searchParams.has('password')) {
		return new Response(
			JSON.stringify({
				error: { message: 'Missing username or password parameter' },
				code: { status: 400 }
			})
		);
	}

	const username = url.searchParams.get('username')!;
	const password = url.searchParams.get('password')!;

	const encryptedPassword = await bcrypt.hash(password, 10);

	const result =
		await sql`SELECT * FROM users WHERE username = ${username} AND password = ${encryptedPassword}`;

	if (result.rowCount === 0) {
		return new Response(
			JSON.stringify({
				success: false,
				error: { message: "Nom d'utilisateur ou mot de passe incorrect" }
			})
		);
	}

	return new Response(JSON.stringify({ success: true }));
}
