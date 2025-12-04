import type { Agent } from '$lib/shared/server';

import { MeiliChatEventIndexer, NamerAgent } from './adapters';
import { ChatAppImpl } from './app';
import type { ChatApp, UtilsMode } from './core';

export const getChatApp = (): ChatApp => {
	const chatEventIndexer = new MeiliChatEventIndexer();
	chatEventIndexer.migrate().then(() => {
		console.log('Chat event indexers migrated');
	});
	const agents: Record<UtilsMode, Agent> = {
		name: new NamerAgent()
	};
	return new ChatAppImpl(agents, chatEventIndexer);
};
