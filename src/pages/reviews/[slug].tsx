import React from 'react';
import Head from 'next/head';
import { GetStaticProps, GetStaticPaths } from 'next';
import Layout from '../../components/Layout';
import Link from 'next/link';
import styles from '../../styles/Reviews.module.css';
import { getReviewBySlug, getProductsByReviewId, getProductReviewsByProductId, getRandomReviews, getProductComparisonsByProductIds } from '../../utils/db';
import { DOMAIN } from '../../constants';
import {
    FacebookShareButton,
    TwitterShareButton,
    LinkedinShareButton,
    FacebookIcon,
    TwitterIcon,
    LinkedinIcon
} from 'react-share';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { isAdmin } from '../../utils/auth';

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

interface ReviewPageProps {
    review: Review;
    products: Product[];
    randomReviews: Review[];
    productComparisons: any[];
}

const ReviewPage: React.FC<ReviewPageProps> = ({ review, products, randomReviews, productComparisons }) => {
    const router = useRouter();
    const [isAdminUser, setIsAdminUser] = useState(false);

    useEffect(() => {
        setIsAdminUser(isAdmin());
    }, []);

    const firstProductImageUrl = products.length > 0 ? products[0].image_url : '';
    const firstReviewer = products.length > 0 && products[0].reviews.length > 0 ? products[0].reviews[0].display_name : 'Emily Johnson';
    const shareUrl = `${DOMAIN}/reviews/${review.slug}`;

    const priceValidUntil = new Date();
    priceValidUntil.setMonth(priceValidUntil.getMonth() + 3);
    const priceValidUntilString = priceValidUntil.toISOString().split('T')[0];

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Review",
        "name": review.title,
        "author": {
            "@type": "Person",
            "name": firstReviewer
        },
        "datePublished": review.created_at,
        "reviewBody": review.introduction,
        "itemReviewed": products.map(product => ({
            "@type": "Product",
            "name": product.name,
            "image": product.image_url,
            "description": product.description,
            "offers": {
                "@type": "Offer",
                "url": product.product_page,
                "priceCurrency": "USD",
                "price": "0.00",
                "priceValidUntil": priceValidUntilString,
                "shippingDetails": {
                    "@type": "OfferShippingDetails",
                    "shippingRate": {
                        "@type": "MonetaryAmount",
                        "value": "0.00",
                        "currency": "USD"
                    },
                    "deliveryTime": {
                        "@type": "ShippingDeliveryTime",
                        "businessDays": {
                            "@type": "OpeningHoursSpecification",
                            "dayOfWeek": [
                                "Monday",
                                "Tuesday",
                                "Wednesday",
                                "Thursday",
                                "Friday",
                                "Saturday",
                                "Sunday"
                            ],
                            "opens": "00:00",
                            "closes": "23:59"
                        },
                        "handlingTime": {
                            "@type": "QuantitativeValue",
                            "minValue": 1,
                            "maxValue": 2,
                            "unitCode": "DAY"
                        },
                        "transitTime": {
                            "@type": "QuantitativeValue",
                            "minValue": 3,
                            "maxValue": 5,
                            "unitCode": "DAY"
                        }
                    }
                },
                "hasMerchantReturnPolicy": true,
                "availability": "https://schema.org/InStock"
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length,
                "reviewCount": product.reviews.length
            }
        }))
    };

    const extractDomain = (url: string) => {
      try {
        const domain = new URL(url).hostname.replace('www.', '');
        return domain.charAt(0).toUpperCase() + domain.slice(1);
      } catch (error) {
        return '';
      }
    };

    return (
        <Layout>
            <Head>
                <title>{review.title}</title>
                <meta name="description" content={review.subtitle} />
                <meta property="og:title" content={review.title} />
                <meta property="og:description" content={review.subtitle} />
                <meta property="og:image" content={review.cover_photo || firstProductImageUrl} />
                <meta property="og:url" content={shareUrl} />
                <meta property="og:type" content="article" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={review.title} />
                <meta name="twitter:description" content={review.subtitle} />
                <meta name="twitter:image" content={review.cover_photo || firstProductImageUrl} />
                <meta name="twitter:site" content="@Bestopia" />
                <link rel="canonical" href={shareUrl} />
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            </Head>
            <div className={styles.container}>
                {isAdminUser && (
                    <Link href={`/reviews/edit?id=${review.id}`} legacyBehavior>
                        <a className={styles.editButton}>Edit</a>
                    </Link>
                )}
                <h1 className={styles.title}>{review.title}</h1>
                <h2 className={styles.subtitle}>{review.subtitle}</h2>
                {review.cover_photo && review.cover_photo !== firstProductImageUrl && (
                    <img src={review.cover_photo} alt="Cover Photo" className={`${styles.coverPhoto} ${styles.responsiveImage}`} />
                )}
                <p className={styles.introduction}>
                    {review.introduction.split('\n').map((line, index) => (
                        <React.Fragment key={index}>
                            {line}
                            <br />
                        </React.Fragment>
                    ))}
                </p>

                {productComparisons.length > 0 && <h3>Product Comparison</h3>}
                {productComparisons.length > 0 && (
                    <div id="comparison-table" className={styles.comparisonTable}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th></th>
                                    {products.map(product => (
                                        <th key={product.id}>
                                            {product.image_url && (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className={`${styles.productImage} ${styles.responsiveImage}`}
                                                />
                                            )}
                                            <p style={{margin: "10px 0"}}>{product.name}</p>
                                            {product.product_page && (
                                              <div>
                                                <a href={`${product.product_page.split('?')[0]}?tag=bestopia-20&linkCode=ll1`} target="_blank" rel="nofollow noopener noreferrer">
                                                    <button className={`${styles.buyButton} ${styles.smallButton}`}>See Price</button>
                                                </a>
                                                <div className={styles.amazonDisclosure}>
                                                  <small>#ad: {extractDomain(product.product_page)}</small>
                                                </div>
                                              </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(
                                    productComparisons.reduce((acc: any, comparison: any) => {
                                        if (!acc[comparison.aspect]) {
                                            acc[comparison.aspect] = {};
                                        }
                                        acc[comparison.aspect][comparison.product_id] = comparison.comparison_point;
                                        return acc;
                                    }, {})
                                ).map(([aspect, points]: any, index) => (
                                    <tr key={index}>
                                        <td><strong>{aspect}</strong></td>
                                        {products.map(product => (
                                            <td key={product.id}>{points[product.id] || ''}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}    

                <div className={styles.reviewList}>
                    {products.map((product) => (
                        <div key={product.id} className={styles.reviewItem}>
                            {product.image_url && (
                                <img 
                                    src={product.image_url} 
                                    alt={product.name} 
                                    className={`${styles.reviewImage} ${product.image_url.includes('amazon.com') ? styles.amazonImage : ''}`} 
                                />
                            )}
                            <h2 className={styles.reviewTitle}>{product.name}</h2>
                            <p className={styles.reviewContent}>
                                {product.description.split('\n').map((line, index) => (
                                    <React.Fragment key={index}>
                                        {line}
                                        <br />
                                    </React.Fragment>
                                ))}
                            </p>
                            <div className={styles.productReviews}>
                                {product.reviews.map((review) => (
                                    <div key={review.id} className={styles.productReview}>
                                        <p><strong>Rating:</strong> {review.rating}</p>
                                        <p>{review.review_text.split('\n').map((line, index) => (
                                            <React.Fragment key={index}>
                                                {line}
                                                <br />
                                            </React.Fragment>
                                        ))}</p>
                                        <p className={styles.reviewer}>
                                          <span className={styles.displayName}>
                                              <i>— {review.display_name}</i>
                                              <img src={review.avatar} alt="Avatar" className={styles.avatar} />
                                          </span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                            {product.product_page && (
                              <a href={`${product.product_page.split('?')[0]}?tag=bestopia-20&linkCode=ll1`} target="_blank" rel="nofollow noopener noreferrer">
                                  <button className={styles.buyButton}>See Price</button>
                              </a>
                            )}
                            {product.product_page && 
                              <p className={styles.amazonDisclosure}>
                                <small>#ad: {extractDomain(product.product_page)}</small>
                              </p>
                            }
                        </div>
                    ))}
                </div>
                <div className={styles.socialShare}>
                    <FacebookShareButton url={shareUrl}>
                        <FacebookIcon size={50} round />
                    </FacebookShareButton>
                    <TwitterShareButton url={shareUrl} title={review.title}>
                        <TwitterIcon size={50} round />
                    </TwitterShareButton>
                    <LinkedinShareButton url={shareUrl} title={review.title} summary={review.subtitle}>
                        <LinkedinIcon size={50} round />
                    </LinkedinShareButton>
                </div>
                <section className={styles.readMore}>
                    <h2>Read More</h2>
                    <div className={styles.readMoreList}>
                        {randomReviews.map((randomReview, index) => (
                            <div key={index} className={styles.readMoreItem}>
                                <Link href={`/reviews/${randomReview.slug}`} legacyBehavior>
                                    <a className={styles.link}>
                                        <img src={randomReview.cover_photo} alt={randomReview.title} className={styles.coverPhoto} />
                                    </a>
                                </Link>
                                <Link href={`/reviews/${randomReview.slug}`} legacyBehavior>
                                    <a className={`${styles.reviewTitleLink} ${styles.link}`}>
                                        <h3>{randomReview.title}</h3>
                                    </a>
                                </Link>
                                <h4>{randomReview.subtitle}</h4>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export const getStaticPaths: GetStaticPaths = async () => {
    // You may want to fetch all slugs here for pre-rendering
    // For now, fallback: 'blocking' to allow on-demand generation
    return {
        paths: [],
        fallback: 'blocking',
    };
};

export const getStaticProps: GetStaticProps = async (context) => {
    const { slug } = context.params!;
    if (typeof slug !== 'string') {
        return {
            notFound: true,
        };
    }
    const review = await getReviewBySlug(slug);
    if (!review) {
        return {
            notFound: true,
        };
    }
    const products = await getProductsByReviewId(review.id);
    const randomReviews = await getRandomReviews();
    const productComparisons = await getProductComparisonsByProductIds(products.map(product => product.id));

    const serializedReview = {
        ...review,
        created_at: review.created_at.toISOString(),
        updated_at: review.updated_at.toISOString(),
    };

    const serializedProducts = await Promise.all(products.map(async (product: any) => {
        const reviews = await getProductReviewsByProductId(product.id) || [];
        return {
            ...product,
            created_at: product.created_at.toISOString(),
            updated_at: product.updated_at.toISOString(),
            reviews: Array.isArray(reviews) ? reviews.map((review: any) => ({
                ...review,
                created_at: review.created_at.toISOString(),
                updated_at: review.updated_at.toISOString(),
                display_name: review.display_name,
                avatar: review.avatar || null,
            })): [],
        };
    }));

    const serializedProductComparisons = productComparisons.map((comparison: any) => ({
      ...comparison,
      created_at: comparison.created_at.toISOString(),
      updated_at: comparison.updated_at.toISOString(),
    }));

    const serializedRandomReviews = randomReviews.map((randomReview: any) => ({
        ...randomReview,
        created_at: new Date(randomReview.created_at).toISOString(),
        updated_at: new Date(randomReview.updated_at).toISOString(),
    }));

    return {
        props: {
            review: serializedReview,
            products: serializedProducts,            
            productComparisons: serializedProductComparisons,
            randomReviews: serializedRandomReviews,
        },
        revalidate: 604800, // Revalidate every 1 week
    };
};

export default ReviewPage;
