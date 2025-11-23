import OpenAI from 'openai';
import { observeOpenAI } from '@langfuse/openai';

import { OPENAI_API_KEY, GROK_API_KEY } from '$env/static/private';

export const openai = observeOpenAI(
	new OpenAI({
		apiKey: OPENAI_API_KEY
	})
);

export const grok = observeOpenAI(
	new OpenAI({
		baseURL: 'https://api.x.ai/v1',
		apiKey: GROK_API_KEY
	})
);
