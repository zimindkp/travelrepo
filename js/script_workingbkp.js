// script.js
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

    // Add Link Buttons (using event delegation for future-proof adding)
    document.querySelectorAll('.add-link-btn').forEach(button => {
        button.addEventListener('click', function() {
            addLink(this); // Pass the clicked button element
        });
    });

    // Photo Upload Areas (using event delegation for future-proof adding)
    document.querySelectorAll('.photo-section input[type="file"]').forEach(input => {
        input.addEventListener('change', function() {
            handlePhotoUpload(this); // Pass the changed input element
        });
        // Drag and drop listeners for photo sections
        const photoSection = input.parentNode;
        photoSection.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });
        photoSection.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
        });
        photoSection.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            const files = e.dataTransfer.files;
            input.files = files; // Assign dropped files to the input
            handlePhotoUpload(input);
        });
    });

    // Ticket Upload Areas (using event delegation for future-proof adding)
    document.querySelectorAll('.ticket-upload-area input[type="file"]').forEach(input => {
        input.addEventListener('change', function() {
            handleTicketUpload(this); // Pass the changed input element
        });
        // Drag and drop listeners for ticket areas
        const ticketArea = input.parentNode;
        ticketArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });
        ticketArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
        });
        ticketArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            const files = e.dataTransfer.files;
            input.files = files; // Assign dropped files to the input
            handleTicketUpload(input);
        });
    });

    // Auto-resize textareas (for notes-area)
    document.querySelectorAll('.notes-area').forEach(textarea => {
        // Initial resize for existing content
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
        // Add input event listener for dynamic resizing
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    });

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

    /**
     * Handles the upload and display of photos.
     * @param {HTMLInputElement} input The file input element.
     */
    function handlePhotoUpload(input) {
        const files = input.files;
        // The photo gallery is the sibling div after the photo section
        const gallery = input.parentNode.nextElementSibling;

        for (let file of files) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const photoItem = document.createElement('div');
                    photoItem.className = 'photo-item';
                    photoItem.innerHTML = `
                        <img src="${e.target.result}" alt="Trip photo" data-full-src="${e.target.result}">
                        <div class="photo-caption">
                            <input type="text" placeholder="Add caption..." class="caption-input">
                        </div>
                        <button class="delete-photo">×</button>
                    `;
                    gallery.appendChild(photoItem);

                    // Attach event listeners to newly created elements
                    photoItem.querySelector('img').addEventListener('click', function() {
                        openModal(this.dataset.fullSrc);
                    });
                    photoItem.querySelector('.caption-input').addEventListener('change', saveCaptions);
                    photoItem.querySelector('.delete-photo').addEventListener('click', function() {
                        deletePhoto(this);
                    });
                };
                reader.readAsDataURL(file);
            }
        }
        input.value = ''; // Reset input to allow re-uploading same file
    }

    /**
     * Handles the upload and display of tickets/documents.
     * @param {HTMLInputElement} input The file input element.
     */
    function handleTicketUpload(input) {
        const files = input.files;
        // The uploaded tickets container is the sibling div after the ticket upload area
        const ticketsContainer = input.parentNode.nextElementSibling;

        for (let file of files) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const ticketItem = document.createElement('div');
                ticketItem.className = 'ticket-item';
                const fileSize = (file.size / 1024).toFixed(1) + ' KB'; // Calculate file size in KB
                ticketItem.innerHTML = `
                    <div class="ticket-info">
                        <div class="ticket-name">${file.name}</div>
                        <div class="ticket-size">${fileSize}</div>
                    </div>
                    <div class="ticket-actions">
                        <button class="view-ticket" data-file-data="${e.target.result}" data-file-type="${file.type}">View</button>
                        <button class="delete-ticket">Delete</button>
                    </div>
                `;
                ticketsContainer.appendChild(ticketItem);

                // Attach event listeners to newly created elements
                ticketItem.querySelector('.view-ticket').addEventListener('click', function() {
                    viewTicket(this.dataset.fileData, this.dataset.fileType);
                });
                ticketItem.querySelector('.delete-ticket').addEventListener('click', function() {
                    deleteTicket(this);
                });
            };
            reader.readAsDataURL(file);
        }
        input.value = ''; // Reset input
    }

    /**
     * Adds a new link to the saved links section.
     * @param {HTMLButtonElement} button The "Add Link" button that was clicked.
     */
    function addLink(button) {
        const inputGroup = button.parentNode;
        const titleInput = inputGroup.children[0]; // First input is title
        const urlInput = inputGroup.children[1]; // Second input is URL
        const savedLinks = inputGroup.nextElementSibling; // Sibling div for saved links

        if (titleInput.value.trim() && urlInput.value.trim()) {
            const linkItem = document.createElement('div');
            linkItem.className = 'saved-link';
            linkItem.innerHTML = `
                <a href="${urlInput.value}" target="_blank" rel="noopener noreferrer">${titleInput.value}</a>
                <button class="delete-link">Delete</button>
            `;
            savedLinks.appendChild(linkItem);

            // Attach event listener to the new delete button
            linkItem.querySelector('.delete-link').addEventListener('click', function() {
                deleteLink(this);
            });

            titleInput.value = ''; // Clear input fields
            urlInput.value = '';
        }
    }

    /**
     * Deletes a saved link.
     * @param {HTMLButtonElement} button The delete button that was clicked.
     */
    function deleteLink(button) {
        button.parentNode.remove();
    }

    /**
     * Deletes a photo item from the gallery.
     * @param {HTMLButtonElement} button The delete photo button that was clicked.
     */
    function deletePhoto(button) {
        button.parentNode.remove();
    }

    /**
     * Deletes a ticket item from the uploaded tickets list.
     * @param {HTMLButtonElement} button The delete ticket button that was clicked.
     */
    function deleteTicket(button) {
        button.parentNode.parentNode.remove();
    }

    /**
     * Views a ticket/document. Opens PDFs in a new tab, images in the photo modal.
     * @param {string} fileData The base64 data URL of the file.
     * @param {string} fileType The MIME type of the file.
     */
    function viewTicket(fileData, fileType) {
        if (fileType.includes('pdf')) {
            // Open PDF in new tab
            const newWindow = window.open();
            if (newWindow) {
                newWindow.document.write(`<iframe src="${fileData}" style="width:100%;height:100vh;border:none;"></iframe>`);
                newWindow.document.close(); // Close the document stream
            } else {
                // Fallback if pop-ups are blocked
                console.error('Pop-up blocked. Please allow pop-ups for this site to view PDFs.');
                // You might want to display a message to the user here instead of alert
            }
        } else if (fileType.startsWith('image/')) {
            // Open image in photo modal
            openModal(fileData);
        } else {
            console.warn('Unsupported file type for viewing:', fileType);
            // You might want to display a message to the user here
        }
    }

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

    /**
     * Placeholder function for saving captions.
     * This would typically involve sending data to a backend or local storage.
     */
    function saveCaptions() {
        // In a real application, you'd collect all captions and save them.
        // For this example, it just logs to console.
        console.log('Captions updated/saved (placeholder)');
    }

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
