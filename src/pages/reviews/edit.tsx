import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import styles from '../../styles/NewReview.module.css';
import { getReviewById, getProductsByReviewId } from '../../utils/db';
import { isAdmin } from '../../utils/auth';
import { apiPut } from '../../utils/api';

interface Product {
    id: number;
    name: string;
    description: string;
    image_url: string;
    product_page: string;
    created_at: string;
    updated_at: string;
    reviews: ProductReview[];
}

interface ProductReview {
    id: number;
    user_id: number;
    rating: number;
    review_text: string;
    created_at: string;
    updated_at: string;
    display_name: string;
    avatar: string;
}

interface Review {
    id: number;
    slug: string;
    title: string;
    subtitle: string;
    introduction: string;
    created_at: string;
    updated_at: string;
    cover_photo: string;
}

interface EditReviewPageProps {
    review: Review;
    products: Product[];
}

const EditReviewPage: React.FC<EditReviewPageProps> = ({ review, products }) => {
    const router = useRouter();
    const [editableReview, setEditableReview] = useState(review);
    const [editableProducts, setEditableProducts] = useState(products);
    const [isAdminUser, setIsAdminUser] = useState(false);
    const [loadingReview, setLoadingReview] = useState(false);
    const [loadingProduct, setLoadingProduct] = useState<number | null>(null);
    const [reviewError, setReviewError] = useState('');
    const [productErrors, setProductErrors] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        const adminStatus = isAdmin();
        setIsAdminUser(adminStatus);
        if (!adminStatus) {
            router.push('/signin');
        }
    }, [router]);

    if (!isAdminUser) {
        return null;
    }

    const handleReviewChange = (field: string, value: string) => {
        setEditableReview({ ...editableReview, [field]: value });
    };

    const handleProductChange = (productId: number, field: string, value: string) => {
        setEditableProducts(editableProducts.map(product =>
            product.id === productId ? { ...product, [field]: value } : product
        ));
    };

    const handleSaveReview = async () => {
        setLoadingReview(true);
        setReviewError('');
        try {
            const updatedReview = await apiPut(`/reviews/${editableReview.id}`, editableReview);
            setEditableReview(updatedReview);
        } catch (error) {
            console.error('Failed to update review:', error);
            setReviewError('Failed to update review');
        } finally {
            setLoadingReview(false);
        }
    };

    const handleSaveProduct = async (productId: number) => {
        setLoadingProduct(productId);
        setProductErrors((prevErrors) => ({ ...prevErrors, [productId]: '' }));
        try {
            const product = editableProducts.find(product => product.id === productId);
            if (product) {
                const updatedProduct = await apiPut(`/products/${product.id}`, product);
                setEditableProducts(editableProducts.map(p => p.id === productId ? updatedProduct : p));
            }
        } catch (error) {
            console.error('Failed to update product:', error);
            setProductErrors((prevErrors) => ({ ...prevErrors, [productId]: 'Failed to update product' }));
        } finally {
            setLoadingProduct(null);
        }
    };

    return (
        <Layout>
            <Head>
                <title>Edit Review - {editableReview.title}</title>                
            </Head>
            <div className={styles.container}>
                <h1 className={styles.title}>Edit Review</h1>
                <Link href={`/reviews/${editableReview.slug}`} legacyBehavior>
                    <a className={styles.link}>
                        {editableReview.title}
                    </a>
                </Link>
                <br/><br/>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Title:</label>
                    <input
                        type="text"
                        value={editableReview.title}
                        onChange={(e) => handleReviewChange('title', e.target.value)}
                        className={styles.input}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Subtitle:</label>
                    <input
                        type="text"
                        value={editableReview.subtitle}
                        onChange={(e) => handleReviewChange('subtitle', e.target.value)}
                        className={styles.input}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Introduction:</label>
                    <textarea
                        value={editableReview.introduction}
                        onChange={(e) => handleReviewChange('introduction', e.target.value)}
                        className={styles.textarea}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Cover Photo URL:</label>
                    <input
                        type="text"
                        value={editableReview.cover_photo}
                        onChange={(e) => handleReviewChange('cover_photo', e.target.value)}
                        className={styles.input}
                    />
                </div>
                {reviewError && <p className={styles.error}>{reviewError}</p>}
                <button onClick={handleSaveReview} className={styles.submitButton} disabled={loadingReview}>
                    {loadingReview ? 'Saving...' : 'Save Review'}
                </button>
                <br />                
                <br />
                <h2 className={styles.subtitle}>Products</h2>
                {editableProducts.map((product) => (
                    <div key={product.id} className={styles.productForm}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Name:</label>
                            <input
                                type="text"
                                value={product.name}
                                onChange={(e) => handleProductChange(product.id, 'name', e.target.value)}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Description:</label>
                            <textarea
                                value={product.description}
                                onChange={(e) => handleProductChange(product.id, 'description', e.target.value)}
                                className={styles.textarea}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Image URL:</label>
                            <input
                                type="text"
                                value={product.image_url}
                                onChange={(e) => handleProductChange(product.id, 'image_url', e.target.value)}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Product Page URL:</label>
                            <input
                                type="text"
                                value={product.product_page}
                                onChange={(e) => handleProductChange(product.id, 'product_page', e.target.value)}
                                className={styles.input}
                            />
                        </div>
                        {productErrors[product.id] && <p className={styles.error}>{productErrors[product.id]}</p>}
                        <button onClick={() => handleSaveProduct(product.id)} className={styles.submitButton} disabled={loadingProduct === product.id}>
                            {loadingProduct === product.id ? 'Saving...' : 'Save Product'}
                        </button>
                        <br />                        
                        <br />
                        <br />
                    </div>
                ))}
            </div>
        </Layout>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { id } = context.query;
    if (typeof id !== 'string') {
        return {
            notFound: true,
        };
    }
    const review = await getReviewById(parseInt(id));
    const products = await getProductsByReviewId(review.id);

    const serializedReview = {
        ...review,
        created_at: review.created_at.toISOString(),
        updated_at: review.updated_at.toISOString(),
    };

    const serializedProducts = products.map((product: any) => ({
        ...product,
        created_at: product.created_at.toISOString(),
        updated_at: product.updated_at.toISOString(),
    }));

    return {
        props: {
            review: serializedReview,
            products: serializedProducts,
        },
    };
};

export default EditReviewPage;
