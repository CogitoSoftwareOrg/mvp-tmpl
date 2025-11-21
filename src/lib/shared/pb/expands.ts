import type { MessagesResponse, SubsResponse } from './pocketbase-types';

export type MessageExpand = unknown | undefined;

export type ChatExpand =
	| {
			messages_via_chat: MessagesResponse[] | undefined;
	  }
	| undefined;

export type UserExpand =
	| {
			subs_via_user: SubsResponse[] | undefined;
	  }
	| undefined;
