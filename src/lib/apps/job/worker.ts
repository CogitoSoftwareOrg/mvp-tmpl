import { env } from '$env/dynamic/private';

import { Collections, pb, type JobExpand, type JobsResponse } from '$lib';
import { getDI } from '$lib/shared/server';

const JOB_RUN_INTERVAL = 30 * 1000;

export function startWorker() {
	console.log('Starting job worker...');
	const di = getDI();

	setInterval(async () => {
		console.log('Running job worker...');
		await ensureAdminPb();

		const jobs: JobsResponse<unknown, JobExpand>[] = await pb
			.collection(Collections.Jobs)
			.getFullList({
				filter: 'enabled != null && nextRun <= @now',
				expand: 'lastRun'
			});
		for (const job of jobs) {
			try {
				const jobRun = await di.job.shedule(job);
				await di.job.run(jobRun);
			} catch (error) {
				console.error(error, 'Failed to schedule job!');
				continue;
			}
		}
	}, JOB_RUN_INTERVAL);
}

async function ensureAdminPb() {
	if (!pb.authStore.isValid) {
		try {
			await pb.collection(Collections.Superusers).authWithPassword(env.PB_EMAIL, env.PB_PASSWORD);
		} catch (error) {
			console.error(error, 'Failed to authenticate admin user! Oh no!');
			throw error;
		}
	}
}
