import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../styles/Navbar.module.css';
import { useRouter } from 'next/router';
import { isSignedIn } from '../utils/auth';

const Navbar: React.FC = () => {
    const [signedIn, setSignedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setSignedIn(isSignedIn());
    }, []);

    const handleSignOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role'); // Remove role from localStorage
        setSignedIn(false);
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
                {signedIn && (
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