import React, { useState } from 'react';
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
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
            router.push('/reviews');
        } else {
            console.error('Failed to post review');
        }
    };

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
                    <button type="submit" className={styles.submitButton}>Post Review</button>
                </form>
            </div>
        </Layout>
    );
};

export default NewReviewPage;
