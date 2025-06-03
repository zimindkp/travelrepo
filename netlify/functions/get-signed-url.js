// netlify/functions/get-signed-url.js
const cloudinary = require('cloudinary').v2;
// No need for 'path' module if we are keeping the extension in publicId

exports.handler = async (event, context) => {
    // Ensure this is a POST request and has the necessary data
    if (event.httpMethod !== 'POST' || !event.body) {
        return {
            statusCode: 405,
            body: 'Method Not Allowed'
        };
    }

    const { publicId } = JSON.parse(event.body); // Keep publicId as sent by frontend (with extension)

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
            // Ensure no other global transformation parameters are here
            // e.g., no 'secure_distribution' unless explicitly needed and signed
        });

        // --- Remove the extension stripping logic ---
        // (If you put it back from my previous suggestion)
        // const ext = path.extname(publicId);
        // if (ext) {
        //     publicId = publicId.substring(0, publicId.length - ext.length);
        // }
        // --- End removal of extension stripping logic ---

        // Generate a private download URL for the raw asset
        // Public ID MUST include the file extension (e.g., 'Italy2025/myfile.pdf')
        // No transformation parameters should be passed.
        const url = cloudinary.utils.private_download_url(
            publicId, // Use the publicId exactly as it is in Cloudinary (with .pdf extension)
            'raw',    // Specify the resource_type as 'raw' for documents
            {
                expires_at: Math.floor(Date.now() / 1000) + 3600 // URL valid for 1 hour
                // Ensure NO other parameters that could be interpreted as transformations are here.
                // E.g., no 'width', 'height', 'crop', 'quality', 'fetch_format', etc.
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
        // Log more details if available in the error object
        if (error.http_code && error.error && error.error.message) {
             console.error(`Cloudinary Error: HTTP ${error.http_code} - ${error.error.message}`);
        }
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to generate private download URL', details: error.message })
        };
    }
};