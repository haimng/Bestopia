import React from 'react';
import Layout from '../components/Layout';
import styles from '../styles/About.module.css';

const About: React.FC = () => {
    return (
        <Layout>
            <div className={styles.container}>
                <h1 className={styles.title}>About Bestopia</h1>
                <img src="/img/company_photo1.jpg" alt="Company Photo" className={styles.companyPhoto} />
                <p className={styles.paragraph}>
                  Welcome to Bestopia! We're a small team passionate about finding the best products and sharing honest, reliable reviews. Our goal is simple: to help you make informed choices with thorough research and unbiased recommendations.<br /><br /> 
                  Founded in 2025, Bestopia was born from our love for discovering quality products and guiding others to the best options. We’re committed to accuracy, trustworthiness, and making product research easier for you.<br /><br /> 
                  We hope our reviews help you find exactly what you need. If you have any questions or feedback, feel free to reach out!<br /><br /> 
                  The Bestopia Team
                </p>
            </div>
        </Layout>
    );
};

export default About;
