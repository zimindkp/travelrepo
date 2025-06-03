// netlify/functions/get-signed-url.js
const cloudinary = require('cloudinary').v2;
const path = require('path'); // Node.js built-in module for path manipulation

exports.handler = async (event, context) => {
    // Ensure this is a POST request and has the necessary data
    if (event.httpMethod !== 'POST' || !event.body) {
        return {
            statusCode: 405,
            body: 'Method Not Allowed'
        };
    }

    let { publicId } = JSON.parse(event.body); // Use 'let' to allow modification

    if (!publicId) {
        return {
            statusCode: 400,
            body: 'Missing publicId in request body'
        };
    }

    try {
        // Configure Cloudinary with your credentials
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        // --- CRITICAL CHANGE: Remove file extension from publicId if present ---
        // This handles cases like 'Italy2025/day1_day16_TS342Flight.pdf'
        // and converts it to 'Italy2025/day1_day16_TS342Flight'
        const ext = path.extname(publicId);
        if (ext) {
            publicId = publicId.substring(0, publicId.length - ext.length);
            console.log(`Adjusted publicId (removed extension for URL generation): ${publicId}`);
        }
        // --- END CRITICAL CHANGE ---

        // Generate a private download URL for the raw asset
        // It automatically handles the correct endpoint and signature
        const url = cloudinary.utils.private_download_url(
            publicId, // Use the adjusted publicId here (without the .pdf extension)
            'raw',    // Specify the resource_type as 'raw' for documents
            {
                expires_at: Math.floor(Date.now() / 1000) + 3600 // URL valid for 1 hour
            }
        );

        console.log('Generated Private Download URL:', url); // Log the final URL

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