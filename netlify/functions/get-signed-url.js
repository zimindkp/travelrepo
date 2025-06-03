// netlify/functions/get-signed-url.js
const cloudinary = require('cloudinary').v2;
const path = require('path'); // Required to extract the file extension (e.g., 'pdf')

exports.handler = async (event, context) => {
    // Basic validation
    if (event.httpMethod !== 'POST' || !event.body) {
        return {
            statusCode: 405,
            body: 'Method Not Allowed'
        };
    }

    const { publicId } = JSON.parse(event.body); // This publicId should be 'Italy2025/day1_day16_TS342Flight.pdf'

    if (!publicId) {
        return {
            statusCode: 400,
            body: 'Missing publicId in request body'
        };
    }

    // Extract the file extension to use as the 'format' parameter.
    // path.extname(publicId) returns '.pdf', so .substring(1) gets 'pdf'.
    const fileFormat = path.extname(publicId).substring(1); 

    if (!fileFormat) {
        // Handle case where publicId might not have an extension, though in your case it should
        return {
            statusCode: 400,
            body: 'Could not determine file format from publicId'
        };
    }

    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        // --- Log for debugging (check this in Netlify logs) ---
        console.log('Public ID received from frontend:', publicId);       // Should be Italy2025/day1_day16_TS342Flight.pdf
        console.log('Inferred file format for download:', fileFormat); // Should be 'pdf'

        // Generate the private download URL
        // The second argument is the 'format' (e.g., 'pdf', 'jpg'), not 'raw'
        // The 'raw' resource type inference happens based on the format and the specific download endpoint.
        const url = cloudinary.utils.private_download_url(
            publicId,     // The full publicId including the extension (e.g., 'Italy2025/document.pdf')
            fileFormat,   // The format of the file (e.g., 'pdf', 'docx', 'xlsx')
            {
                expires_at: Math.floor(Date.now() / 1000) + 3600 // URL valid for 1 hour
            }
        );

        console.log('Generated Private Download URL:', url); // Check the generated URL's structure

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