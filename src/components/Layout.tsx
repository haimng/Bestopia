import React from 'react';
import Navbar from './Navbar';
import styles from '../styles/Layout.module.css';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className={styles.layout}>
            <Navbar />
            <main className={styles.main}>
                {children}
            </main>
            <footer className={styles.footer}>
                <p>&copy; 2025 Bestopia. All rights reserved.</p>
                <p>
                    <a href="https://www.youtube.com/@Bestopia_net" target="_blank" rel="noopener noreferrer">
                        <img src="/img/youtube_logo.png" alt="Bestopia - YouTube" className={styles.youtubeLogo} />
                    </a>
                </p>
            </footer>
        </div>
    );
};

export default Layout;
