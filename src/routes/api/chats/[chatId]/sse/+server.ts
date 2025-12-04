import { propagateAttributes, startActiveObservation } from '@langfuse/tracing';
import { error } from '@sveltejs/kit';

import { streamWithTracing } from '$lib/shared/server';

export const GET = async ({ params, url, locals }) => {
	const { chatId } = params;
	const { principal, di } = locals;
	const query = url.searchParams.get('q') || '';

	if (!principal?.user) throw error(401, 'Unauthorized');
	if (!chatId) throw error(400, 'Missing required parameters');

	return await startActiveObservation('chat-sse', async () => {
		return await propagateAttributes(
			{
				userId: principal?.user?.id,
				sessionId: chatId
			},
			async () => {
				const stream = await di.edge.streamChat({
					principal,
					chatId,
					query
				});
				const withTracing = streamWithTracing(stream);
				return new Response(withTracing, {
					headers: {
						'Content-Type': 'text/event-stream',
						'Cache-Control': 'no-cache',
						Connection: 'keep-alive'
					}
				});
			}
		);
	});
};
