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
    tags?: string; // Add the tags field
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

const reviewsFields = 'id, slug, title, subtitle, introduction, cover_photo, tags, created_at, updated_at';

export const getReviewById = async (id: number) => {
    const res = await connection.query(`SELECT ${reviewsFields} FROM reviews WHERE id = $1`, [id]);
    return res.rows[0];
};

export const getReviewBySlug = async (slug: string) => {
    const res = await connection.query(`SELECT ${reviewsFields} FROM reviews WHERE slug = $1`, [slug]);
    return res.rows[0];
};

export const getProductsByReviewId = async (reviewId: number): Promise<Product[]> => {
  const query = 'SELECT * FROM products WHERE review_id = $1 ORDER BY id ASC';
  const res = await connection.query(query, [reviewId]);
  return res.rows as Product[];
};

export const getProductReviewsByProductId = async (productId: number) => {
    const query = `
        SELECT pr.*, u.display_name, u.avatar
        FROM product_reviews pr
        JOIN users u ON pr.user_id = u.id
        WHERE pr.product_id = $1
        ORDER BY pr.id ASC
    `;
    const res = await connection.query(query, [productId]);
    return res.rows;
};

export const getProductComparisonsByProductId = async (productId: number) => {
  const query = `
      SELECT pc.*
      FROM product_comparisons pc
      WHERE pc.product_id = $1
      ORDER BY pc.id ASC
  `;
  const res = await connection.query(query, [productId]);
  return res.rows;
};

export const getProductComparisonsByProductIds = async (productIds: number[]) => {
    const query = `
        SELECT *
        FROM product_comparisons
        WHERE product_id = ANY($1::int[])
        ORDER BY product_id, id ASC;
    `;
    const res = await connection.query(query, [productIds]);
    return res.rows;
};

export const getTopReviews = async (): Promise<Review[]> => {
  const res = await connection.query(`SELECT ${reviewsFields} FROM reviews ORDER BY id DESC LIMIT 30`);
  return res.rows.map(review => ({
    ...review,
    created_at: review.created_at.toISOString(), // Convert Date to string
    updated_at: review.updated_at.toISOString(), // Convert Date to string
  })) as Review[];
};

export const getPagedReviews = async (page: number, pageSize: number = 20) => {
  const offset = (page - 1) * pageSize;
  const reviewsRes = await connection.query(`SELECT ${reviewsFields} FROM reviews ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [pageSize, offset]);
  const countRes = await connection.query('SELECT COUNT(*) FROM reviews');
  const totalPages = Math.ceil(parseInt(countRes.rows[0].count, 10) / pageSize);

  return {
    reviews: reviewsRes.rows,
    totalPages,
  };
};

export const getRandomReviews = async (limit: number = 10): Promise<Review[]> => {
  const res = await connection.query(`SELECT ${reviewsFields} FROM reviews ORDER BY RANDOM() LIMIT $1`, [limit]);
  return res.rows.map(review => ({
    ...review,
    created_at: review.created_at.toISOString(), // Convert Date to string
    updated_at: review.updated_at.toISOString(), // Convert Date to string
  })) as Review[];
};

export async function getReviewsByTag(tag: string) {
    return await connection.query(
        'SELECT id, title, slug, cover_photo, subtitle, introduction FROM reviews WHERE tags LIKE $1',
        [`%${tag}%`]
    );
}

export const searchReviewsByKeyword = async (keyword: string, page: number = 1, pageSize: number = 20) => {
    const offset = (page - 1) * pageSize;
    const reviewsRes = await connection.query(
        `SELECT ${reviewsFields} FROM reviews WHERE title_tsvector @@ plainto_tsquery('english', $1) LIMIT $2 OFFSET $3`,
        [keyword, pageSize, offset]
    );
    const countRes = await connection.query(
        `SELECT COUNT(*) FROM reviews WHERE title_tsvector @@ plainto_tsquery('english', $1)`,
        [keyword]
    );
    const totalPages = Math.ceil(parseInt(countRes.rows[0].count, 10) / pageSize);

    return {
        reviews: reviewsRes.rows.map(review => ({
            ...review,
            created_at: review.created_at.toISOString(),
            updated_at: review.updated_at.toISOString(),
        })),
        totalPages,
    };
};

export default connection;
