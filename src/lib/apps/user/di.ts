import { MeiliUserIndexer } from './adapters';
import { UserAppImpl } from './app';
import type { UserApp } from './core';

export const getUserApp = (): UserApp => {
	const userIndexer = new MeiliUserIndexer();
	userIndexer.migrate().then(() => {
		console.log('User indexers migrated');
	});
	return new UserAppImpl(userIndexer);
};
