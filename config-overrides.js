module.exports = {
  webpack: function (config, env) {
    config.module.rules[2].oneOf.unshift({
      test: /\.svg$/,
      loader: require.resolve('svg-inline-loader'),
      options: {removeSVGTagAttrs: false, removeTags: true}
    });
    return config;
  }
};
