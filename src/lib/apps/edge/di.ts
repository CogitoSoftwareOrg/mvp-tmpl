import type { UserApp } from '$lib/apps/user/core';
import type { BrainApp } from '$lib/apps/brain/core';

import { EdgeAppImpl } from './app';

export const getEdgeApp = (userApp: UserApp, brainApp: BrainApp) => {
	return new EdgeAppImpl(userApp, brainApp);
};
