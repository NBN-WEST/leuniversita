export const isMobileApp = (): boolean => {
    if (typeof window === 'undefined') return false;

    // 1. Check URL Query Parameter (immediate override)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mobile') === 'true') {
        return true;
    }

    // 2. Check User Agent (standard detection)
    const ua = window.navigator.userAgent;
    if (ua.includes('LeUniversitaMobile') || ua.includes('Android; wv')) {
        return true;
    }

    // 3. Optional: Check session storage if we want to persist the "mobile mode" for the session
    // ignoring for now to keep it stateless/dumb as requested, but usually good for SPA nav

    return false;
};
