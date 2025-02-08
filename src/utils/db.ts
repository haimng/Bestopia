import { Pool } from 'pg';
import dotenv from 'dotenv';

interface Product {
    id: number;
    name: string;
    price: number;
    // Add other fields as necessary
}

dotenv.config();

const connection = new Pool({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: parseInt(process.env.PG_PORT || '5432', 10),
});

export const getReviewById = async (id: number) => {
    const res = await connection.query('SELECT * FROM reviews WHERE id = $1', [id]);
    return res.rows[0];
};

export const getProductsByReviewId = async (reviewId: number): Promise<Product[]> => {
  const query = 'SELECT * FROM products WHERE review_id = $1';
  const res = await connection.query(query, [reviewId]);
  return res.rows as Product[];
};

export const getProductReviewsByProductId = async (productId: number) => {
    const query = `
        SELECT pr.*, u.display_name 
        FROM product_reviews pr
        JOIN users u ON pr.user_id = u.id
        WHERE pr.product_id = $1
    `;
    const res = await connection.query(query, [productId]);
    return res.rows;
};

export default connection;
