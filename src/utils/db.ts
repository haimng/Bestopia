import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

interface Product {
    id: number;
    name: string;
    price: number;
    // Add other fields as necessary
}

dotenv.config();

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

export async function getProducts() {
    const [rows] = await connection.query('SELECT * FROM products LIMIT 10');
    return rows;
}

export const getReviewById = async (id: number) => {
    const [rows, fields]: [any[], any[]] = await connection.query('SELECT * FROM reviews WHERE id = ?', [id]);
    return rows[0];
};

export const getProductsByReviewId = async (reviewId: number): Promise<Product[]> => {
  const query = 'SELECT * FROM products WHERE review_id = ?';
  const [results] = await connection.execute(query, [reviewId]);
  return results as Product[];
};


export default connection;
