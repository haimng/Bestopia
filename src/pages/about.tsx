import React, { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import styles from '../styles/About.module.css';
import { apiPost } from '../utils/api';

const About: React.FC = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const trimmedEmail = email.trim();
            const trimmedMessage = message.trim();

            if (!trimmedEmail || !trimmedMessage) {
                console.error('Email and message cannot be empty.');
                return;
            }

            const response = await apiPost('/support_requests', { email: trimmedEmail, message: trimmedMessage });
            setSuccessMessage('Thank you for your contact!');
            setEmail('');
            setMessage('');
        } catch (error) {
            console.error('Error submitting support request:', error);
        }
    };

    return (
        <Layout>
            <Head>
                <title>About Us - Bestopia</title>
                <meta name="description" content="Learn more about Bestopia, our mission, and our team. Discover how we provide honest and reliable reviews to help you make informed choices." />
            </Head>
            <div className={styles.container}>
                <h1 className={styles.title}>About Bestopia</h1>
                <img src="/img/company_photo1.jpg" alt="Company Photo" className={styles.companyPhoto} />
                <p className={styles.paragraph}>
                  Welcome to Bestopia! We're a small team passionate about finding the best products and sharing honest, reliable reviews. Our goal is simple: to help you make informed choices with thorough research and unbiased recommendations.<br /><br /> 
                  Founded in 2025, Bestopia was born from our love for discovering quality products and guiding others to the best options. We’re committed to accuracy, trustworthiness, and making product research easier for you.<br /><br /> 
                  We hope our reviews help you find exactly what you need. If you have any questions or feedback, feel free to reach out!<br /><br /> 
                  The Bestopia Team
                </p>
                <br/>
                <hr className={styles.sectionDivider} />
                <br/>
                <h3 className={styles.subtitle}>Contact Us</h3>
                <div className={styles.formContainer}>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <label htmlFor="email" className={styles.label}>Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            required
                        />
                        <label htmlFor="message" className={styles.label}>Message:</label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className={styles.textarea}
                            required
                        ></textarea>
                        {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
                        <button type="submit" className={styles.submitButton}>Submit</button>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default About;
