// netlify/functions/get-signed-url.js
const cloudinary = require('cloudinary').v2;

exports.handler = async (event, context) => {
    // ... (your existing validation for POST and publicId) ...

    const { publicId } = JSON.parse(event.body);

    try {
        // --- START TEMPORARY DEBUGGING LOGS ---
        console.log('--- Netlify Function Invocation ---');
        console.log('Public ID received:', publicId);
        console.log('Env CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
        console.log('Env API_KEY:', process.env.CLOUDINARY_API_KEY);
        // DO NOT log the full API_SECRET directly! Log its length and a hash or part of it if you must.
        console.log('Env API_SECRET length:', process.env.CLOUDINARY_API_SECRET ? process.env.CLOUDINARY_API_SECRET.length : 'UNDEFINED/NULL');
        // You can also log a partial hash or start/end characters if you want to verify content without exposing fully
        if (process.env.CLOUDINARY_API_SECRET) {
            console.log('Env API_SECRET start:', process.env.CLOUDINARY_API_SECRET.substring(0, 5));
            console.log('Env API_SECRET end:', process.env.CLOUDINARY_API_SECRET.substring(process.env.CLOUDINARY_API_SECRET.length - 5));
        }
        // --- END TEMPORARY DEBUGGING LOGS ---

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        // Generate a signed URL
        const url = cloudinary.url(publicId, {
            secure: true,
            resource_type: "raw",
            type: "private",
            sign_url: true,
            expires_at: Math.floor(Date.now() / 1000) + 3600
        });

        console.log('Generated URL:', url); // Log the generated URL
        console.log('--- Function End ---');

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url })
        };
    } catch (error) {
        console.error("Error generating signed URL:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to generate signed URL', details: error.message })
        };
    }
};