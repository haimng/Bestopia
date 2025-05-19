import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import styles from '../styles/About.module.css';

const Terms: React.FC = () => {
    return (
        <Layout>
            <Head>
                <title>Terms of Use - Bestopia</title>
                <meta name="description" content="Read the terms and conditions for using Bestopia. Learn about your rights, responsibilities, and our policies." />
            </Head>
            <div className={styles.container}>
                <h1 className={styles.title}>Terms of Use</h1>
                <p className={styles.paragraph}>
                    <strong>Terms of Use</strong><br /><br />

                    Effective Date: January 1, 2025<br /><br />

                    Welcome to Bestopia! These Terms of Use ("Terms") govern your access to and use of the Bestopia website (https://bestopia.net) ("Site"), operated by Bestopia ("we," "our," or "us"). By accessing or using our Site, you agree to be bound by these Terms. If you do not agree with any of these Terms, please do not use our Site.<br /><br />

                    <strong>1. Purpose of Our Website</strong><br />
                    Bestopia is a content-driven website that provides product reviews, rankings, comparisons, and recommendations. We are an independent team dedicated to helping users make better purchasing decisions by offering researched insights and curated suggestions.<br /><br />

                    Some of the links on our Site are affiliate links. This means if you click on the link and purchase an item, we may receive a commission at no additional cost to you. Our recommendations are based on independent analysis and are not influenced by any advertiser or affiliate partner.<br /><br />

                    <strong>2. Affiliate Disclosure</strong><br />
                    In compliance with the Federal Trade Commission (FTC) guidelines, Bestopia discloses that it has affiliate relationships with various merchants. When you make a purchase through affiliate links on our Site, we may earn a commission. However, all opinions expressed are our own, and our editorial content is not influenced by affiliate partnerships.<br /><br />

                    We aim to keep our content honest, accurate, and up-to-date. We only recommend products we believe provide value to our readers.<br /><br />

                    <strong>3. Content Accuracy and No Guarantee</strong><br />
                    While we strive to provide accurate, current, and helpful information, we cannot guarantee the completeness, reliability, or timeliness of all content. Product availability, prices, specifications, and features may change without notice.<br /><br />

                    We are not liable for any inaccuracies or omissions or for any losses, damages, or inconveniences that may result from reliance on the content presented on our Site.<br /><br />

                    <strong>4. User Responsibilities</strong><br />
                    By using Bestopia, you agree to:<br /><br />

                    Use the Site for personal and non-commercial purposes only.<br />
                    Not reproduce, duplicate, copy, sell, resell, or exploit any portion of the Site without express written permission from us.<br />
                    Refrain from using our Site for any unlawful purpose or in violation of any applicable laws or regulations.<br /><br />

                    <strong>5. Intellectual Property Rights</strong><br />
                    All content on Bestopia—including articles, graphics, logos, and design elements—is the property of Bestopia and is protected by copyright, trademark, and other intellectual property laws. You may not reproduce or distribute any part of the Site’s content without our prior written consent.<br /><br />

                    <strong>6. Third-Party Links</strong><br />
                    Our Site contains links to third-party websites, including affiliate partners. These websites are not owned or controlled by Bestopia, and we are not responsible for their content, privacy policies, or business practices. Your interactions with those websites are governed by their terms and policies, not ours.<br /><br />

                    <strong>7. Limitation of Liability</strong><br />
                    To the fullest extent permitted by law, Bestopia and its affiliates, employees, or contributors shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your access to or use of the Site or reliance on any information provided.<br /><br />

                    <strong>8. Disclaimer</strong><br />
                    Bestopia makes no warranties or representations of any kind, express or implied, regarding the Site or its content. All content is provided "as is" and "as available" without warranties of any kind, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.<br /><br />

                    <strong>9. Privacy Policy</strong><br />
                    Your use of Bestopia is also governed by our Privacy Policy, which outlines how we collect, use, and protect your personal information. Please review it to understand our data practices.<br /><br />

                    <strong>10. Changes to the Terms</strong><br />
                    We reserve the right to update or modify these Terms at any time. When we do, we will revise the “Effective Date” at the top of this page. Your continued use of the Site after changes signifies your acceptance of the updated Terms.<br /><br />

                    <strong>11. Termination</strong><br />
                    We reserve the right to suspend or terminate access to the Site, in whole or in part, at our discretion and without notice, for conduct that we believe violates these Terms or is harmful to other users or us.<br /><br />

                    Thank you for visiting Bestopia and trusting us to help you make informed purchasing decisions!<br /><br />
                </p>
            </div>
        </Layout>
    );
};

export default Terms;