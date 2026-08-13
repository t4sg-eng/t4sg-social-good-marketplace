// Local-only Next.js overrides (not committed — see .gitignore).
// Copy from next.config.local.example.js if setting up on macOS.

/** @typedef {{ watchOptions?: { poll: number, aggregateTimeout: number, ignored: RegExp } }} DevWebpackConfig */

/** @type {import("next").NextConfig} */
const localConfig = {
  // Dev-only webpack override to work around macOS EMFILE ("too many open files")
  // errors that break native file watching and hot reload.
  webpack: (
    /** @type {DevWebpackConfig} */ config,
    /** @type {{ dev: boolean }} */ { dev },
  ) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }
    return config;
  },
};

export default localConfig;
