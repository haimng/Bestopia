import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import styles from '../../styles/Home.module.css';
import { GetServerSideProps } from 'next';
import { Review } from '../../types';
import { getPagedReviews } from '../../utils/db'; // Ensure this import is correct
import Link from 'next/link';
import { useRouter } from 'next/router';
import { isAdmin } from '../../utils/auth';
import { apiGet } from '../../utils/api';

type ReviewsPageProps = {
  reviews: Review[];
  totalPages: number;
  currentPage: number;
};

const ReviewsPage: React.FC<ReviewsPageProps> = ({ reviews, totalPages, currentPage }) => {
  const router = useRouter();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredReviews, setFilteredReviews] = useState(reviews);
  const [totalPagesState, setTotalPages] = useState(totalPages);
  const [currentPageState, setCurrentPage] = useState(currentPage);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsAdminUser(isAdmin());
  }, []);

  useEffect(() => {
    setFilteredReviews(reviews);
  }, [reviews]);

  useEffect(() => {
    setTotalPages(totalPages);
  }, [totalPages]);

  useEffect(() => {
    setCurrentPage(currentPage);
  }, [currentPage]);

  const handleSearch = async (page: number = 1) => {
    if (searchKeyword.trim()) {
      setIsSearching(true);
      try {
        const { reviews, totalPages } = await apiGet(`/reviews/search?keyword=${encodeURIComponent(searchKeyword)}&page=${page}`);
        setFilteredReviews(reviews);
        setTotalPages(totalPages);
        setCurrentPage(page);
      } catch (error) {
        console.error('Error searching reviews:', error);
      }
    } else {
      setFilteredReviews(reviews);
      setTotalPages(totalPages);      
      setCurrentPage(currentPage);
      setIsSearching(false);      
    }
  };

  const handleNewReview = () => {
    router.push('/reviews/new');
  };

  return (
    <Layout>
      <Head>
        <title>All Reviews - Bestopia</title>
        <meta name="description" content="Read all the latest reviews on Bestopia. Stay updated with the newest insights and detailed analyses." />
      </Head>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>All Reviews</h1>
          {isAdminUser && <button className={styles.newButton} onClick={handleNewReview}>New</button>}
        </header>
        <div className={styles.searchContainer}>
          <div className={styles.formGroup}>            
            <input
              type="text"
              placeholder="Search reviews"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className={styles.input}
            />
          </div>
        </div>
        <main className={styles.main}>
          <section className={styles.reviews}>
            {filteredReviews && filteredReviews.map((review, index) => (
              <div key={index} className={styles.review} id={`review${index + 1}`}>
                <Link href={`/reviews/${review.slug}`} legacyBehavior>
                  <a className={styles.link}>
                    <img src={review.cover_photo} alt={review.title} className={styles.coverPhoto} />
                  </a>
                </Link>
                <Link href={`/reviews/${review.slug}`} legacyBehavior>
                  <a className={`${styles.reviewTitleLink} ${styles.link}`}>
                    <h3>{review.title}</h3>
                  </a>
                </Link>
                <h4>{review.subtitle}</h4>
                <p>
                  {review.introduction.split('\n').map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </p>
              </div>
            ))}
          </section>
          <div className={styles.pagination}>
            {currentPageState > 1 && (
              <Link href={`/reviews?page=${currentPageState - 1}`} legacyBehavior>
                <a className={styles.pageButton}>{'<'}</a>
              </Link>
            )}
            {Array.from({ length: totalPagesState }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page >= currentPageState - 2 &&
                  page <= currentPageState + 2
              )
              .map((page) => (
                <Link key={page} href={`/reviews?page=${page}`} legacyBehavior>
                  <a
                    className={`${styles.pageButton} ${page === currentPageState ? styles.activePage : ''}`}
                  >
                    {page}
                  </a>
                </Link>
              ))}
            {currentPageState < totalPagesState && (
              <Link href={`/reviews?page=${currentPageState + 1}`} legacyBehavior>
                <a className={styles.pageButton}>{'>'}</a>
              </Link>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const page = parseInt(context.query.page as string) || 1;
  const { reviews, totalPages } = await getPagedReviews(page, 20);

  const serializedReviews = reviews.map((review: any) => ({
    ...review,
    created_at: review.created_at.toISOString(),
    updated_at: review.updated_at.toISOString(),
  }));

  return {
    props: {
      reviews: serializedReviews || [],
      totalPages,
      currentPage: page,
    },
  };
};

export default ReviewsPage;
