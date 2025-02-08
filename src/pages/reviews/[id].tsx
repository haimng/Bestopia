import React from 'react';
import { GetServerSideProps } from 'next';
import Layout from '../../components/Layout';
import styles from '../../styles/Reviews.module.css';
import { getReviewById, getProductsByReviewId, getProductReviewsByProductId } from '../../utils/db';

interface Product {
    id: number;
    name: string;
    description: string;
    image_url: string;
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
}

interface Review {
    id: number;
    title: string;
    subtitle: string;
    introduction: string;
    created_at: string;
    updated_at: string;
}

interface ReviewPageProps {
    review: Review;
    products: Product[];
}

const ReviewPage: React.FC<ReviewPageProps> = ({ review, products }) => {
    return (
        <Layout>
            <div className={styles.container}>
                <h1 className={styles.title}>{review.title}</h1>
                <h2 className={styles.subtitle}>{review.subtitle}</h2>
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
                                        <p>{review.review_text} — <span className={styles.displayName}><i>{review.display_name}</i></span></p>
                                    </div>
                                ))}
                            </div>
                            <button className={styles.buyButton}>Buy Now</button>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { id } = context.params!;
    const review = await getReviewById(Number(id));
    const products = await getProductsByReviewId(Number(id));

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
