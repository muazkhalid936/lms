/**
 * Cookie utility functions to replace sessionStorage operations
 */

/**
 * Set a cookie with optional expiration
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Days until expiration (default: session cookie)
 * @param {string} path - Cookie path (default: '/')
 */
export function setCookie(name, value, days = null, path = '/') {
  let expires = '';
  
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = `; expires=${date.toUTCString()}`;
  }
  
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=${path}; SameSite=Lax`;
}

/**
 * Get a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null if not found
 */
export function getCookie(name) {
  if (typeof document === 'undefined') return null;
  
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');
  
  for (let cookie of cookies) {
    let c = cookie.trim();
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length));
    }
  }
  
  return null;
}

/**
 * Remove a cookie by name
 * @param {string} name - Cookie name
 * @param {string} path - Cookie path (default: '/')
 */
export function removeCookie(name, path = '/') {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
}

/**
 * Set a JSON object as a cookie
 * @param {string} name - Cookie name
 * @param {object} value - Object to store
 * @param {number} days - Days until expiration
 */
export function setJSONCookie(name, value, days = null) {
  setCookie(name, JSON.stringify(value), days);
}

/**
 * Get a JSON object from a cookie
 * @param {string} name - Cookie name
 * @returns {object|null} Parsed object or null if not found/invalid
 */
export function getJSONCookie(name) {
  const value = getCookie(name);
  if (!value) return null;
  
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error(`Error parsing JSON cookie ${name}:`, error);
    return null;
  }
}

/**
 * Clear all cookies with a specific prefix
 * @param {string} prefix - Cookie name prefix to clear
 */
export function clearCookiesWithPrefix(prefix) {
  if (typeof document === 'undefined') return;
  
  const cookies = document.cookie.split(';');
  
  for (let cookie of cookies) {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    
    if (name.startsWith(prefix)) {
      removeCookie(name);
    }
  }
}

/**
 * Clear all application-specific cookies
 */
export function clearAllAppCookies() {
  // Clear auth-related cookies
  removeCookie('token');
  removeCookie('userId');
  
  // Clear checkout-related cookies
  removeCookie('checkoutCourse');
  
  // Clear any other app-specific cookies
  clearCookiesWithPrefix('dream-lms-');
}