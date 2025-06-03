// js/app.js

// This global variable will store the Auth0 client instance once it's initialized
let auth0ClientInstance = null;

// Function to fetch Auth0 configuration
const fetchAuthConfig = async () => {
    try {
        const response = await fetch('/auth_config.json');
        if (!response.ok) {
            throw new Error(`Failed to load auth_config.json: ${response.status} ${response.statusText}`);
        }
        return response.json();
    } catch (e) {
        console.error("Failed to load Auth0 config:", e);
        document.getElementById('error').innerText = "Auth0 configuration missing or failed to load. Please check Netlify build logs and environment variables.";
        return null;
    }
};

const configureAuth0AndSetupUI = async () => {
    document.getElementById('message').innerText = 'Initializing authentication...';
    document.getElementById('error').innerText = ''; // Clear previous errors

    const config = await fetchAuthConfig();
    if (!config) {
        document.getElementById('message').innerText = '';
        return; // Stop if config is not loaded
    }

    try {
        // Initialize Auth0 client
        auth0ClientInstance = await auth0.createAuth0Client({
            domain: config.domain,
            clientId: config.clientId,
            authorizationParams: {
                redirect_uri: window.location.origin,
                // audience: "YOUR_AUTH0_API_IDENTIFIER", // Uncomment if using API
                // scope: "openid profile email" // Add scopes as needed
            }
        });

        // --- Handle Redirect Callback ---
        // This is crucial for handling the redirect back from Auth0 after login/signup
        if (window.location.search.includes("state=") &&
            (window.location.search.includes("code=") ||
             window.location.search.includes("error="))) {
            try {
                await auth0ClientInstance.handleRedirectCallback();
                window.history.replaceState({}, document.title, window.location.pathname); // Clean URL
                document.getElementById('message').innerText = 'Authentication successful!';
            } catch (e) {
                console.error("Error handling redirect callback:", e);
                document.getElementById('error').innerText = "Authentication failed during redirect: " + e.message;
            }
        }

        // --- Set up Login Button ---
        const loginButton = document.getElementById("btn-login"); // Changed ID to match your HTML
        if (loginButton) {
            loginButton.addEventListener("click", async (e) => {
                e.preventDefault();
                document.getElementById('message').innerText = '';
                document.getElementById('error').innerText = '';
                try {
                    await auth0ClientInstance.loginWithRedirect();
                } catch (err) {
                    console.error("Login initiation failed:", err);
                    document.getElementById('error').innerText = "Login failed: " + err.message;
                }
            });
        }

        // --- Set up Logout Button ---
        const logoutButton = document.getElementById("btn-logout"); // Changed ID to match your HTML
        if (logoutButton) {
            logoutButton.addEventListener("click", async (e) => {
                e.preventDefault();
                document.getElementById('message').innerText = '';
                document.getElementById('error').innerText = '';
                try {
                    await auth0ClientInstance.logout({
                        logoutParams: {
                            returnTo: window.location.origin
                        }
                    });
                } catch (err) {
                    console.error("Logout failed:", err);
                    document.getElementById('error').innerText = "Logout failed: " + err.message;
                }
            });
        }

        // --- Update UI Based on Authentication Status ---
        await updateUI(); // Initial UI update after client is ready

        document.getElementById('message').innerText = 'Authentication system ready.';

    } catch (e) {
        console.error("Error during Auth0 initialization:", e);
        document.getElementById('error').innerText = "Failed to initialize Auth0: " + e.message;
        document.getElementById('message').innerText = '';
    }
};

const updateUI = async () => {
    // Ensure auth0ClientInstance is ready before using it
    if (!auth0ClientInstance) {
        console.warn("updateUI called before auth0ClientInstance is ready.");
        document.getElementById('btn-login').disabled = true;
        document.getElementById('btn-logout').disabled = true;
        return;
    }

    const isAuthenticated = await auth0ClientInstance.isAuthenticated();
    const loginButton = document.getElementById('btn-login');
    const logoutButton = document.getElementById('btn-logout');
    const profileElement = document.getElementById('profile');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');

    if (loginButton) loginButton.disabled = isAuthenticated;
    if (logoutButton) logoutButton.disabled = !isAuthenticated;

    if (isAuthenticated) {
        if (profileElement) profileElement.style.display = 'block';
        const userProfile = await auth0ClientInstance.getUser();
        if (profileName) profileName.innerText = userProfile.name || userProfile.nickname || 'N/A';
        if (profileEmail) profileEmail.innerText = userProfile.email || 'N/A';
        // If you had a user image, you'd add:
        // const profilePicture = document.getElementById('profile-picture'); // Add this ID in HTML if needed
        // if (profilePicture && userProfile.picture) profilePicture.src = userProfile.picture;

    } else {
        if (profileElement) profileElement.style.display = 'none';
        if (profileName) profileName.innerText = '';
        if (profileEmail) profileEmail.innerText = '';
    }
};


// Execute the configuration and setup when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    configureAuth0AndSetupUI();
});

// Expose updateUI globally if you plan to call it from other parts of your app
// For a simple app, it's not strictly necessary, but good practice if more complex interactions are added.
window.updateUI = updateUI;

// NOTE: We no longer need global login() and logout() functions callable directly from HTML onclick attributes
// because we are attaching event listeners inside configureAuth0AndSetupUI.
// If you still want to use onclick="login()" in HTML, you'd define global functions like this,
// but they would need to access auth0ClientInstance:

/*
window.login = async () => {
    if (!auth0ClientInstance) {
        document.getElementById('error').innerText = "Auth0 client not initialized.";
        return;
    }
    try {
        await auth0ClientInstance.loginWithRedirect();
    } catch (e) {
        console.error("Login failed:", e);
        document.getElementById('error').innerText = "Login failed: " + e.message;
    }
};

window.logout = async () => {
    if (!auth0ClientInstance) {
        document.getElementById('error').innerText = "Auth0 client not initialized.";
        return;
    }
    try {
        await auth0ClientInstance.logout({
            logoutParams: {
                returnTo: window.location.origin
            }
        });
    } catch (e) {
        console.error("Logout failed:", e);
        document.getElementById('error').innerText = "Logout failed: " + e.message;
    }
};
*/
