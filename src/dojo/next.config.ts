import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    // If you use remark-gfm, you'll need to use next.config.mjs
    // as the package is ESM only
    // https://github.com/remarkjs/remark-gfm#install
    remarkPlugins: [],
    rehypePlugins: [],
    // If you use `MDXProvider`, uncomment the following line.
    providerImportSource: "@mdx-js/react",
  },
});

const nextConfig: NextConfig = {
  /* config options here */
  // Configure pageExtensions to include md and mdx
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ['src'],
  },
  typescript: {
    tsconfigPath: './tsconfig.build.json',
  },
  webpack: (config, { isServer }) => {
    // Ignore the demo files during build
    config.module.rules.push({
      test: /agent\/demo\/crew_enterprise\/ui\/.*\.(ts|tsx|js|jsx)$/,
      loader: "ignore-loader",
    });

    return config;
  },
  // Proxy OpenCode API requests to avoid CORS issues
  async rewrites() {
    return [
      {
        source: '/api/opencode/:path*',
        destination: 'http://127.0.0.1:4096/:path*',
      },
    ];
  },
};

// Merge MDX config with Next.js config
export default withMDX(nextConfig);
