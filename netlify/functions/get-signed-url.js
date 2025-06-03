// netlify/functions/get-signed-url.js
const cloudinary = require('cloudinary').v2;
// No need for 'path' module anymore

exports.handler = async (event, context) => {
    // Basic validation
    if (event.httpMethod !== 'POST' || !event.body) {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // publicId received from frontend should now be 'Italy2025/day1_day16_TS342Flight' (NO .pdf)
    const { publicId } = JSON.parse(event.body); 

    if (!publicId) {
        return { statusCode: 400, body: 'Missing publicId in request body' };
    }

    // Determine the format. Assuming all your raw files are PDF.
    // If you have other formats (DOCX, etc.), you'd need a more dynamic way
    // to get this, e.g., send it from the frontend or derive it from the publicId if possible.
    const format = 'pdf'; 

    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        // --- Log for debugging (check this in Netlify logs) ---
        console.log('Public ID used for private_download_url (renamed in Cloudinary):', publicId); // Should be WITHOUT .pdf
        console.log('Explicit format parameter:', format);
        // --- End Log ---

        // Generate the private download URL
        // publicId is now the identifier, and format is specified separately
        const url = cloudinary.utils.private_download_url(
            publicId, // This should now be 'Italy2025/day1_day16_TS342Flight'
            'raw',    // Resource type
            {
                format: format, // Explicitly specify the format (e.g., 'pdf')
                expires_at: Math.floor(Date.now() / 1000) + 3600 // URL valid for 1 hour
            }
        );

        console.log('Generated Private Download URL:', url); // Check this in Netlify logs

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