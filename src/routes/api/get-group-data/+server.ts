import GroupData from '$lib/groupData';
import { sql } from '@vercel/postgres';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }: { url: URL }) {
	if (!url.searchParams.has('code')) {
		return new Response(
			JSON.stringify({ error: { message: 'Missing code parameter' }, code: { status: 400 } })
		);
	}

	const code = url.searchParams.get('code')!;

	const groupeData = (await sql`SELECT * FROM groupes WHERE groupes.code = ${code}`).rows[0];

	const somme =
		(await sql`SELECT SUM(nombre) FROM salawat WHERE salawat.groupe_code = ${code}`).rows[0].sum ??
		0;

	const sommeAujourdhui =
		(
			await sql`SELECT SUM(nombre) FROM salawat WHERE salawat.groupe_code = ${code} AND DATE(salawat.date) = CURRENT_DATE`
		).rows[0].sum ?? 0;

	const nombreParticipantsAujourdhui =
		(
			await sql`SELECT COUNT(DISTINCT user_id) FROM salawat WHERE salawat.groupe_code = ${code} AND DATE(salawat.date) = CURRENT_DATE`
		).rows[0].count ?? 0;

	const nombreParticipants = (
		await sql`SELECT COUNT(DISTINCT user_id) FROM salawat WHERE salawat.groupe_code = ${code}`
	).rows[0].count;

	return new Response(
		JSON.stringify(
			new GroupData(
				code,
				somme,
				sommeAujourdhui,
				nombreParticipantsAujourdhui,
				nombreParticipants,
				groupeData.name,
				groupeData.objectif_journalier,
				groupeData.objectif_total
			)
		)
	);
}
