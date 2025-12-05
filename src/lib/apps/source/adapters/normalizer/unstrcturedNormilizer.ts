import { env } from '$env/dynamic/private';

import { Collections, pb, type ChunksResponse, type SourcesResponse } from '$lib/shared';
import { LLMS, TOKENIZERS } from '$lib/shared/server';
import { type Normalizer, NORMILIZE_CHUNK_CHAR_LIMIT } from '../../core';

export type UnstructuredChunk = {
	element_id: string;
	text: string;
	type: string;
	metadata: Record<string, unknown>;
};

export class UnstrcturedNormilizer implements Normalizer {
	constructor() {}

	async normalize(source: SourcesResponse, file: File): Promise<ChunksResponse[]> {
		const formData = new FormData();
		formData.append('files', file, source.file ?? file.name);
		formData.append('chunking_strategy', 'by_title');
		formData.append('max_characters', String(NORMILIZE_CHUNK_CHAR_LIMIT));
		// formData.append('combine_under_n_chars', '500');
		formData.append('overlap', String(Math.floor(NORMILIZE_CHUNK_CHAR_LIMIT / 5)));

		const headers = {
			'unstructured-api-key': env.UNSTRUCTURED_API_KEY
		};
		const response = await fetch(`${env.UNSTRUCTURED_URL}/general/v0/general`, {
			method: 'POST',
			headers,
			body: formData
		});

		if (!response.ok) {
			const text = await response.text().catch(() => '');
			throw new Error(
				`Failed to normalize via Unstructured: ${response.status} ${response.statusText} ${text}`
			);
		}

		const elements = (await response.json()) as UnstructuredChunk[];

		const chunks = await Promise.all(
			elements.map(async (element) => {
				return await pb.collection(Collections.Chunks).create({
					source: source.id,
					content: element.text,
					tokens: TOKENIZERS[LLMS.GROK_4_FAST_NON_REASONING].encode(element.text).length,
					metadata: element.metadata
				});
			})
		);

		return chunks;
	}
}
