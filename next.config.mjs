// @ts-check

import { withSentryConfig } from "@sentry/nextjs";
import withPWAInit from "next-pwa";

/** @type {import('next').NextConfig} */
let nextConfig = {
  webpack: (config, { isServer }) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    return config;
  },
  // Your existing Next.js configuration ...
  // For example:
  // reactStrictMode: true,
};

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  // add your own strategies to cache images and static assets
  // fallbacks: {
  //   image: "/static/images/fallback.png",
  //   // document: '/offline',  // if you want to fallback to a custom page
  // },
});

nextConfig = withPWA(nextConfig);

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