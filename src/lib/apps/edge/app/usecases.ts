import type { BrainApp } from '$lib/apps/brain/core';
import type { UserApp } from '$lib/apps/user/core';

import type { EdgeApp, StreamChatCmd } from '../core';

const DEFAULT_CHARGE_AMOUNT = 1;

export class EdgeAppImpl implements EdgeApp {
	constructor(
		private readonly userApp: UserApp,
		private readonly brainApp: BrainApp
	) {}

	async streamChat(cmd: StreamChatCmd): Promise<ReadableStream> {
		const { principal, chatId, query } = cmd;
		if (!principal) throw new Error('Unauthorized');
		if (principal.remaining <= 0) throw new Error('Insufficient balance');

		const brainApp = this.brainApp;
		const userApp = this.userApp;
		let charged = false;

		return new ReadableStream({
			async start(controller) {
				const encoder = new TextEncoder();
				const sendEvent = (event: string, data: string) => {
					controller.enqueue(encoder.encode(`event: ${event}\n`));
					controller.enqueue(encoder.encode(`data: ${data}\n\n`));
				};

				try {
					const stream = await brainApp.askStream({
						userId: principal.user.id,
						chatId,
						query
					});
					const reader = stream.getReader();
					while (true) {
						const { value, done } = await reader.read();
						if (done) break;
						sendEvent('chunk', value);
					}
					sendEvent('done', '');
					controller.close();
				} catch (error) {
					console.error(error);
					sendEvent('error', JSON.stringify(error));
					controller.error(error);
				} finally {
					if (!charged) {
						await userApp.charge({ subId: principal.sub.id, amount: DEFAULT_CHARGE_AMOUNT });
						charged = true;
					}
				}
			}
		});
	}
}
