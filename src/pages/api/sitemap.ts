import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../utils/db';
import { DOMAIN } from '../../constants'; // Add this line

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT slug FROM reviews ORDER BY created_at ASC LIMIT 1000');
            const slugs = result.rows.map((row: any) => row.slug);

            const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
                <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                    ${slugs.map((slug: string) => `
                        <url>
                            <loc>${DOMAIN}/reviews/${slug}</loc> <!-- Update this line -->
                            <changefreq>weekly</changefreq>
                        </url>
                    `).join('')}
                </urlset>`;

            res.setHeader('Content-Type', 'application/xml');
            res.status(200).send(sitemap);
        } catch (error: any) {
            console.error('Error generating sitemap:', error);
            res.status(500).json({ error: 'Failed to generate sitemap', details: error.message || 'Unknown error' });
        } finally {
            client.release();
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
