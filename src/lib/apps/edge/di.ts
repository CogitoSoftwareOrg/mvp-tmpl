import type { UserApp } from '$lib/apps/user/core';
import type { BrainApp } from '$lib/apps/brain/core';
import type { SourceApp } from '$lib/apps/source/core';

import { EdgeAppImpl } from './app';

export const getEdgeApp = (userApp: UserApp, brainApp: BrainApp, sourceApp: SourceApp) => {
	return new EdgeAppImpl(userApp, brainApp, sourceApp);
};
