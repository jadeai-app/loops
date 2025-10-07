// @ts-check

import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing Next.js configuration ...
  // For example:
  // reactStrictMode: true,
};

const sentryConfig = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,
  org: "your-sentry-org", // Replace with your Sentry organization slug
  project: "your-sentry-project", // Replace with your Sentry project slug
};

// Make sure to source maps in production
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#use-hidden-source-maps
const sentryWithSourceMaps = {
  ...sentryConfig,
  sentry: {
    hideSourceMaps: true,
  },
};

export default withSentryConfig(
  nextConfig,
  sentryWithSourceMaps,
  // Additional config for Sentry
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors.
    // See the following for more information:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/integrations/vercel-cron/
    automaticVercelMonitors: true,
  }
);