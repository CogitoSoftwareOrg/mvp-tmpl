import type { UserApp } from '$lib/apps/user/core';
import type { ChatApp } from '$lib/apps/chat/core';
import type { EdgeApp } from '$lib/apps/edge/core';
import type { MemoryApp } from '$lib/apps/memory/core';

import { getUserApp } from '$lib/apps/user/di';
import { getChatApp } from '$lib/apps/chat/di';
import { getEdgeApp } from '$lib/apps/edge/di';
import { getMemoryApp } from '$lib/apps/memory/di';

export type DI = {
	user: UserApp;
	chat: ChatApp;
	edge: EdgeApp;
	memory: MemoryApp;
};

let di: DI | null = null;

export const getDI = () => {
	if (di) return di;

	const userApp = getUserApp();
	const memoryApp = getMemoryApp();
	const chatApp = getChatApp(memoryApp);
	const edgeApp = getEdgeApp(userApp, chatApp);
	di = {
		user: userApp,
		chat: chatApp,
		edge: edgeApp,
		memory: memoryApp
	};
	return di;
};
