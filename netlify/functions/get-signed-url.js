// netlify/functions/get-signed-url.js
const cloudinary = require('cloudinary').v2;

exports.handler = async (event, context) => {
    // Ensure this is a POST request and has the necessary data
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
        // Configure Cloudinary with your credentials
        // Use Netlify Environment Variables for CLOUD_NAME, API_KEY, API_SECRET
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        // Generate a signed URL for the private asset
        // The 'type: "private"' is crucial here
        const url = cloudinary.url(publicId, {
            secure: true,
            type: "private", // or "authenticated" if you set it up that way
            resource_type: "image", // <--- ADD THIS LINE FOR DOCUMENTS
            sign_url: true,
            expires_at: Math.floor(Date.now() / 1000) + 3600 // URL valid for 1 hour
        });

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url })
        };
    } catch (error) {
        console.error("Error generating signed URL:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to generate signed URL' })
        };
    }
};