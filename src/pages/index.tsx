import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';
import { GetServerSideProps } from 'next';
import { Review } from '../types';
import { getTopReviews } from '../utils/db';
import { DOMAIN } from '../constants';
import Link from 'next/link';

type HomeProps = {
  reviews: Review[];
};

const Home: React.FC<HomeProps> = ({ reviews }) => {
  return (
    <Layout>
      <Head>
        <title>Bestopia – A utopia of the best products.</title>
        <meta name="description" content="Discover the best products curated just for you at Bestopia. Your utopia for quality and excellence." />
        <meta property="og:title" content="Bestopia – A utopia of the best products." />
        <meta property="og:description" content="Discover the best products curated just for you at Bestopia. Your utopia for quality and excellence." />
        <meta property="og:image" content="/bestopia_logo.png" />
        <meta property="og:url" content={DOMAIN} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Bestopia – A utopia of the best products." />
        <meta name="twitter:description" content="Discover the best products curated just for you at Bestopia. Your utopia for quality and excellence." />
        <meta name="twitter:image" content="/bestopia_logo.png" />
        <meta name="twitter:site" content="@Bestopia" />
      </Head>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.titleGroup} style={{ textAlign: 'left' }}>
            <h1 className={styles.title}>Bestopia</h1>
            <h2 className={styles.subtitle}>A utopia of the best products.</h2>
          </div>
          <nav className={styles.nav}>
            {reviews && reviews.slice(0, 10).map((review, index) => (
              <Link key={index} href={`/reviews/${review.slug}`} legacyBehavior>
                <a className={`${styles.navItem} ${styles.link}`}>
                  {review.title}
                </a>
              </Link>
            ))}
          </nav>
        </header>
        <main className={styles.main}>
          <section className={styles.featured}>
            <h2 className={styles.featuredTitle}>Featured Reviews</h2>
            <p className={styles.featuredDescription}>Discover the latest and greatest in our featured reviews.</p>
          </section>
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
        </main>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const reviews = await getTopReviews();

  return {
    props: {
      reviews: reviews || [],
    },
  };
};

export default Home;