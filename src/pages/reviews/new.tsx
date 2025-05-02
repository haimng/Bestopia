import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import styles from '../../styles/NewReview.module.css';
import { apiPost, apiPut } from '../../utils/api';
import { isAdmin } from '../../utils/auth';

const NewReviewPage: React.FC = () => {
    const [product_name, setProductName] = useState('');
    const [gptResponse, setGptResponse] = useState('');
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
    const [askGPTLoading, setAskGPTLoading] = useState(false); // Add a new state for the "Ask GPT" button
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

            try {
              const lastProduct = newReview.products[newReview.products.length - 1];
              await apiPut(`/products/${lastProduct.id}`, { ...lastProduct, crawl_product: true });
            }
            catch (error) {
              console.error('Error updating product:', error);
            }

            router.push(`/reviews/edit?id=${newReview.id}`);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReviewDetailsChange = (e: React.ChangeEvent<HTMLTextAreaElement> | string) => {
        const value = typeof e === 'string' ? e : e.target.value;
        setReviewDetails(value);

        const lines = value.trim().split('\n');
        if (lines.length > 1) {
            const [title, subtitle, introduction] = lines[1].split('\t').map((field: string) => field.trim());
            setTitle(title || '');
            setSubtitle(subtitle || '');
            setIntroduction(introduction || '');
        }
    };

    const handlePaste = async (callback: (text: string) => void) => {
        try {
            const text = await navigator.clipboard.readText();
            callback(text);
        } catch (error) {
            console.error('Failed to read clipboard contents:', error);
        }
    };

    const handleAskGPT = async () => {
        setAskGPTLoading(true); // Set loading state for "Ask GPT" button
        setError('');
        try {
            const response = await apiPost('/reviews', { product_name: product_name.trim() });

            const { gptResponse, task1, task2, task3 } = response;
            setGptResponse(gptResponse || '');
            handleReviewDetailsChange(`title\tsubtitle\tintroduction\n${task1[0].title}\t${task1[0].subtitle}\t${task1[0].introduction}`);
            setProductDetails(`name\tdescription\n${task2.map((item: any) => `${item.name}\t${item.description}`).join('\n')}`);
            setProductReviews(`review_text\n${task3.map((item: any) => `${item.review_text}`).join('\n')}`);
        } catch (error: any) {
            setError('Failed to generate review using GPT.');
        } finally {
            setAskGPTLoading(false); // Reset loading state
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
                        Product Name:
                        <input
                            type="text"
                            value={product_name}
                            onChange={(e) => setProductName(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </label>
                    <label className={styles.label}>
                        GPT Response:
                        <textarea
                            value={gptResponse}
                            className={styles.textarea}
                            readOnly
                        />
                    </label>
                    <button
                        type="button"
                        onClick={handleAskGPT}
                        className={styles.submitButton}
                        disabled={askGPTLoading} // Disable the button when loading
                    >
                        {askGPTLoading ? 'Asking...' : 'Ask GPT'} {/* Change text based on loading state */}
                    </button>
                    <br /><br /><br />
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
                        <button
                            type="button"
                            onClick={() => handlePaste(handleReviewDetailsChange)}
                            className={styles.pasteButton}
                        >
                            Paste
                        </button>
                        <textarea
                            value={reviewDetails}
                            onChange={handleReviewDetailsChange}
                            className={styles.textarea}
                        />
                    </label>
                    <label className={styles.label}>
                        Product Details (TSV format: name	description	image_url	product_page):
                        <button
                            type="button"
                            onClick={() => handlePaste(setProductDetails)}
                            className={styles.pasteButton}
                        >
                            Paste
                        </button>
                        <textarea
                            value={productDetails}
                            onChange={(e) => setProductDetails(e.target.value)}
                            className={styles.textarea}
                            required
                        />
                    </label>
                    <label className={styles.label}>
                        Product Reviews (TSV format: rating	review_text	user_id):
                        <button
                            type="button"
                            onClick={() => handlePaste(setProductReviews)}
                            className={styles.pasteButton}
                        >
                            Paste
                        </button>
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
