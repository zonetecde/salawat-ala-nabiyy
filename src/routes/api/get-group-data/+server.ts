import { sql } from '@vercel/postgres';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }: { url: URL }) {
	if (!url.searchParams.has('code')) {
		return new Response(
			JSON.stringify({ error: { message: 'Missing code parameter' }, code: { status: 400 } })
		);
	}

	const code = url.searchParams.get('code');

	const somme =
		(await sql`SELECT SUM(nombre) FROM salawat WHERE salawat.groupe_id = ${code}`).rows[0].sum ?? 0;

	const sommeAujourdhui =
		(
			await sql`SELECT SUM(nombre) FROM salawat WHERE salawat.groupe_id = ${code} AND DATE(salawat.date) = CURRENT_DATE`
		).rows[0].sum ?? 0;

	const nombreParticipants =
		(await sql`SELECT COUNT(*) FROM salawat WHERE salawat.groupe_id = ${code}`).rows[0].count ?? 0;

	return new Response(JSON.stringify({ somme: somme, sommeAujourdhui: sommeAujourdhui }));
}
