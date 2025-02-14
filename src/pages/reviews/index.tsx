import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import styles from '../../styles/Home.module.css';
import { GetServerSideProps } from 'next';
import { Review } from '../../types';
import { getPagedReviews } from '../../utils/db'; // Ensure this import is correct
import Link from 'next/link';
import { useRouter } from 'next/router';
import { isAdmin } from '../../utils/auth';

type ReviewsPageProps = {
  reviews: Review[];
  totalPages: number;
  currentPage: number;
};

const ReviewsPage: React.FC<ReviewsPageProps> = ({ reviews, totalPages, currentPage }) => {
  const router = useRouter();
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    setIsAdminUser(isAdmin());
  }, []);

  const handlePageChange = (page: number) => {
    router.push(`/reviews?page=${page}`);
  };

  const handleNewReview = () => {
    router.push('/reviews/new');
  };

  return (
    <Layout>
      <Head>
        <title>All Reviews - Bestopia</title>
        <meta name="description" content="Read all the latest reviews on Bestopia. Stay updated with the newest insights and detailed analyses." />
      </Head>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>All Reviews</h1>
          {isAdminUser && <button className={styles.newButton} onClick={handleNewReview}>New</button>}
        </header>
        <main className={styles.main}>
          <section className={styles.reviews}>
            {reviews && reviews.map((review, index) => (
              <div key={index} className={styles.review} id={`review${index + 1}`}>
                <Link href={`/reviews/${review.slug}`} legacyBehavior>
                  <a className={styles.link}>
                    <img src={review.cover_photo} alt={review.title} className={styles.coverPhoto} />
                  </a>
                </Link>
                <Link href={`/reviews/${review.slug}`} legacyBehavior>
                  <a className={`${styles.reviewTitleLink} ${styles.link}`}>
                    <h3>{review.title}</h3>
                  </a>
                </Link>
                <h4>{review.subtitle}</h4>
                <p>
                  {review.introduction.split('\n').map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </p>
              </div>
            ))}
          </section>
          <div className={styles.pagination}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`${styles.pageButton} ${i + 1 === currentPage ? styles.activePage : ''}`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const page = parseInt(context.query.page as string) || 1;
  const { reviews, totalPages } = await getPagedReviews(page, 20);

  const serializedReviews = reviews.map((review: any) => ({
    ...review,
    created_at: review.created_at.toISOString(),
    updated_at: review.updated_at.toISOString(),
  }));

  return {
    props: {
      reviews: serializedReviews || [],
      totalPages,
      currentPage: page,
    },
  };
};

export default ReviewsPage;
