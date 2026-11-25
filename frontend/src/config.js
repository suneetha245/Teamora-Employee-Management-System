export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006/api';
export const FILE_URL = API_URL.replace(/\/api\/?$/, '');

// Replace with your own photos by dropping files into /public and pointing these at them (e.g. '/team.jpg').
export const HERO_IMAGE = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80';
export const LOGIN_IMAGE = 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1400&q=80';
export const ABOUT_IMAGE = 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80';

export const STATUSES = ['Active', 'Probation', 'On Leave', 'Resigned'];
