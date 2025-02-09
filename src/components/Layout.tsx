import React from 'react';
import Head from 'next/head';
import Navbar from './Navbar';
import styles from '../styles/Layout.module.css';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className={styles.layout}>
            <Head>
                <title>Bestopia – A utopia of the best products.</title>
                <meta name="description" content="Discover the best products curated just for you at Bestopia. Your utopia for quality and excellence." />
            </Head>
            <Navbar />
            <main className={styles.main}>
                {children}
            </main>
            <footer className={styles.footer}>
                <p>&copy; 2025 Bestopia. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Layout;
