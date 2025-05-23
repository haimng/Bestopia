import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import styles from '../../styles/NewReview.module.css';
import { getReviewById, getProductsByReviewId, getProductComparisonsByProductIds } from '../../utils/db';
import { isAdmin } from '../../utils/auth';
import { apiPut, apiPost } from '../../utils/api';

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
    tags?: string; // Added the 'tags' property
}

interface EditReviewPageProps {
    review: Review;
    products: Product[];
    serializedProductComparisons: any[]; // Add serializedProductComparisons to props
    product_comparisons: any[]; // Add product_comparisons to props
}
const EditReviewPage: React.FC<EditReviewPageProps> = ({ review, products, product_comparisons }) => {
    const router = useRouter();
    const [editableReview, setEditableReview] = useState(review);
    const [editableProducts, setEditableProducts] = useState(products);
    const [isAdminUser, setIsAdminUser] = useState(false);
    const [loadingReview, setLoadingReview] = useState(false);
    const [loadingProduct, setLoadingProduct] = useState<number | null>(null);
    const [reviewError, setReviewError] = useState('');
    const [imageDimensions, setImageDimensions] = useState<{ [key: number]: { width: number, height: number } }>({});
    const [coverPhotoDimensions, setCoverPhotoDimensions] = useState<{ width: number, height: number } | null>(null);
    const [productErrors, setProductErrors] = useState<{ [key: number]: string }>({});
    const [productComparisons, setProductComparisons] = useState(() => {
        if (product_comparisons.length > 0) {
            const header = ['aspect', ...editableProducts.map(product => product.id)].join('\t');
            const rows = product_comparisons.reduce((acc: any, comparison: any) => {
                if (!acc[comparison.aspect]) {
                    acc[comparison.aspect] = [];
                }
                acc[comparison.aspect][comparison.product_id] = comparison.comparison_point;
                return acc;
            }, {});

            const formattedRows = Object.entries(rows).map(([aspect, points]: any) => {
                const row = [aspect, ...editableProducts.map(product => points[product.id] || '')];
                return row.join('\t');
            });

            return [header, ...formattedRows].join('\n');
        }

        const productData = editableProducts.map(product => ({
            product_id: product.id,
            product_name: product.name,
            product_description: product.description,
            product_url: product.product_page,
        }));
        const productDataText = JSON.stringify(productData, null, 2);

        return `Look up data from these products below and create a comparison table in TSV format.
The first line should be in lowercase.
Product ids are in the first line.
The aspects text should be in Title Case like this sample: "Rear Camera".
The number of aspects to compare should be up to 10.
Don't add product's Price, Name, Title, Availability and URL to aspects.

=== Comparison table format => Should be in TSV format (tab separated values):
aspect  ${editableProducts.map(product => product.id).join('\t')}
Aspect 1  Point 1.1  Point 2.1  Point 3.1  Point 4.1  Point 5.1
Aspect 2  Point 1.2  Point 2.2  Point 3.2  Point 4.2  Point 5.2
Aspect 3  Point 1.3  Point 2.3  Point 3.3  Point 4.3  Point 5.3

=== Product Data:
${productDataText}`;
    });
    const [saveComparisonsError, setSaveComparisonsError] = useState('');
    const [isSavingComparisons, setIsSavingComparisons] = useState(false);
    const [copyButtonText, setCopyButtonText] = useState('Copy');

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
            console.error(error);
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
            console.error(error);
            setProductErrors((prevErrors) => ({ ...prevErrors, [productId]: 'Failed to update product' }));
        } finally {
            setLoadingProduct(null);
        }
    };

    const handleCrawlProduct = async (productId: number) => {
        setLoadingProduct(productId);
        setProductErrors((prevErrors) => ({ ...prevErrors, [productId]: '' }));
        try {
            const product = editableProducts.find(product => product.id === productId);
            if (product) {
                const updatedProduct = await apiPut(`/products/${product.id}`, { ...product, crawl_product: true });
                setEditableProducts(editableProducts.map(p => p.id === productId ? updatedProduct : p));
            }
        } catch (error) {
            console.error(error);
            setProductErrors((prevErrors) => ({ ...prevErrors, [productId]: 'Failed to crawl product' }));
        } finally {
            setLoadingProduct(null);
        }
    };

    const handleImageLoad = (productId: number, event: React.SyntheticEvent<HTMLImageElement>) => {
        const img = event.currentTarget;
        setImageDimensions(prev => ({
            ...prev,
            [productId]: { width: img.naturalWidth, height: img.naturalHeight }
        }));
    };

    const handleCoverPhotoLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
        const img = event.currentTarget;
        setCoverPhotoDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };

    const handlePaste = (setter: React.Dispatch<React.SetStateAction<string>>) => {
        navigator.clipboard.readText().then(text => {
            setter(text);
        }).catch(err => {
            console.error('Failed to read clipboard contents: ', err);
        });
    };

    const handleAskGPT = async (comparisons: string) => {
        // Implement the logic to handle "Ask GPT" functionality
        console.log('Ask GPT for comparisons:', comparisons);
    };

    const handleSaveComparisons = async (comparisons: any) => {
        setSaveComparisonsError('');
        setIsSavingComparisons(true);
        try {
            const result = await apiPost('/product_comparisons', {
                productComparisons: comparisons,
                productIds: editableProducts.map(product => product.id),
            });
            console.log('Product comparisons saved successfully:', result);
        } catch (error) {
            console.error('Error saving product comparisons:', error);
            setSaveComparisonsError('Failed to save product comparisons. Please try again.');
        } finally {
            setIsSavingComparisons(false);
        }
    };

    const handleCopyClick = () => {
        navigator.clipboard.writeText(productComparisons).then(() => {
            setCopyButtonText('Copied');
            setTimeout(() => setCopyButtonText('Copy'), 3000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
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
                    <label className={styles.label}>Tags (comma-separated):</label>
                    <input
                        type="text"
                        value={editableReview.tags || ''}
                        onChange={(e) => handleReviewChange('tags', e.target.value)}
                        className={styles.input}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Cover Photo URL:</label>
                    {editableReview.cover_photo && (
                        <div>
                            <span>
                                {coverPhotoDimensions && `${coverPhotoDimensions.width}x${coverPhotoDimensions.height}`}
                            </span>
                            <img
                                src={editableReview.cover_photo}
                                alt="Cover Photo"
                                className={styles.editImagePreview}
                                onLoad={handleCoverPhotoLoad}
                            />
                        </div>
                    )}
                    <input
                        type="text"
                        value={editableReview.cover_photo}
                        onChange={(e) => handleReviewChange('cover_photo', e.target.value)}
                        className={styles.input}
                    />                    
                </div>
                {reviewError && <p className={styles.error}>{reviewError}</p>}
                <button onClick={handleSaveReview} className={`${styles.submitButton} ${styles.smallButton}`} disabled={loadingReview}>
                    {loadingReview ? 'Saving...' : 'Save Review'}
                </button>
                <br />                
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
                            {product.image_url && (
                                <div>
                                    <span>
                                        {imageDimensions[product.id] && `${imageDimensions[product.id].width}x${imageDimensions[product.id].height}`}
                                    </span>
                                    <img
                                        src={product.image_url}
                                        alt="Product Image"
                                        className={styles.editImagePreview}
                                        onLoad={(e) => handleImageLoad(product.id, e)}
                                    />                                    
                                </div>
                            )}                            
                            <input
                                type="text"
                                value={product.image_url}
                                onChange={(e) => handleProductChange(product.id, 'image_url', e.target.value)}
                                className={styles.input}
                            />                            
                        </div>
                        <div className={styles.formGroup}>                                                                                    
                            <label className={styles.label}>
                              Product Page URL:                              
                            </label>                            
                            <a href={product.product_page} target="_blank" rel="noopener noreferrer" className={styles.buttonLink}>
                              See Product
                            </a>
                            <input
                                type="text"
                                value={product.product_page}
                                onChange={(e) => handleProductChange(product.id, 'product_page', e.target.value)}
                                className={styles.input}
                            />                            
                        </div>                        
                        {productErrors[product.id] && <p className={styles.error}>{productErrors[product.id]}</p>}
                        <div className={styles.buttonGroup}>
                            <button onClick={() => handleSaveProduct(product.id)} className={`${styles.submitButton} ${styles.smallButton}`} disabled={loadingProduct === product.id}>
                                {loadingProduct === product.id ? 'Saving...' : 'Save Product'}
                            </button>
                            <button onClick={() => handleCrawlProduct(product.id)} className={`${styles.submitButton} ${styles.smallButton}`} disabled={loadingProduct === product.id}>
                                {loadingProduct === product.id ? 'Crawling...' : 'Crawl Product'}
                            </button>
                        </div>
                        <br />                        
                        <br />
                        <br />
                    </div>
                ))}              
                <div className={styles.formGroup}>
                    <label className={styles.label}>
                        Product Comparisons:
                        <button
                            type="button"
                            onClick={handleCopyClick}
                            className={styles.pasteButton}
                        >
                            {copyButtonText}
                        </button>
                        <button
                            type="button"
                            onClick={() => handlePaste(setProductComparisons)}
                            className={styles.pasteButton}
                        >
                            Paste
                        </button>                        
                    </label>
                    <textarea
                        value={productComparisons}
                        onChange={(e) => setProductComparisons(e.target.value)}
                        className={styles.textarea}
                        required
                    />
                </div>  
                {saveComparisonsError && <p className={styles.error}>{saveComparisonsError}</p>}
                <div className={styles.buttonGroup}>
                    {/* <button onClick={() => handleAskGPT(productComparisons)} className={`${styles.submitButton} ${styles.smallButton}`}>
                        Ask GPT
                    </button> */}
                    <button onClick={() => handleSaveComparisons(productComparisons)} className={`${styles.submitButton} ${styles.smallButton}`}>
                        {isSavingComparisons ? 'Saving...' : 'Save Comparisons'}
                    </button>
                </div>
                <br />                        
                <br />
                <br />
                <Link href={`/reviews/${editableReview.slug}`} legacyBehavior>
                    <a className={styles.link}>
                        {editableReview.title}
                    </a>
                </Link>
                <br />
                <Link href="/reviews/new" legacyBehavior>
                    <a className={`${styles.borderButton}`}>New</a>
                </Link>
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
    const productComparisons = await getProductComparisonsByProductIds(products.map(product => product.id));

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

    const serializedProductComparisons = productComparisons.map((comparison: any) => ({
        ...comparison,
        created_at: comparison.created_at.toISOString(),
        updated_at: comparison.updated_at.toISOString(),
    }));

    return {
        props: {
            review: serializedReview,
            products: serializedProducts,
            product_comparisons: serializedProductComparisons,
        },
    };
};

export default EditReviewPage;
