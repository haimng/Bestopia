import React from 'react';
import Navbar from './Navbar';
import styles from './Layout.module.css';

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
                <p>&copy; 2023 Bestopia. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Layout;
