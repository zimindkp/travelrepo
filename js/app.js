// js/app.js

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
        auth0ClientInstance = await auth0.createAuth0Client({
            domain: config.domain,
            clientId: config.clientId,
            authorizationParams: {
                redirect_uri: window.location.origin,
                // audience: "YOUR_AUTH0_API_IDENTIFIER", // Uncomment if using API
                // scope: "openid profile email" // Add scopes as needed
            }
        });

        if (window.location.search.includes("state=") &&
            (window.location.search.includes("code=") ||
             window.location.search.includes("error="))) {
            try {
                await auth0ClientInstance.handleRedirectCallback();
                window.history.replaceState({}, document.title, window.location.pathname);
                document.getElementById('message').innerText = 'Authentication successful!';
            } catch (e) {
                console.error("Error handling redirect callback:", e);
                document.getElementById('error').innerText = "Authentication failed during redirect: " + e.message;
            }
        }

        const loginButton = document.getElementById("btn-login");
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

        const logoutButton = document.getElementById("btn-logout");
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

        await updateUI(); // Initial UI update after client is ready
        document.getElementById('message').innerText = 'Authentication system ready.';

    } catch (e) {
        console.error("Error during Auth0 initialization:", e);
        document.getElementById('error').innerText = "Failed to initialize Auth0: " + e.message;
        document.getElementById('message').innerText = '';
    }
};
//updateUI function to toggle the visibility of this new protected-content  div
const updateUI = async () => {
    if (!auth0ClientInstance) {
        console.warn("updateUI called before auth0ClientInstance is ready.");
        document.getElementById('btn-login').disabled = true;
        document.getElementById('btn-logout').disabled = true;
        const protectedContent = document.getElementById('protected-content');
        if (protectedContent) protectedContent.style.display = 'none';
        return;
    }

    const isAuthenticated = await auth0ClientInstance.isAuthenticated();
    const loginButton = document.getElementById('btn-login');
    const logoutButton = document.getElementById('btn-logout');
    const profileElement = document.getElementById('profile');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const protectedContent = document.getElementById('protected-content');

    if (loginButton) loginButton.disabled = isAuthenticated;
    if (logoutButton) logoutButton.disabled = !isAuthenticated;

    // Default to not approved unless explicitly set

    if (isAuthenticated) {
        if (profileElement) profileElement.style.display = 'flex';
        const userProfile = await auth0ClientInstance.getUser();

        console.log("User Profile received:", userProfile); // <--- ADD THIS LINE FOR DEBUGGING

        if (profileName) profileName.innerText = userProfile.name || userProfile.nickname || 'N/A';
        if (profileEmail) profileEmail.innerText = userProfile.email || 'N/A';

        // --- NEW LOGIC FOR AUTHORIZATION ---
        let isUserApproved = false; // Default to not approved

        // --- NEW LOGIC FOR AUTHORIZATION ---
        // Accessing app_metadata from the user profile
        if (userProfile && userProfile.app_metadata && userProfile.app_metadata.is_approved === true) {
            isUserApproved = true;
        }

        // Show protected content ONLY if authenticated AND approved
        // Make sure user has the isapproved metadata in their profile from auth0
        if (protectedContent) {
            if (isUserApproved) {
                protectedContent.style.display = 'block';
                document.getElementById('message').innerText = 'Welcome! You have access to protected content.';
                document.getElementById('message').style.color = 'green';
            } else {
                protectedContent.style.display = 'none';
                document.getElementById('error').innerText = 'You are logged in, but you do not have permission to view this content.';
                document.getElementById('error').style.color = 'red';
            }
        }

    } else { // Not authenticated
        if (profileElement) profileElement.style.display = 'none';
        if (profileName) profileName.innerText = '';
        if (profileEmail) profileEmail.innerText = '';

        if (protectedContent) protectedContent.style.display = 'none';
        // Clear messages if not logged in
        document.getElementById('message').innerText = '';
        document.getElementById('error').innerText = '';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    configureAuth0AndSetupUI();
});
