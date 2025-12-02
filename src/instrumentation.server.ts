import { PUBLIC_ENV } from '$env/static/public';
import * as Sentry from '@sentry/sveltekit';

Sentry.init({
	dsn:
		PUBLIC_ENV == 'staging' || PUBLIC_ENV == 'production'
			? 'https://7caab434460a1585f4c87baa1a692427@o40609.ingest.us.sentry.io/4510461147742208'
			: undefined,

	integrations: [Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] })],

	tracesSampleRate: 1.0,

	environment: PUBLIC_ENV,

	// Enable logs to be sent to Sentry
	enableLogs: true

	// uncomment the line below to enable Spotlight (https://spotlightjs.com)
	// spotlight: import.meta.env.DEV,
});

export const handleError = Sentry.handleErrorWithSentry();
