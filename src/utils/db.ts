import { Pool } from 'pg';
import dotenv from 'dotenv';

interface Product {
    id: number;
    name: string;
    price: number;
    // Add other fields as necessary
}

dotenv.config();

interface Review {
    id: number;
    title: string;    
    // Add other fields as necessary
}

const isProduction = process.env.NODE_ENV === 'production';

const connection = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: parseInt(process.env.PGPORT || '5432', 10),
    ssl: process.env.PGNOSSL ? false : { rejectUnauthorized: false }
});

export const getReviewById = async (id: number) => {
    const res = await connection.query('SELECT * FROM reviews WHERE id = $1', [id]);
    return res.rows[0];
};

export const getProductsByReviewId = async (reviewId: number): Promise<Product[]> => {
  const query = 'SELECT * FROM products WHERE review_id = $1 ORDER BY id ASC';
  const res = await connection.query(query, [reviewId]);
  return res.rows as Product[];
};

export const getProductReviewsByProductId = async (productId: number) => {
    const query = `
        SELECT pr.*, u.display_name 
        FROM product_reviews pr
        JOIN users u ON pr.user_id = u.id
        WHERE pr.product_id = $1
        ORDER BY pr.id ASC
    `;
    const res = await connection.query(query, [productId]);
    return res.rows;
};

export const getTopReviews = async (): Promise<Review[]> => {
  const res = await connection.query('SELECT * FROM reviews ORDER BY id DESC LIMIT 10');
  return res.rows.map(review => ({
    ...review,
    created_at: review.created_at.toISOString(), // Convert Date to string
    updated_at: review.updated_at.toISOString(), // Convert Date to string
  })) as Review[];
};

export default connection;
