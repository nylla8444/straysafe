/** @type {import('next').NextConfig} */
const nextConfig = {
    // Your existing configuration
    serverExternalPackages: ['cloudinary', 'mongoose'],
    serverRuntimeConfig: {
        maxBodySize: '10mb',
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    experimental: {
        // Your experimental configurations
        serverActions: {
            bodySizeLimit: '10mb'
        },
        optimizePackageImports: [
            'react', 'react-dom', 'next', 'swr'
        ],
        serverComponentsHmrCache: true,
        ...(process.env.NODE_ENV === 'development' && {
            webpackBuildWorker: true
        })
    },

    // Add Turbopack configuration here
    turbopack: {
        // Mirror your webpack configuration
        resolveExtensions: ['.mjs', '.js', '.jsx', '.json', '.ts', '.tsx'],
        // If you're using any webpack loaders, configure them here
        rules: {
            // Example SVG handling if needed
            '*.svg': {
                loaders: ['@svgr/webpack'],
                as: '*.js',
            },
        },
    },

    // Keep your existing webpack configuration
    webpack(config) {
        if (process.env.NODE_ENV === 'development') {
            config.cache = true;
        }
        return config;
    },

    // Your headers configuration
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=30, stale-while-revalidate=300',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
