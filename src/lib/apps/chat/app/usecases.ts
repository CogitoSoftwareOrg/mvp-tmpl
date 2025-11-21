import type { ChatApp, SendUserMessageCmd } from '../core';

export class ChatAppImpl implements ChatApp {
	async run(cmd: SendUserMessageCmd): Promise<string> {
		console.log('run', cmd);
		return 'Hello, world!';
	}

	async runStream(cmd: SendUserMessageCmd): Promise<ReadableStream> {
		console.log('runStream', cmd);
		return new ReadableStream({
			async start(controller) {
				controller.enqueue('Hello, world!');
				controller.close();
			}
		});
	}
}
