// netlify/functions/get-signed-url.js
const cloudinary = require('cloudinary').v2;

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST' || !event.body) {
        return {
            statusCode: 405,
            body: 'Method Not Allowed'
        };
    }

    const { publicId } = JSON.parse(event.body); // This publicId will be 'Italy2025/day1_day16_TS342Flight.pdf'

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

        // --- Verify this log in Netlify Function logs ---
        console.log('Public ID being passed to private_download_url (as-is from frontend):', publicId);
        // This log should show 'Italy2025/day1_day16_TS342Flight.pdf'

        const url = cloudinary.utils.private_download_url(
            publicId, // Use publicId exactly as it is (including the .pdf extension)
            'raw',    // Specify the resource_type as 'raw'
            {
                expires_at: Math.floor(Date.now() / 1000) + 3600 // URL valid for 1 hour
                // Ensure no other parameters that could be interpreted as transformations are here.
            }
        );

        console.log('Generated Private Download URL:', url);

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url })
        };
    } catch (error) {
        console.error("Error generating private download URL:", error);
        if (error.http_code && error.error && error.error.message) {
             console.error(`Cloudinary Error Details: HTTP ${error.http_code} - ${error.error.message}`);
        }
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to generate private download URL', details: error.message })
        };
    }
};