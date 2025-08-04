import { Job } from 'bullmq';
import { IProcessMailboxJob, SyncState, ProcessMailboxError } from '@open-archiver/types';
import { IngestionService } from '../../services/IngestionService';
import { logger } from '../../config/logger';
import { EmailProviderFactory } from '../../services/EmailProviderFactory';
import { StorageService } from '../../services/StorageService';

/**
 * This processor handles the ingestion of emails for a single user's mailbox.
 * If an error occurs during processing (e.g., an API failure),
 * it catches the exception and returns a structured error object instead of throwing.
 * This prevents a single failed mailbox from halting the entire sync cycle for all users.
 * The parent 'sync-cycle-finished' job is responsible for inspecting the results of all
 * 'process-mailbox' jobs, aggregating successes, and reporting detailed failures.
 */
export const processMailboxProcessor = async (job: Job<IProcessMailboxJob, SyncState, string>) => {
    const { ingestionSourceId, userEmail } = job.data;

    logger.info({ ingestionSourceId, userEmail }, `Processing mailbox for user`);

    try {
        const source = await IngestionService.findById(ingestionSourceId);
        if (!source) {
            throw new Error(`Ingestion source with ID ${ingestionSourceId} not found`);
        }

        const connector = EmailProviderFactory.createConnector(source);
        const ingestionService = new IngestionService();
        const storageService = new StorageService();

        // Pass the sync state for the entire source, the connector will handle per-user logic if necessary
        for await (const email of connector.fetchEmails(userEmail, source.syncState)) {
            if (email) {
                await ingestionService.processEmail(email, source, storageService, userEmail);
            }
        }

        const newSyncState = connector.getUpdatedSyncState(userEmail);

        logger.info({ ingestionSourceId, userEmail }, `Finished processing mailbox for user`);

        // Return the new sync state to be aggregated by the parent flow
        return newSyncState;
    } catch (error) {
        logger.error({ err: error, ingestionSourceId, userEmail }, 'Error processing mailbox');
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        const processMailboxError: ProcessMailboxError = {
            error: true,
            message: `Failed to process mailbox for ${userEmail}: ${errorMessage}`
        };
        return processMailboxError;
    }
};
