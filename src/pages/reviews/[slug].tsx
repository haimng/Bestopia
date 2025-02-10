import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import Layout from '../../components/Layout';
import styles from '../../styles/Reviews.module.css';
import { getReviewBySlug, getProductsByReviewId, getProductReviewsByProductId } from '../../utils/db';

interface Product {
    id: number;
    name: string;
    description: string;
    image_url: string;
    product_page: string;
    created_at: string;
    updated_at: string;
    reviews: ProductReview[];
}

interface ProductReview {
    id: number;
    user_id: number;
    rating: number;
    review_text: string;
    created_at: string;
    updated_at: string;
    display_name: string;
    avatar: string;
}

interface Review {
    id: number;
    title: string;
    subtitle: string;
    introduction: string;
    created_at: string;
    updated_at: string;
    cover_photo: string;
}

interface ReviewPageProps {
    review: Review;
    products: Product[];
}

const ReviewPage: React.FC<ReviewPageProps> = ({ review, products }) => {
    const firstProductImageUrl = products.length > 0 ? products[0].image_url : '';

    return (
        <Layout>
            <Head>
                <title>{review.title}</title>
                <meta name="description" content={review.subtitle} />
            </Head>
            <div className={styles.container}>
                <h1 className={styles.title}>{review.title}</h1>
                <h2 className={styles.subtitle}>{review.subtitle}</h2>
                {review.cover_photo && review.cover_photo !== firstProductImageUrl && (
                    <img src={review.cover_photo} alt="Cover Photo" className={`${styles.coverPhoto} ${styles.responsiveImage}`} />
                )}
                <p className={styles.introduction}>{review.introduction}</p>
                <div className={styles.reviewList}>
                    {products.map((product) => (
                        <div key={product.id} className={styles.reviewItem}>
                            <img src={product.image_url} alt={product.name} className={styles.reviewImage} />
                            <h2 className={styles.reviewTitle}>{product.name}</h2>
                            <p className={styles.reviewContent}>{product.description}</p>
                            <div className={styles.productReviews}>
                                {product.reviews.map((review) => (
                                    <div key={review.id} className={styles.productReview}>
                                        <p><strong>Rating:</strong> {review.rating}</p>
                                        <p>{review.review_text.split('\n').map((line, index) => (
                                            <React.Fragment key={index}>
                                                {line}
                                                <br />
                                            </React.Fragment>
                                        ))}</p>
                                        <p className={styles.reviewer}>
                                          <span className={styles.displayName}>
                                              <i>— {review.display_name}</i>
                                              <img src={review.avatar} alt="Avatar" className={styles.avatar} />
                                          </span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <a href={product.product_page} target="_blank" rel="noopener noreferrer">
                                <button className={styles.buyButton}>See Price</button>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { slug } = context.params!;
    if (typeof slug !== 'string') {
        return {
            notFound: true,
        };
    }
    const review = await getReviewBySlug(slug);
    const products = await getProductsByReviewId(review.id);

    const serializedReview = {
        ...review,
        created_at: review.created_at.toISOString(),
        updated_at: review.updated_at.toISOString(),
    };

    const serializedProducts = await Promise.all(products.map(async (product: any) => {
        const reviews = await getProductReviewsByProductId(product.id) || [];
        return {
            ...product,
            created_at: product.created_at.toISOString(),
            updated_at: product.updated_at.toISOString(),
            reviews: Array.isArray(reviews) ? reviews.map((review: any) => ({
                ...review,
                created_at: review.created_at.toISOString(),
                updated_at: review.updated_at.toISOString(),
                display_name: review.display_name,
                avatar: review.avatar || null,
            })): [],
        };
    }));

    return {
        props: {
            review: serializedReview,
            products: serializedProducts,
        },
    };
};

export default ReviewPage;
