import axios from 'axios';

const axiosInstanceDirectus = axios.create({
    baseURL: 'http://localhost:8055/items',
    withCredentials: true, // Ensures cookies are sent with requests
});

// No need for request interceptor to attach tokens
export default axiosInstanceDirectus;
