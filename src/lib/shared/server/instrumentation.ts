import { NodeSDK } from '@opentelemetry/sdk-node';
import { LangfuseSpanProcessor } from '@langfuse/otel';
import {
	LANGFUSE_PUBLIC_KEY,
	LANGFUSE_SECRET_KEY,
	LANGFUSE_BASE_URL,
	ENV
} from '$env/static/private';

export const langfuseSpanProcessor = new LangfuseSpanProcessor({
	publicKey: LANGFUSE_PUBLIC_KEY,
	secretKey: LANGFUSE_SECRET_KEY,
	environment: ENV,
	baseUrl: LANGFUSE_BASE_URL
});

const sdk = new NodeSDK({
	spanProcessors: [langfuseSpanProcessor]
});

sdk.start();
