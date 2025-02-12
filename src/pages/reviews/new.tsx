import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import styles from '../../styles/NewReview.module.css';

const NewReviewPage: React.FC = () => {
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [introduction, setIntroduction] = useState('');
    const [coverPhoto, setCoverPhoto] = useState('');
    const [productDetails, setProductDetails] = useState('');
    const [productReviews, setProductReviews] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isAuthorized, setIsAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== 'admin') {
            router.push('/signin');
        } else {
            setIsAuthorized(true);
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
                title: title.trim(),
                subtitle: subtitle.trim(),
                introduction: introduction.trim(),
                coverPhoto: coverPhoto.trim(),
                productDetails: productDetails.trim(),
                productReviews: productReviews.trim(),
            }),
        });

        if (response.ok) {
            const newReview = await response.json();
            router.push(`/reviews/${newReview.slug}`);
        } else {
            const errorData = await response.json();
            setError(errorData.error || 'Failed to post review');
        }
        setLoading(false);
    };

    if (!isAuthorized) {
        return null; // Render nothing while checking authorization
    }

    return (
        <Layout>
            <Head>
                <title>New Review</title>
            </Head>
            <div className={styles.container}>
                <h1 className={styles.title}>Post a New Review</h1>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <label className={styles.label}>
                        Title:
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </label>
                    <label className={styles.label}>
                        Subtitle:
                        <input
                            type="text"
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </label>
                    <label className={styles.label}>
                        Introduction:
                        <textarea
                            value={introduction}
                            onChange={(e) => setIntroduction(e.target.value)}
                            className={styles.textarea}
                            required
                        />
                    </label>
                    <label className={styles.label}>
                        Cover Photo URL:
                        <input
                            type="text"
                            value={coverPhoto}
                            onChange={(e) => setCoverPhoto(e.target.value)}
                            className={styles.input}
                        />
                    </label>
                    <label className={styles.label}>
                        Product Details (TSV format: name	description	image_url	product_page):
                        <textarea
                            value={productDetails}
                            onChange={(e) => setProductDetails(e.target.value)}
                            className={styles.textarea}
                            required
                        />
                    </label>
                    <label className={styles.label}>
                        Product Reviews (TSV format: rating	review_text	user_id):
                        <textarea
                            value={productReviews}
                            onChange={(e) => setProductReviews(e.target.value)}
                            className={styles.textarea}
                            required
                        />
                    </label>
                    {error && <p className={`${styles.error} ${styles.centered}`}>{error}</p>}
                    <button type="submit" className={styles.submitButton} disabled={loading}>
                        {loading ? 'Posting...' : 'Post Review'}
                    </button>
                </form>
            </div>
        </Layout>
    );
};

export default NewReviewPage;
