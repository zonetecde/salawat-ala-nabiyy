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

	const sommeTotal: number =
		(await sql`SELECT SUM(nombre) FROM salawat WHERE salawat.groupe_code = ${code}`).rows[0].sum ??
		0;

	const sommeAujourdhui: number =
		(
			await sql`SELECT SUM(nombre) FROM salawat WHERE salawat.groupe_code = ${code} AND DATE(salawat.date) = CURRENT_DATE`
		).rows[0].sum ?? 0;

	const somme7derniersJours: number =
		(
			await sql`SELECT SUM(nombre) FROM salawat WHERE salawat.groupe_code = ${code} AND DATE(salawat.date) > CURRENT_DATE - 7`
		).rows[0].sum ?? 0;

	const somme30derniersJours: number =
		(
			await sql`SELECT SUM(nombre) FROM salawat WHERE salawat.groupe_code = ${code} AND DATE(salawat.date) > CURRENT_DATE - 30`
		).rows[0].sum ?? 0;

	const somme365derniersJours: number =
		(
			await sql`SELECT SUM(nombre) FROM salawat WHERE salawat.groupe_code = ${code} AND DATE(salawat.date) > CURRENT_DATE - 365`
		).rows[0].sum ?? 0;

	const moyenneParticipant: number =
		sommeTotal /
		(await sql`SELECT COUNT(*) FROM salawat WHERE salawat.groupe_code = ${code}`).rows[0].count;

	const nombreJoursAvecSalawat = (
		await sql`SELECT COUNT(DISTINCT DATE(salawat.date)) FROM salawat WHERE salawat.groupe_code = ${code}`
	).rows[0].count;

	const moyenneJour = sommeTotal / nombreJoursAvecSalawat;

	const nombreParticipantsAujourdhui: number =
		(
			await sql`SELECT COUNT(DISTINCT user_secret) FROM salawat WHERE salawat.groupe_code = ${code} AND DATE(salawat.date) = CURRENT_DATE`
		).rows[0].count ?? 0;

	const nombreParticipants: number = (
		await sql`SELECT COUNT(DISTINCT user_secret) FROM salawat WHERE salawat.groupe_code = ${code}`
	).rows[0].count;

	const recordJournee: number = (
		await sql`SELECT MAX(somme) FROM (SELECT SUM(nombre) AS somme FROM salawat WHERE salawat.groupe_code = ${code} GROUP BY DATE(salawat.date)) AS somme`
	).rows[0].max;

	const res = (
		await sql`SELECT DATE(salawat.date) AS date, SUM(nombre) AS nombre FROM salawat WHERE salawat.groupe_code = ${code} GROUP BY DATE(salawat.date)`
	).rows;

	const jourNombre: { date: string; nombre: number }[] = [];
	res.forEach((row) => {
		jourNombre.push({ date: row.date, nombre: row.nombre });
	});

	return new Response(
		JSON.stringify(
			new GroupData(
				code,
				sommeTotal,
				sommeAujourdhui,
				nombreParticipantsAujourdhui,
				nombreParticipants,
				groupeData.name,
				groupeData.objectif_journalier,
				groupeData.objectif_total,
				somme7derniersJours,
				somme30derniersJours,
				somme365derniersJours,
				moyenneParticipant,
				nombreJoursAvecSalawat,
				moyenneJour,
				recordJournee,
				jourNombre
			)
		)
	);
}
