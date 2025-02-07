import React, { ReactNode } from 'react';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';

const Home: React.FC = () => {
  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>Welcome to Bestopia</h1>
        <p className={styles.description}>A utopia of the best products.</p>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Product 1 &rarr;</h3>
            <p>Find in-depth information about Product 1.</p>
          </div>
          <div className={styles.card}>
            <h3>Product 2 &rarr;</h3>
            <p>Find in-depth information about Product 2.</p>
          </div>
          <div className={styles.card}>
            <h3>Product 3 &rarr;</h3>
            <p>Find in-depth information about Product 3.</p>
          </div>
          <div className={styles.card}>
            <h3>Product 4 &rarr;</h3>
            <p>Find in-depth information about Product 4.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;