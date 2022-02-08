const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  webpack: function (config, env) {
    config.module.rules[1].oneOf.unshift({
      test: /\.svg$/,
      loader: require.resolve('svg-inline-loader'),
      options: {removeSVGTagAttrs: false, removeTags: true}
    });
    // suppresses warnings about not having fs and child_process available.
    config.resolve.fallback = {};
    config.resolve.fallback.child_process = false;
    config.resolve.fallback.fs = false;

    config.ignoreWarnings = [/Failed to parse source map/];

    // adds poly fills for http, https and path.
    config.plugins.push(new NodePolyfillPlugin({
              excludeAliases: [
                  "assert",
                  "console",
                  "constants",
                  "crypto",
                  "domain",
                  "events",
                  "os",
                  "punycode",
                  "querystring",
                  "_stream_duplex",
                  "_stream_passthrough",
                  "_stream_transform",
                  "_stream_writable",
                  "string_decoder",
                  "sys",
                  "timers",
                  "tty",
                  "url",
                  "util",
                  "vm",
                  "zlib"
              ]
          }));
    return config;
  }
};
