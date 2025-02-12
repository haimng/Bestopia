import React, { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import styles from '../styles/Signup.module.css';
import { useRouter } from 'next/router';

const Signup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, display_name: displayName, email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to sign up');
      }

      router.push('/signin');
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Sign Up - Bestopia</title>
      </Head>
      <div className={styles.container}>
        <h1 className={styles.title}>Sign Up</h1>
        {error && <p className={styles.error}>{error}</p>}
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="username">Username</label>
          <input
            className={styles.input}
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label className={styles.label} htmlFor="displayName">Display Name</label>
          <input
            className={styles.input}
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <label className={styles.label} htmlFor="email">Email</label>
          <input
            className={styles.input}
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label className={styles.label} htmlFor="password">Password</label>
          <input
            className={styles.input}
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className={styles.submitButton} type="submit">Sign Up</button>
        </form>
      </div>
    </Layout>
  );
};

export default Signup;
