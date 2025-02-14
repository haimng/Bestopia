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
                    <a href="https://www.youtube.com/@Bestopia_net" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><title>Bestopia - YouTube</title><path d="M21.5825 7.2C21.4694 6.77454 21.2464 6.38627 20.936 6.0741C20.6256 5.76192 20.2386 5.53679 19.8137 5.42125C18.2537 5 12 5 12 5C12 5 5.74625 5 4.18625 5.42125C3.76143 5.53679 3.37443 5.76192 3.06401 6.0741C2.75359 6.38627 2.53064 6.77454 2.4175 7.2C2 8.77 2 12.045 2 12.045C2 12.045 2 15.32 2.4175 16.89C2.53045 17.3157 2.75331 17.7042 3.06375 18.0166C3.37418 18.329 3.76128 18.5544 4.18625 18.67C5.74625 19.0913 12 19.0913 12 19.0913C12 19.0913 18.2537 19.0913 19.8137 18.67C20.2387 18.5544 20.6258 18.329 20.9363 18.0166C21.2467 17.7042 21.4696 17.3157 21.5825 16.89C22 15.3212 22 12.045 22 12.045C22 12.045 22 8.77 21.5825 7.2ZM9.955 15.0187V9.07125L15.1813 12.0463L9.955 15.0187Z" fill="white"></path></svg>
                    </a>
                    <a href="https://x.com/Bestopia_net" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><title>Bestopia - X</title><path d="M13.6468 10.4686L20.9321 2H19.2057L12.8799 9.3532L7.82741 2H2L9.6403 13.1193L2 22H3.72649L10.4068 14.2348L15.7425 22H21.5699L13.6464 10.4686H13.6468ZM11.2821 13.2173L10.508 12.1101L4.34857 3.29968H7.00037L11.9711 10.4099L12.7452 11.5172L19.2066 20.7594H16.5548L11.2821 13.2177V13.2173Z" fill="white"></path></svg>
                    </a>                    
                </p>
            </footer>
        </div>
    );
};

export default Layout;
