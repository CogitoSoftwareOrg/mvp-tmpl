import { pb, type UsersResponse, type UserExpand, Collections, nanoid } from '$lib';
import { chatsStore } from '$lib/apps/chat/client';
import { sourcesStore } from '$lib/apps/source/client';

export async function globalUserLoad() {
	console.log('globalUserLoad', pb.authStore.isValid);
	let user: UsersResponse<UserExpand> | null = null;

	if (!pb.authStore.isValid) {
		try {
			user = await authGuest();
		} catch (error) {
			console.error(error);
			pb.authStore.clear();
			return { user: null, sub: null, chatsRes: null, sourcesRes: null };
		}
	}

	try {
		const res = await pb.collection(Collections.Users).authRefresh({ expand: 'subs_via_user' });
		user = res.record as UsersResponse<UserExpand>;

		const sub = user.expand?.subs_via_user?.at(0) ?? null;

		const chatsRes = await chatsStore.load(user.id);
		const sourcesRes = await sourcesStore.load(user.id);
		return { user, sub, chatsRes, sourcesRes };
	} catch (error) {
		console.error(error);
		pb.authStore.clear();
		return { user: null, sub: null, chatsRes: null, sourcesRes: null };
	}
}

async function authGuest() {
	let guestId = localStorage.getItem('guest_id') ?? '';
	let randomPassword = localStorage.getItem('guest_password') ?? '';

	if (!guestId || !randomPassword) {
		guestId = nanoid();
		randomPassword = nanoid();
		await pb.collection(Collections.Users).create({
			guest: guestId,
			password: randomPassword,
			passwordConfirm: randomPassword
		});
	}
	localStorage.setItem('guest_id', guestId);
	localStorage.setItem('guest_password', randomPassword);

	const authRes = await pb
		.collection(Collections.Users)
		.authWithPassword(guestId, randomPassword, { expand: 'subs_via_user' });
	return authRes.record as UsersResponse<UserExpand>;
}
