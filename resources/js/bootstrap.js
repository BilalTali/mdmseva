import axios from 'axios';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

// For Laravel Sanctum SPA authentication
window.axios.defaults.xsrfCookieName = 'XSRF-TOKEN';
window.axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

// Initialize CSRF cookie before any requests
axios.get('/sanctum/csrf-cookie').catch(error => {
    console.error('Failed to initialize CSRF token:', error);
});

/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allow your team to easily build robust real-time web applications.
 *
 * Disabled for production deployment without Pusher/Reverb configuration.
 */

// import Echo from 'laravel-echo';
// import Pusher from 'pusher-js';

// window.Pusher = Pusher;
window.Echo = null;