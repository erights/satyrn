const path = require("path");
const merge = require("webpack-merge");
const base = require("./webpack.base.config");

module.exports = env => {
  return merge(base(env), {
    entry: {
      background: "./src/background.js",
      app: "./src/window.js",
      windowState: "./src/state/windowState.js",
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "../app")
    }
    },
 );
};
