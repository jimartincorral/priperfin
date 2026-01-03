import { defineConfig } from '@prisma/config';
import 'dotenv/config';

const getDatabaseUrl = () => {
    let url = process.env.DATABASE_URL;
    
    if (!url) {
        console.warn('[Prisma Config] Warning: DATABASE_URL not set, defaulting to "file:./dev.db"');
        url = 'file:./dev.db';
    }

    if (url && !url.startsWith('file:') && !url.startsWith('postgresql:') && !url.startsWith('postgres:')) {
        url = `file:${url}`;
    }
    return url;
};

export default defineConfig({
    datasource: {
        url: getDatabaseUrl()
    }
});
