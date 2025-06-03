// netlify/functions/get-signed-url.js
const cloudinary = require('cloudinary').v2;

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST' || !event.body) {
        return {
            statusCode: 405,
            body: 'Method Not Allowed'
        };
    }

    const { publicId } = JSON.parse(event.body);

    if (!publicId) {
        return {
            statusCode: 400,
            body: 'Missing publicId in request body'
        };
    }

    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        // --- THE CRUCIAL CHANGE IS HERE ---
        // For private assets that are meant for direct download, use private_download_url
        // It automatically handles the correct endpoint and signature
        const url = cloudinary.utils.private_download_url(
            publicId,
            'raw', // Specify the resource_type as 'raw' for documents
            {
                expires_at: Math.floor(Date.now() / 1000) + 3600 // URL valid for 1 hour
                // No need for 'secure: true' or 'type: "private"' or 'sign_url: true' here,
                // as private_download_url implicitly handles these for download.
                // It also uses the configured api_key and api_secret automatically.
            }
        );

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url })
        };
    } catch (error) {
        console.error("Error generating private download URL:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to generate private download URL', details: error.message })
        };
    }
};