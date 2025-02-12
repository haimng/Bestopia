import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../styles/Navbar.module.css';
import { useRouter } from 'next/router';

const Navbar: React.FC = () => {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsSignedIn(!!token);
    }, []);

    const handleSignOut = () => {
        localStorage.removeItem('token');
        setIsSignedIn(false);
        router.push('/signin');
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.navbarContent}>
                <Link href="/">
                    <div className={styles.logo}>
                        <img src="/bestopia_logo.png" alt="Bestopia Logo" />
                    </div>
                </Link>
                {isSignedIn && (
                    <button className={styles.signOutButton} onClick={handleSignOut}>Sign Out</button>
                )}
            </div>
            <ul>
                <li>
                    <Link href="/">Home</Link>
                </li>
                <li>
                    <Link href="/reviews">Reviews</Link>
                </li>
                <li>
                    <Link href="/about">About</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;