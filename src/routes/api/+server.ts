import { sql } from '@vercel/postgres';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }: { url: URL }) {
	try {
		const result = await sql``;
		return new Response(JSON.stringify({ ok: { result }, code: { status: 200 } }));
	} catch (error) {
		return new Response(JSON.stringify({ error: { error }, code: { status: 500 } }));
	}
}
