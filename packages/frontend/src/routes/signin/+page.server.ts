import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
	const { locals } = event;
	if (locals.user) {
		throw redirect(307, '/dashboard');
	}
}) satisfies PageServerLoad;
