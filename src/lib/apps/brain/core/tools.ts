import z from 'zod';
import { zodFunction } from 'openai/helpers/zod.js';

import { Importance as UserImportance } from '$lib/apps/user/core';
import { Importance as ChatImportance, EventType as ChatEventType } from '$lib/apps/chat/core';

export const SaveMemoriesArgs = z.object({
	userMemories: z.array(
		z.object({
			importance: z.enum(Object.values(UserImportance)).describe('The importance of the profile'),
			content: z.string().describe('The content of the profile')
		})
	),
	chatEventMemories: z.array(
		z.object({
			type: z.enum(Object.values(ChatEventType)).describe('The type of the event'),
			importance: z.enum(Object.values(ChatImportance)).describe('The importance of the event'),
			content: z.string().describe('The content of the event')
		})
	)
});
export const SaveMemoriesToolSchema = zodFunction({
	name: 'save_memories',
	description: 'Save important new memories',
	parameters: SaveMemoriesArgs
});
