import dotenv from 'dotenv';

dotenv.config();

const apiToken = process.env.API_TOKEN;

if (!apiToken) {
    throw new Error('Missing environment variable: API_TOKEN');
}

export default apiToken;
