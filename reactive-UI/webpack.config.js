module.exports = {
    target: "web",
    node: {
      __dirname: false,
    },
    module: {
      rules: [
        {
          test: /\.node$/,
          loader: "node-loader",
        },
      ],
    },
  };