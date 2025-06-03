// js/app.js
let auth0Client = null;

// Function to fetch Auth0 configuration (Client ID and Domain)
// from a 'auth_config.json' file that Netlify will generate.
const fetchAuthConfig = async () => {
    try {
        const response = await fetch('/auth_config.json');
        return response.json();
    } catch (e) {
        console.error("Failed to load Auth0 config:", e);
        document.getElementById('error').innerText = "Auth0 configuration missing. Please check Netlify environment variables.";
        return null;
    }
};

const configureAuth0 = async () => {
    const config = await fetchAuthConfig();
    if (!config) {
        return; // Stop if config is not loaded
    }

    auth0Client = await auth0.createAuth0Client({
        domain: config.domain,
        clientId: config.clientId,
        authorizationParams: {
            redirect_uri: window.location.origin,
            // If you later decide to protect a Netlify Function with an Auth0 API,
            // you would uncomment and set the 'audience' here.
            // audience: "YOUR_AUTH0_API_IDENTIFIER",
            // scope: "openid profile email" // Add scopes as needed
        }
    });

    // Check if coming back from a redirect (e.g., after login)
    if (window.location.search.includes('code=') || window.location.search.includes('state=')) {
        try {
            await auth0Client.handleRedirectCallback();
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {
            console.error("Error handling redirect callback:", e);
            document.getElementById('error').innerText = "Authentication failed: " + e.message;
        }
    }

    updateUI();
};

const updateUI = async () => {
    const isAuthenticated = await auth0Client.isAuthenticated();

    document.getElementById('btn-logout').disabled = !isAuthenticated;
    document.getElementById('btn-login').disabled = isAuthenticated;

    if (isAuthenticated) {
        document.getElementById('profile').style.display = 'block';
        const user = await auth0Client.getUser();
        document.getElementById('profile-name').innerText = user.name || user.nickname || 'N/A';
        document.getElementById('profile-email').innerText = user.email || 'N/A';
    } else {
        document.getElementById('profile').style.display = 'none';
    }
};

const login = async () => {
    try {
        document.getElementById('message').innerText = '';
        document.getElementById('error').innerText = '';
        await auth0Client.loginWithRedirect({
            authorizationParams: {
                redirect_uri: window.location.origin
            }
        });
    } catch (e) {
        console.error("Login failed:", e);
        document.getElementById('error').innerText = "Login failed: " + e.message;
    }
};

const logout = async () => {
    try {
        document.getElementById('message').innerText = '';
        document.getElementById('error').innerText = '';
        await auth0Client.logout({
            logoutParams: {
                returnTo: window.location.origin
            }
        });
    } catch (e) {
        console.error("Logout failed:", e);
        document.getElementById('error').innerText = "Logout failed: " + e.message;
    }
};

// Initialize Auth0 when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    configureAuth0();
});
