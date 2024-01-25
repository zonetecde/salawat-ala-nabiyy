import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }: { request: Request }) {
	// get username and password from body
	const form = await request.json();
	const username: string = form.username;
	const password: string = form.password;

	const result = await sql`SELECT * FROM users WHERE username = ${username};`;

	// check if username is already used
	if (result.rowCount > 0) {
		return new Response(JSON.stringify({ success: false, message: "Nom d'utilisateur déjà pris" }));
	}

	try {
		// encrypt password
		const encryptedPassword = await bcrypt.hash(password, 10);

		// generate random user id with letter and number
		const userId = Math.random().toString(36).substr(2, 9);

		await sql`INSERT INTO users (username, password, secret) values (${username}, ${encryptedPassword}, ${userId})`;
		return new Response(JSON.stringify({ success: true, userId: userId }));
	} catch (error) {
		return new Response(JSON.stringify({ success: false }));
	}
}
