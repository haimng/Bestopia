import '../styles/globals.css';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Component {...pageProps} />
            <SpeedInsights />
        </>
    );
}

export default MyApp;
