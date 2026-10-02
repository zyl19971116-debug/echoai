/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Local demo assets only — keeps the project runnable without an image
    // optimisation service or `sharp` binary present on the machine.
    unoptimized: true,
  },
};

export default nextConfig;
