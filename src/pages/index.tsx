import React, { ReactNode } from 'react';
import styles from '../styles/Home.module.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      {/* Layout content */}
      {children}
    </div>
  );
};

const Home: React.FC = () => {
  return (
    <Layout>
      <div className={styles.container}>
        <h1>Welcome to Bestopia</h1>
        <p>A utopia of the best products.</p>
      </div>
    </Layout>
  );
};

export default Home;