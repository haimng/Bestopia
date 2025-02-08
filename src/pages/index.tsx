import React from 'react';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';
import { GetServerSideProps } from 'next';
import { Review } from '../types';
import { getTopReviews } from '../utils/db';

type HomeProps = {
  reviews: Review[];
};

const Home: React.FC<HomeProps> = ({ reviews }) => {
  return (
    <Layout>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Bestopia</h1>
          <nav className={styles.nav}>
            {reviews && reviews.map((review, index) => (
              <a key={index} href={`#review${index + 1}`} className={styles.navItem}>
                {review.title}
              </a>
            ))}
          </nav>
        </header>
        <main className={styles.main}>
          <section className={styles.featured}>
            <h2 className={styles.featuredTitle}>Featured Review</h2>
            <p className={styles.featuredDescription}>Discover the latest and greatest in our featured review.</p>
          </section>
          <section className={styles.reviews}>
            {reviews && reviews.map((review, index) => (
              <div key={index} className={styles.review} id={`review${index + 1}`}>
                <h3>{review.title}</h3>
                <h4>{review.subtitle}</h4>
                <p>{review.introduction}</p>
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