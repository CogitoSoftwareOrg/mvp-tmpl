import type { MemoryApp } from '$lib/apps/memory/core';

import { ChatAppImpl } from './app';

export const getChatApp = (memoryApp: MemoryApp) => {
	return new ChatAppImpl(memoryApp);
};
