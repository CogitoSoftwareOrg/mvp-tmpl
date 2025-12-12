import { pb, type UsersResponse, type UserExpand, Collections } from '$lib';
import { chatsStore } from '$lib/apps/chat/client';
import { sourcesStore } from '$lib/apps/source/client';

export async function globalUserLoad() {
	console.log('globalUserLoad', pb.authStore.isValid);
	if (!pb.authStore.isValid) {
		return { user: null, sub: null, chatsRes: null, sourcesRes: null };
	}

	try {
		const res = await pb.collection(Collections.Users).authRefresh({ expand: 'subs_via_user' });
		const user = res.record as UsersResponse<UserExpand>;
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
