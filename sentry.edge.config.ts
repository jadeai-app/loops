// This file configures the initialization of Sentry for edge runtimes.
// The config you add here will be used whenever an edge server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // Replace this with your actual DSN
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});