import { GetServerSideProps } from 'next';
import { getReviewById } from '../../utils/db';

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { review_id } = context.query;

    if (typeof review_id !== 'string') {
        return {
            notFound: true,
        };
    }

    const review = await getReviewById(parseInt(review_id));

    if (!review) {
        return {
            notFound: true,
        };
    }

    return {
        redirect: {
            destination: `/reviews/${review.slug}`,
            permanent: false,
        },
    };
};

export default function RedirectPage() {
    return null;
}
