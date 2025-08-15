import { Job } from 'bullmq';
import { db } from '../../database';
import { ingestionSources } from '../../database/schema';
import { or, eq } from 'drizzle-orm';
import { ingestionQueue } from '../queues';

export default async (job: Job) => {
	console.log('Scheduler running: Looking for active or error ingestion sources to sync.');
	// find all sources that have the status of active or error for continuous syncing.
	const sourcesToSync = await db
		.select({ id: ingestionSources.id })
		.from(ingestionSources)
		.where(or(eq(ingestionSources.status, 'active'), eq(ingestionSources.status, 'error')));

	for (const source of sourcesToSync) {
		// The status field on the ingestion source is used to prevent duplicate syncs.
		await ingestionQueue.add('continuous-sync', { ingestionSourceId: source.id });
	}
};
