export const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return null;
};

export const setCookie = (name, value, options = {}) => {
    const {
        path = '/',
        expires,
        sameSite = 'strict',
        secure = process.env.NODE_ENV === 'production'
    } = options;

    let cookie = `${name}=${value}`;
    
    if (path) cookie += `; path=${path}`;
    if (expires) cookie += `; expires=${expires.toUTCString()}`;
    if (sameSite) cookie += `; samesite=${sameSite}`;
    if (secure) cookie += `; secure`;
    
    document.cookie = cookie;
};

export const removeCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}; 