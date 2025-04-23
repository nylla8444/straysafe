/** @type {import('next').NextConfig} */
const nextConfig = {
    // External packages for server components - moved from experimental
    serverExternalPackages: ['cloudinary'],

    // Configure larger payload sizes
    serverRuntimeConfig: {
        maxBodySize: '10mb', // This works for API routes
    },

    // Add this images configuration
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

    // Any other experimental features you need
    experimental: {
        // Empty for now, add any other experimental features here
    },
};

export default nextConfig;
