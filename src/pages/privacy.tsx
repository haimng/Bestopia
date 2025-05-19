import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import Link from 'next/link';
import styles from '../styles/About.module.css';

const Privacy: React.FC = () => {
    return (
        <Layout>
            <Head>
                <title>Privacy Policy - Bestopia</title>
                <meta name="description" content="Read the privacy policy for Bestopia. Learn how we collect, use, and protect your personal information." />
            </Head>
            <div className={styles.container}>
                <h1 className={styles.title}>Privacy Policy</h1>
                <p className={styles.paragraph}>
                    <strong>Privacy Policy</strong><br /><br />

                    <strong>Effective Date:</strong> Jan 1, 2025<br /><br />

                    Welcome to Bestopia! Your privacy is important to us. This Privacy Policy outlines the types of information we collect, how it is used, and the steps we take to safeguard your data when you visit our website, https://bestopia.net. Please read this policy carefully to understand our views and practices regarding your personal information.<br /><br />

                    <strong>1. Who We Are</strong><br />
                    Bestopia is an independently run affiliate website dedicated to helping users find the best products through honest reviews, curated research, and unbiased recommendations. We earn commissions through affiliate links when users click and purchase products on external retailer sites (such as Amazon) — at no extra cost to you.<br /><br />

                    <strong>2. Information We Collect</strong><br />
                    We collect two types of data from users:<br /><br />

                    <strong>a. Non-Personal Information (Automatically Collected)</strong><br />
                    When you visit our site, we may automatically collect information including:<br /><br />

                    Browser type and version<br />
                    Operating system<br />
                    Device type<br />
                    Referring website<br />
                    IP address<br />
                    Date/time of visit<br />
                    Pages visited and time spent<br /><br />

                    This data is collected via cookies, web beacons, and similar technologies to analyze user behavior and improve site performance.<br /><br />

                    <strong>b. Personal Information (Voluntarily Provided)</strong><br />
                    You may choose to share information with us, such as:<br /><br />

                    Your name and email address (e.g., when you contact us or sign up for a newsletter)<br />
                    Feedback or messages you send to us<br /><br />

                    We collect this information only when you voluntarily provide it.<br /><br />

                    <strong>3. Use of Information</strong><br />
                    We use collected information to:<br /><br />

                    Improve website functionality and user experience<br />
                    Analyze traffic and usage patterns<br />
                    Respond to inquiries or feedback<br />
                    Send occasional emails (only if you’ve opted in)<br />
                    Track affiliate link performance to earn commissions<br /><br />

                    We do not sell, rent, or trade your personal information to third parties.<br /><br />

                    <strong>4. Cookies and Tracking Technologies</strong><br />
                    Bestopia uses cookies and similar technologies to personalize content, measure traffic, and enhance usability. Cookies may store information like user preferences and past activity on our site.<br /><br />

                    You can control cookies through your browser settings. Note that disabling cookies may affect site functionality.<br /><br />

                    We also use third-party services (like Google Analytics and affiliate programs such as Amazon Associates), which may set their own cookies to gather browsing data across websites.<br /><br />

                    <strong>5. Affiliate Disclosure</strong><br />
                    Some of the links on Bestopia are affiliate links. This means we may earn a commission if you click through and make a purchase — at no extra cost to you. These commissions help support our work and allow us to continue providing free, research-based content.<br /><br />

                    We only recommend products we truly believe in, and our editorial integrity is never influenced by compensation.<br /><br />

                    <strong>6. Third-Party Links</strong><br />
                    Our website contains links to external websites. We are not responsible for the privacy practices or content of those third-party sites. Please review their respective privacy policies before submitting any personal data.<br /><br />

                    <strong>7. Data Security</strong><br />
                    We take reasonable measures to protect your data from unauthorized access, disclosure, alteration, or destruction. While no online system is 100% secure, we strive to maintain the integrity and confidentiality of your information.<br /><br />

                    <strong>8. Children’s Privacy</strong><br />
                    Bestopia does not knowingly collect personal information from individuals under the age of 13. If you believe we may have inadvertently collected such data, please contact us immediately so we can delete it.<br /><br />

                    <strong>9. Your Privacy Rights</strong><br />
                    Depending on your jurisdiction, you may have rights such as:<br /><br />

                    Accessing the personal data we hold about you<br />
                    Requesting correction or deletion of your data<br />
                    Opting out of data processing<br /><br />

                    To make such a request, contact us at: support@makerhai.com<br /><br />

                    <strong>10. Updates to This Policy</strong><br />
                    We may update this Privacy Policy from time to time to reflect changes in technology, law, or business operations. Updates will be posted on this page with a revised "Effective Date."<br /><br />

                    We encourage you to review this policy periodically to stay informed about how we protect your data.<br /><br />

                    <strong>11. Contact Us</strong><br />
                    If you have any questions or concerns about this Privacy Policy, reach out to us anytime <Link href="/about#contact-us">here</Link>.
                    <br /><br />                    
                </p>
            </div>
        </Layout>
    );
};

export default Privacy;