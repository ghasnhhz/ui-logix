import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Telegram will not load localhost, so the Mini App is developed behind a
  // cloudflared quick tunnel. Next refuses cross-origin /_next/* requests in
  // dev unless the origin is listed here — without it the tunnel serves HTML
  // and no JavaScript. Development only; production is same-origin.
  allowedDevOrigins: ["*.trycloudflare.com"],
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
