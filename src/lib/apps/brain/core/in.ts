export interface BrainRunCmd {
	userId: string;
	chatId: string;
	query: string;
}

export interface BrainApp {
	ask(cmd: BrainRunCmd): Promise<string>;
	askStream(cmd: BrainRunCmd): Promise<ReadableStream>;
}
