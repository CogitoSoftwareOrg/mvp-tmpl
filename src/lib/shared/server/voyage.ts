import { VoyageAIClient } from 'voyageai';
import { env } from '$env/dynamic/private';

import { EMBEDDERS } from './llms';

export const voyage = new VoyageAIClient({ apiKey: env.VOYAGE_API_KEY });

export const voyageEmbed = async (
	input: string[],
	batchSize: number = 128,
	outputDimension: number = 1024
) => {
	const embedTasks = [];
	for (let i = 0; i < input.length; i += batchSize) {
		const batch = input.slice(i, i + batchSize);
		embedTasks.push(
			voyage.embed({
				input: batch,
				model: EMBEDDERS.VOYAGE_LITE,
				inputType: 'document',
				outputDimension
			})
		);
	}
	const embeddings = (await Promise.all(embedTasks))
		.flatMap((res) => res.data)
		.map((res) => res?.embedding);
	return embeddings;
};
