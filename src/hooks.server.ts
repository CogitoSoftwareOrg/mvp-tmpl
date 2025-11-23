import '$lib/shared/server/instrumentation';
import '$lib/shared/server/tg';

import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { PB_EMAIL, PB_PASSWORD } from '$env/static/private';

import { Collections, pb } from '$lib';
import { getDI } from '$lib/shared/server';

const handleLogger: Handle = async ({ event, resolve }) => {
	console.log(event.request.method, event.url.pathname);
	return resolve(event);
};

const handleAdminPocketbase: Handle = async ({ event, resolve }) => {
	if (pb.authStore.isValid) return resolve(event);

	await pb.collection(Collections.Superusers).authWithPassword(PB_EMAIL, PB_PASSWORD);
	return resolve(event);
};

const handleUserAuth: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('pb_token');
	if (!token) return resolve(event);

	event.locals.di = getDI();

	try {
		const principal = await event.locals.di.user.auth({ token });
		event.locals.principal = principal;
	} catch (error) {
		console.warn(error);
	}
	return resolve(event);
};

export const handle = sequence(handleLogger, handleAdminPocketbase, handleUserAuth);
