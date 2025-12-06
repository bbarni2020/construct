// This is just a very simple API route that throws an example error.
// Feel free to delete this file and the entire sentry route.

export const GET = async () => {
	console.log('log3')
	throw new Error('Sentry Example API Route Error');
};
