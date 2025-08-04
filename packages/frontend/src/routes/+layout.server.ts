import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import 'dotenv/config';


export const load: LayoutServerLoad = async ({ locals }) => {
    return {
        user: locals.user,
        accessToken: locals.accessToken,
        isDemo: process.env.IS_DEMO === 'true'
    };
};
