import * as parts from "./webpack.config.common";
import * as path from "path";
import { Configuration, DefinePlugin } from "webpack";
import { merge } from "webpack-merge";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";

// FIXME: why can't I do an import of this?
const { mode } = require("webpack-nano/argv");

function page({ title, description }: { title: string; description: string }) {
  return {
    plugins: [
      new HtmlWebpackPlugin({
        context: { title, description },
        template: "./src/index.html",
        chunks: ["main"],
        // filename: "./index.html",
        // cache: true,
      }),
    ],
  };
}

const commonConfig = merge<Configuration>([
  parts.config(),
  {
    entry: {
      main: ["./src/index.tsx"],
    },
    plugins: [
      new DefinePlugin({
        "process.env.PLATFORM": '"site"',
      }),
    ],
  },

  page({ title: "Template", description: "Template" }),
  loadStaticResources("", ""),
  parts.loadCSS(),
  parts.loadTypescript(),
  parts.loadImages(),
  parts.loadSVGR(),
  parts.loadSVG(),
  parts.clean(),
  parts.attachRevision(),
]);

function loadStaticResources(sourceBase: string, outputDir: string) {
  return {
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: path.join(sourceBase, "public/*.*"),
            to: path.join(outputDir, "[name][ext]"),
          },
        ],
      }),
    ],
  };
}

const developmentConfig = merge<Configuration>([
  { entry: { main: ["webpack-plugin-serve/client"] } },
  parts.devServer(),
  parts.splitChunks(),
  parts.generateSourceMaps({ type: "eval-source-map" }),
]);

const productionConfig = merge<Configuration>([
  parts.splitChunks(),
  parts.minifyJavaScript(),
  parts.generateSourceMaps({ type: "source-map" }),
  // parts.checkCircularDependencies(),
]);

const getConfig = (mode: "production" | "development") => {
  process.env.NODE_ENV = mode;
  switch (mode) {
    case "production":
      return merge(commonConfig, productionConfig, { mode });
    case "development":
      return merge(commonConfig, developmentConfig, { mode });
    default:
      console.error(mode);
      throw new Error(`Trying to use an unknown mode, ${mode}`);
  }
};

console.log(JSON.stringify(getConfig(mode), null, 2));

export default getConfig(mode);
