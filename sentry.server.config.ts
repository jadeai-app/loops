// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // Replace this with your actual DSN
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // You can uncomment the line below to enable profiling on the server.
  // Doing so will provide insight into database queries, inefficient API calls, and other performance issues.
  // profilesSampleRate: 1.0,
});