import { defineConfig } from '@prisma/config';
import 'dotenv/config';

const getDatabaseUrl = () => {
    let url = process.env.DATABASE_URL;
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
