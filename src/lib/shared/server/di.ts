import type { UserApp } from '$lib/apps/user/core';
import type { ChatApp } from '$lib/apps/chat/core';
import type { EdgeApp } from '$lib/apps/edge/core';
import type { BrainApp } from '$lib/apps/brain/core';
import type { JobApp } from '$lib/apps/job/core';
import type { SourceApp } from '$lib/apps/source/core';

import { getUserApp } from '$lib/apps/user/di';
import { getChatApp } from '$lib/apps/chat/di';
import { getEdgeApp } from '$lib/apps/edge/di';
import { getBrainApp } from '$lib/apps/brain/di';
import { getJobApp } from '$lib/apps/job/di';
import { getSourceApp } from '$lib/apps/source/di';

export type DI = {
	user: UserApp;
	chat: ChatApp;
	edge: EdgeApp;
	brain: BrainApp;
	job: JobApp;
	source: SourceApp;
};

let di: DI | null = null;

export const getDI = () => {
	if (di) return di;

	const userApp = getUserApp();
	const chatApp = getChatApp();
	const sourceApp = getSourceApp();

	const jobApp = getJobApp();
	const brainApp = getBrainApp(chatApp, userApp);
	const edgeApp = getEdgeApp(userApp, brainApp);

	di = {
		source: sourceApp,
		user: userApp,
		chat: chatApp,
		edge: edgeApp,
		brain: brainApp,
		job: jobApp
	};

	return di;
};
