import React from 'react';
import Layout from '../components/Layout';
import styles from '../styles/Reviews.module.css';

const Reviews: React.FC = () => {
    return (
        <Layout>
            <div className={styles.container}>
                <h1 className={styles.title}>Best TVs Reviews</h1>
                <h2 className={styles.subtitle}>Top picks for the best viewing experience</h2>
                <p className={styles.introduction}>
                    Welcome to our comprehensive guide to the best TVs available on the market. Whether you're looking for the latest OLED technology or a budget-friendly option, we've got you covered. Read on to find the perfect TV for your needs.
                </p>
                <div className={styles.reviewList}>
                    <div className={styles.reviewItem}>
                        <img src="/images/tv-model-1.jpg" alt="TV Model 1" className={styles.reviewImage} />
                        <h2 className={styles.reviewTitle}>TV Model 1</h2>
                        <p className={styles.reviewContent}>Review content for TV Model 1...</p>
                        <button className={styles.buyButton}>Buy Now</button>
                    </div>
                    <div className={styles.reviewItem}>
                        <img src="/images/tv-model-2.jpg" alt="TV Model 2" className={styles.reviewImage} />
                        <h2 className={styles.reviewTitle}>TV Model 2</h2>
                        <p className={styles.reviewContent}>Review content for TV Model 2...</p>
                        <button className={styles.buyButton}>Buy Now</button>
                    </div>
                    {/* Add more review items as needed */}
                </div>
            </div>
        </Layout>
    );
};

export default Reviews;
