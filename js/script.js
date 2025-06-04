// script.js

// This script has been updated to remove dynamic link/document/photo upload
// and addition functionalities, as you plan to hardcode these.
// It also includes conceptual code for fetching Cloudinary signed URLs
// if you choose that security method for your assets.

document.getElementById('printItineraryBtn').addEventListener('click', function() {
    window.print();
});

document.addEventListener('DOMContentLoaded', function() {
    // --- Event Listeners Setup ---

    // Save Itinerary Button
    const saveItineraryBtn = document.getElementById('saveItineraryBtn');
    if (saveItineraryBtn) {
        saveItineraryBtn.addEventListener('click', saveItinerary);
    }

    // Photo Modal Close Button
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    // Photo Modal Background Click (to close)
    const photoModal = document.getElementById('photoModal');
    if (photoModal) {
        photoModal.addEventListener('click', function(event) {
            // Only close if the click is directly on the modal background, not the image
            if (event.target === photoModal) {
                closeModal();
            }
        });
    }

    // NEW: Day Image Modal Triggers
    // Select all elements with the 'day-image-modal-trigger' class
    document.querySelectorAll('.day-image-modal-trigger').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent the default link behavior (e.g., navigating to #)
            const imageSrc = this.querySelector('img').src; // Get the src from the image inside the link
            openModal(imageSrc); // Call your existing openModal function
        });
    });

    // --- REMOVED: Add Link Buttons listeners (as links will be hardcoded) ---
    // document.querySelectorAll('.add-link-btn').forEach(button => {
    //     button.addEventListener('click', function() {
    //         addLink(this);
    //     });
    // });

    // --- REMOVED: Photo Upload Areas listeners (as photos will be hardcoded/linked) ---
    // document.querySelectorAll('.photo-section input[type="file"]').forEach(input => {
    //     input.addEventListener('change', function() {
    //         handlePhotoUpload(this);
    //     });
    //     const photoSection = input.parentNode;
    //     photoSection.addEventListener('dragover', function(e) { /* ... */ });
    //     photoSection.addEventListener('dragleave', function(e) { /* ... */ });
    //     photoSection.addEventListener('drop', function(e) { /* ... */ });
    // });

    // --- REMOVED: Ticket Upload Areas listeners (as tickets/documents will be hardcoded/linked) ---
    // document.querySelectorAll('.ticket-upload-area input[type="file"]').forEach(input => {
    //     input.addEventListener('change', function() {
    //         handleTicketUpload(this);
    //     });
    //     const ticketArea = input.parentNode;
    //     ticketArea.addEventListener('dragover', function(e) { /* ... */ });
    //     ticketArea.addEventListener('dragleave', function(e) { /* ... */ });
    //     ticketArea.addEventListener('drop', function(e) { /* ... */ });
    // });

    // Keyboard Shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl+S to save
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault(); // Prevent browser's default save dialog
            saveItinerary();
        }
        // Escape to close modal
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    // --- Core Functions ---

    // --- REMOVED: handlePhotoUpload (as photos will be hardcoded/linked) ---
    // function handlePhotoUpload(input) { /* ... */ }

    // --- REMOVED: handleTicketUpload (as tickets/documents will be hardcoded/linked) ---
    // function handleTicketUpload(input) { /* ... */ }

    // --- REMOVED: addLink (as links will be hardcoded) ---
    // function addLink(button) { /* ... */ }

    // --- REMOVED: deleteLink (as links will be hardcoded) ---
    // function deleteLink(button) { /* ... */ }

    // --- REMOVED: deletePhoto (as photos will be hardcoded/linked) ---
    // function deletePhoto(button) { /* ... */ }

    // --- REMOVED: deleteTicket (as tickets/documents will be hardcoded/linked) ---
    // function deleteTicket(button) { /* ... */ }

    // --- REMOVED: viewTicket (as documents will be linked directly to Cloudinary URLs) ---
    // If you link directly to Cloudinary PDFs/images, the browser handles viewing.
    // function viewTicket(fileData, fileType) { /* ... */ }

    /**
     * Opens the photo modal and displays the given image.
     * @param {string} imageSrc The source URL of the image to display.
     */
    function openModal(imageSrc) {
        const modal = document.getElementById('photoModal');
        const modalImg = document.getElementById('fullSizePhoto');
        if (modal && modalImg) {
            modal.style.display = 'block';
            modalImg.src = imageSrc;
        }
    }

    /**
     * Closes the photo modal.
     */
    function closeModal() {
        const modal = document.getElementById('photoModal');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('fullSizePhoto').src = ''; // Clear image src
        }
    }

    /**
     * Saves the entire HTML content of the itinerary to a file.
     */
    function saveItinerary() {
        const htmlContent = document.documentElement.outerHTML;
        const blob = new Blob([htmlContent], {
            type: 'text/html'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Parekh_Italy_Trip_2025.html'; // Suggested filename
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // Clean up the object URL

        // Show success message on the button
        const button = document.getElementById('saveItineraryBtn');
        if (button) {
            const originalText = button.innerHTML;
            button.innerHTML = '✅ Saved!';
            button.style.background = 'rgba(46, 204, 113, 0.3)';
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = 'rgba(255, 255, 255, 0.2)';
            }, 2000);
        }
    }

    // --- REMOVED: saveCaptions (unless you have a separate backend for captions) ---
    // function saveCaptions() { /* ... */ }

    // --- Cloudinary Signed URLs Integration (Conceptual - Requires Netlify Function) ---
    // This section is for when you configure Cloudinary assets as "private"
    // and use a Netlify Function to generate signed URLs dynamically.
    // Ensure your HTML links have a 'data-cloudinary-public-id' attribute, e.g.:
    // <a href="#" data-cloudinary-public-id="SalernoCarRental" target="_blank">Salerno Car Rental Agreement</a>

    /**
     * Fetches a signed Cloudinary URL from your Netlify Function.
     * Requires a Netlify Function named 'get-signed-url' that handles POST requests
     * with a 'publicId' in the body and returns a 'url'.
     * @param {string} publicId The Cloudinary public ID of the asset.
     * @returns {Promise<string|null>} The signed URL or null if an error occurred.
     */
    async function fetchSignedCloudinaryUrl(publicId) {
        try {
            const response = await fetch('/.netlify/functions/get-signed-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ publicId: publicId })
            });
            const data = await response.json();
            if (response.ok && data.url) {
                return data.url;
            } else {
                console.error('Error fetching signed URL:', data.error || 'Unknown error');
                return null;
            }
        } catch (error) {
            console.error('Network or other error fetching signed URL:', error);
            return null;
        }
    }

    // Loop through all elements that are designated as needing a signed Cloudinary URL
    // Update the selector as needed (e.g., if you have images that also need signing)
    document.querySelectorAll('.uploaded-tickets a[data-cloudinary-public-id]').forEach(async link => {
        const publicId = link.dataset.cloudinaryPublicId;
        if (publicId) {
            // Optionally, show a loading state
            // link.textContent = 'Loading document...';
            // link.style.pointerEvents = 'none'; // Disable click temporarily

            const signedUrl = await fetchSignedCloudinaryUrl(publicId);
            if (signedUrl) {
                link.href = signedUrl;
                // Optionally, restore link text if changed for loading state
                // link.textContent = link.originalText || link.textContent;
            } else {
                // Handle case where URL couldn't be fetched (e.g., disable link or show an error)
                link.textContent = 'Document not available';
                link.style.color = 'red';
                link.removeAttribute('href'); // Make it not clickable
            }
            // link.style.pointerEvents = 'auto'; // Re-enable click
        }
    });
    // --- End Cloudinary Signed URLs Integration ---


    // --- Initial Page Load Success Message ---
    const header = document.querySelector('.header');
    if (header) {
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(46, 204, 113, 0.9);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        successDiv.textContent = '✅ Interactive itinerary loaded!';
        header.appendChild(successDiv);

        // Fade in and out
        setTimeout(() => {
            successDiv.style.opacity = '1';
        }, 100);
        setTimeout(() => {
            successDiv.style.opacity = '0';
            setTimeout(() => {
                if (successDiv.parentNode) {
                    successDiv.parentNode.removeChild(successDiv);
                }
            }, 300);
        }, 3000);
    }
});


// FOr navigation pane
document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const daynavigation = document.getElementById('daynavigation');
    const body = document.body;
    const container = document.querySelector('.container'); // Get your main content container

// --- START OF NEW CONDITIONAL BLOCK ---
    // Only proceed with navigation logic if both the toggle button and navigation pane exist on the page
    if (navToggle && daynavigation) {

        // Optional: Create and append the overlay - this is safe to do inside here
        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
        document.body.appendChild(overlay); // body is guaranteed to exist

        function toggleNavigation() {
            daynavigation.classList.toggle('active');
            navToggle.classList.toggle('active');
            body.classList.toggle('no-scroll');
            overlay.classList.toggle('active'); // Toggle overlay too
            navToggle.setAttribute('aria-expanded', daynavigation.classList.contains('active'));
        }

        // Add event listener to the toggle button
        navToggle.addEventListener('click', toggleNavigation);

        // Optional: Close nav when clicking outside (on the overlay)
        overlay.addEventListener('click', toggleNavigation);

        // Optional: Close nav if a navigation link is clicked (assuming internal links)
        // Ensure dayNavigation exists before querySelectorAll (already checked by the outer if)
        daynavigation.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (dayNavigation.classList.contains('active')) {
                    toggleNavigation(); // Close navigation after clicking a link
                }
            });
        });

        // Handle initial state on page load or resize if it's mobile
        function handleResize() {
            // Check if dayNavigation exists (already checked by outer if, but good to be explicit here too)
            if (daynavigation) {
                if (window.innerWidth > 768) { // Desktop view
                    daynavigation.classList.remove('active');
                    navToggle.classList.remove('active');
                    body.classList.remove('no-scroll');
                    overlay.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', false);
                }
                // Else (mobile view): let CSS handle default hidden state, toggle opens on click
            }
        }

        window.addEventListener('resize', handleResize);
        handleResize(); // Call on initial load to set correct state
    }
    // --- END OF NEW CONDITIONAL BLOCK ---
    // If navToggle or daynavigation are null, this script block simply does nothing, preventing the TypeError.
    }  
);