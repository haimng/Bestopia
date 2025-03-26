import { GetServerSideProps } from 'next';
import { getReviewsByTag } from '../../utils/db';
import Layout from '../../components/Layout';
import styles from '../../styles/Home.module.css';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';

interface TagPageProps {
    tag: string;
    reviews: { id: number; title: string; slug: string; cover_photo?: string; subtitle?: string; introduction?: string }[];
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { tag } = context.query;

    if (typeof tag !== 'string') {
        return {
            notFound: true,
        };
    }

    const reviews = await getReviewsByTag(tag);

    if (!reviews || reviews.rows.length === 0) {
        return {
            notFound: true,
        };
    }

    const serializedReviews = reviews.rows.map((review: any) => ({
        id: review.id,
        title: review.title,
        slug: review.slug,
        cover_photo: review.cover_photo,
        subtitle: review.subtitle,
        introduction: review.introduction,
    }));

    return {
        props: {
            tag,
            reviews: serializedReviews,
        },
    };
};

export default function TagPage({ tag, reviews }: TagPageProps) {
    return (
        <Layout>
            <Head>
                <title>Top reviews for {tag} - Bestopia</title>
                <meta name="description" content={`Explore top reviews for ${tag} on Bestopia.`} />
            </Head>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Top reviews for {tag}</h1>
                </header>
                <main className={styles.main}>
                    <section className={styles.reviews}>
                        {reviews.map((review, index) => (
                            <div key={index} className={styles.review} id={`review${index + 1}`}>
                                <Link href={`/reviews/${review.slug}`} legacyBehavior>
                                    <a className={styles.link}>
                                        {review.cover_photo && (
                                            <img src={review.cover_photo} alt={review.title} className={styles.coverPhoto} />
                                        )}
                                    </a>
                                </Link>
                                <Link href={`/reviews/${review.slug}`} legacyBehavior>
                                    <a className={`${styles.reviewTitleLink} ${styles.link}`}>
                                        <h3>{review.title}</h3>
                                    </a>
                                </Link>
                                {review.subtitle && <h4>{review.subtitle}</h4>}
                                {review.introduction && (
                                    <p>
                                        {review.introduction.split('\n').map((line, index) => (
                                            <React.Fragment key={index}>
                                                {line}
                                                <br />
                                            </React.Fragment>
                                        ))}
                                    </p>
                                )}
                            </div>
                        ))}
                    </section>
                </main>
            </div>
        </Layout>
    );
}
