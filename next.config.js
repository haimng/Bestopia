module.exports = {
    webpack: (config) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            net: false,
            tls: false,
            dns: false,
        };
        return config;
    },
    async headers() {
        return [
            {
                source: '/reviews/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=86400, s-maxage=86400, must-revalidate',
                    },
                ],
            },
        ];
    },
};
