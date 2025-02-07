import React from 'react';
import Layout from '../components/Layout';
import styles from '../styles/Reviews.module.css';
import { getProducts } from '../utils/db';

interface Product {
    id: number;
    name: string;
    description: string;
    image_url: string;
    created_at: string;
    updated_at: string;
}

interface ReviewsProps {
    products: Product[];
}

const Reviews: React.FC<ReviewsProps> = ({ products }) => {
    return (
        <Layout>
            <div className={styles.container}>
                <h1 className={styles.title}>Best TVs Reviews</h1>
                <h2 className={styles.subtitle}>Top picks for the best viewing experience</h2>
                <p className={styles.introduction}>
                    Welcome to our comprehensive guide to the best TVs available on the market. Whether you're looking for the latest OLED technology or a budget-friendly option, we've got you covered. Read on to find the perfect TV for your needs.
                </p>
                <div className={styles.reviewList}>
                    {products.map((product) => (
                        <div key={product.id} className={styles.reviewItem}>
                            <img src={product.image_url} alt={product.name} className={styles.reviewImage} />
                            <h2 className={styles.reviewTitle}>{product.name}</h2>
                            <p className={styles.reviewContent}>{product.description}</p>
                            <button className={styles.buyButton}>Buy Now</button>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export async function getServerSideProps() {
    const products = await getProducts();
    const serializedProducts = Array.isArray(products) ? products.map((product: any) => ({
      ...product,
      created_at: product.created_at.toISOString(),
      updated_at: product.updated_at.toISOString(),
    })) : [];
    return {
        props: {
            products: serializedProducts,
        },
    };
}

export default Reviews;
