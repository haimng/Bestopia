import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import styles from '../../styles/NewReview.module.css';
import { apiPost } from '../../utils/api';
import { isAdmin } from '../../utils/auth';

const NewReviewPage: React.FC = () => {
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [introduction, setIntroduction] = useState('');
    const [coverPhoto, setCoverPhoto] = useState('');
    const [productDetails, setProductDetails] = useState('');
    const [productReviews, setProductReviews] = useState('');
    const [reviewDetails, setReviewDetails] = useState('');
    const [gender, setGender] = useState('all');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isAuthorized, setIsAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!isAdmin()) {
            router.push('/signin');
        } else {
            setIsAuthorized(true);
        }
    }, [router]);

    const handlePostReview = async () => {
        setLoading(true);
        setError('');

        try {
            const newReview = await apiPost('/reviews', {
                title: title.trim(),
                subtitle: subtitle.trim(),
                introduction: introduction.trim(),
                coverPhoto: coverPhoto.trim(),
                productDetails: productDetails.trim(),
                productReviews: productReviews.trim(),
                gender: gender
            });
            router.push(`/reviews/${newReview.slug}`);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReviewDetailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setReviewDetails(value);

        const lines = value.trim().split('\n');
        if (lines.length > 1) {
            const [title, subtitle, introduction] = lines[1].split('\t').map((field: string) => field.trim());
            setTitle(title || '');
            setSubtitle(subtitle || '');
            setIntroduction(introduction || '');
        }
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
                <div className={styles.form}>
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
                        Review Details (TSV format: title	subtitle	introduction):
                        <textarea
                            value={reviewDetails}
                            onChange={handleReviewDetailsChange}
                            className={styles.textarea}
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
                    <label className={styles.label}>
                        Gender:
                        <select value={gender} onChange={(e) => setGender(e.target.value)} className={styles.select}>
                            <option value="all">All gender</option>
                            <option value="woman">Woman only</option>
                            <option value="man">Man only</option>
                        </select>
                    </label>
                    {error && <p className={`${styles.error} ${styles.centered}`}>{error}</p>}
                    <button onClick={handlePostReview} className={styles.submitButton} disabled={loading}>
                        {loading ? 'Posting...' : 'Post Review'}
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default NewReviewPage;
