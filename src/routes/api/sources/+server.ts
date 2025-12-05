import { error, json } from '@sveltejs/kit';

export const POST = async ({ request, locals }) => {
	const { principal, di } = locals;

	if (!principal?.user) throw error(401, 'Unauthorized');

	const formData = await request.formData();
	const file = formData.get('file') as File | null;
	const title = formData.get('title') as string | null;
	const url = formData.get('url') as string | null;
	const metadata = JSON.parse(formData.get('metadata') as string) as Record<string, unknown>;

	if (!file && !url) throw error(400, 'Either file or url is required');

	await di.edge.addSource({
		principal,
		mode: file ? 'file' : 'url',
		file: file ?? undefined,
		title: title ?? undefined,
		url: url ?? undefined,
		metadata: metadata ?? undefined
	});

	return json('Source added successfully');
};
