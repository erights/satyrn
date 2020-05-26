const path = require("path");
const merge = require("webpack-merge");
const base = require("./webpack.base.config");

module.exports = env => {
  return merge(base(env), {
    entry: {
      application: "./src/application.js",
      window: "./src/window.js",
      browserState: "./src/state/application/windowState.js",
      // contentState: "./stc/state/contentState.js"
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "../app")
    }
  },
  );
};
