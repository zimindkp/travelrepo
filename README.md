# My Travel Itinerary Website

This repository hosts the static files (HTML, CSS, and JavaScript) for my personal travel itinerary website. The site allows me to organize my travel plans, upload photos and documents related to my trips, and save important links.

## Features

* **Interactive Travel Itinerary:** Plan and display trip details, dates, and destinations.
* **Document & Photo Uploads:** Upload travel documents (e.g., flight tickets, hotel reservations, passport scans) and personal photos directly to the itinerary.
* **Link Saving:** Easily save important URLs relevant to specific trips or activities.
* **Responsive Design:** Optimized for viewing on various devices (desktop, tablet, mobile).

## Technologies Used

* **HTML5:** Structure of the website content.
* **CSS3:** Styling and visual presentation.
* **JavaScript (Vanilla JS/ES6+):** Provides interactive functionality on the client-side, handles UI updates, and manages communication with the backend.
* **Netlify:** Hosting provider for continuous deployment of static files.
* **Netlify Functions:** Serverless functions acting as the backend for handling dynamic operations like file uploads and data persistence.
* **Netlify Blobs:** Serverless data storage for uploaded photos and documents.

## Project Structure

```
.
├── public/                 # Or your main project root if not using a 'public' folder
│   ├── index.html          # Main HTML file for the website
│   ├── css/
│   │   └── style.css       # Main stylesheet
│   ├── js/
│   │   └── script.js       # Main JavaScript file
│   └── assets/             # Optional: for static images, icons, etc.
│       └── ...
├── netlify/
│   └── functions/          # Netlify Functions (your serverless backend code)
│       └── upload-document.js
│       └── save-link.js
│       └── get-itinerary-data.js
│       └── ...
├── .gitignore              # Specifies intentionally untracked files to ignore
├── netlify.toml            # Netlify configuration file (optional, but recommended)
└── README.md               # This file
```
*(Note: The `netlify/functions` directory structure is a common convention for Netlify Functions. Your main HTML/CSS/JS files will likely be in the root or a `public/` directory depending on your preference.)*

## Getting Started (Local Development)

To run this project locally for development:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git)
    cd YOUR_REPO_NAME
    ```
2.  **Open `index.html`:** Simply open the `index.html` file in your web browser. Note that dynamic features (like file uploads) will *not* work locally without a local server setup that can mimic Netlify Functions and Blobs, which is more complex.
3.  **For local Netlify Functions testing:**
    * Install the Netlify CLI: `npm install -g netlify-cli`
    * From your project root, run: `netlify dev` (This will start a local development server that mimics Netlify's environment, including functions).

## Deployment

This site is set up for continuous deployment with Netlify.

1.  **Create a Netlify account:** If you don't have one, sign up at [Netlify](https://www.netlify.com/).
2.  **Connect your GitHub repository:**
    * From your Netlify dashboard, click "Add new site" -> "Import an existing project" -> "Deploy with GitHub".
    * Select this repository.
3.  **Configure deploy settings:**
    * **Build command:** Leave empty (or `npm run build` if you add one later for a static site generator).
    * **Publish directory:** Specify the directory containing your `index.html` (e.g., `.` if it's in the root, or `public/` if you structured it that way).
    * **Functions directory:** Ensure this is set to `netlify/functions` (or wherever you place your functions).
4.  **Click "Deploy site":** Netlify will build and deploy your site, making it live on a unique URL.

Any subsequent `git push` to the `main` branch will automatically trigger a new deployment on Netlify.

## Contributing

This is a personal project, but feel free to explore the code.
