import { NextApiRequest, NextApiResponse } from 'next';
import { getProducts } from '../../utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const products = await getProducts();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
}
