import React from 'react';
import Head from 'next/head';
import Navbar from './Navbar';
import styles from '../styles/Layout.module.css';
import { DOMAIN } from '../constants';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className={styles.layout}>
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
