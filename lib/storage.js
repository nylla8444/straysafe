import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToStorage = async (file, options = {}) => {
    try {
        // Convert the file to a base64 data URI for Cloudinary upload
        const buffer = await file.arrayBuffer();
        const base64String = Buffer.from(buffer).toString('base64');
        const dataURI = `data:${file.type};base64,${base64String}`;

        // Default options
        const defaultOptions = {
            folder: 'straysafe-verification', // Default folder
            resource_type: 'auto', // Auto-detect file type
            transformation: [
                { quality: 'auto' }, // Automatic quality optimization
                { fetch_format: 'auto' } // Automatic format optimization
            ]
        };

        // Merge default options with provided options
        const uploadOptions = { ...defaultOptions, ...options };

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, uploadOptions);

        console.log('File uploaded to Cloudinary:', result.secure_url);

        return {
            url: result.secure_url, // HTTPS URL
            publicId: result.public_id, // Cloudinary ID for future reference
            filename: file.name
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error(`File upload failed: ${error.message}`);
    }
};