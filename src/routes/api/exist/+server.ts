import { sql } from '@vercel/postgres';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }: { url: URL }) {
	if (!url.searchParams.has('code')) {
		return new Response(
			JSON.stringify({ error: { message: 'Missing code parameter' }, code: { status: 400 } })
		);
	}

	const code = url.searchParams.get('code');

	const result = await sql`SELECT * FROM groupes WHERE code = ${code}`;
	return new Response(JSON.stringify({ exist: result.rowCount > 0 }));
}
