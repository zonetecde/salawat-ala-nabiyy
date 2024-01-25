import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }: { request: Request }) {
	// get username and password from body
	const form = await request.json();
	const username = form.username;
	const password = form.password;

	const result = await sql`SELECT * FROM users WHERE username = ${username}`;

	// check if username exists
	if (result.rowCount === 0) {
		return new Response(
			JSON.stringify({
				success: false,
				message: "Nom d'utilisateur inexistant"
			})
		);
	}

	// check if password is correct
	const user = result.rows[0];

	const isPasswordCorrect = await bcrypt.compare(password, user['password']);

	if (!isPasswordCorrect) {
		return new Response(
			JSON.stringify({
				success: false,
				message: 'Mot de passe incorrect'
			})
		);
	}

	return new Response(JSON.stringify({ success: true, userId: user['secret'] }));
}
