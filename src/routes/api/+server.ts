import { sql } from '@vercel/postgres';

const likes = 100;
const { rows, fields } = await sql`SELECT * FROM posts WHERE likes > ${likes} LIMIT 5;`;
