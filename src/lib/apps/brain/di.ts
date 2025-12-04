import type { Agent } from '$lib/shared/server';
import type { ChatApp } from '$lib/apps/chat/core';
import type { UserApp } from '$lib/apps/user/core';

import { BrainAppImpl } from './app';
import { SimpleAgent } from './adapters';
import type { BrainApp, Mode } from './core';

export const getBrainApp = (chatApp: ChatApp, userApp: UserApp): BrainApp => {
	const agents: Record<Mode, Agent> = {
		simple: new SimpleAgent([])
	};

	return new BrainAppImpl(agents, chatApp, userApp);
};
