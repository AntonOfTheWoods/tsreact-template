/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as path from "path";
import * as webpack from "webpack";
// in case you run into any typescript error when configuring `devServer`
import "webpack-dev-server";
import { WebpackPluginServe } from "webpack-plugin-serve";

import { GitRevisionPlugin } from "git-revision-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CircularDependencyPlugin from "circular-dependency-plugin";

export function config(ouputDir = "./dist"): webpack.Configuration {
  return {
    resolve: {
      extensions: [".ts", ".tsx", ".js"],
      fallback: {
        // this is required for rxdb 10
        fs: false,
        tls: false,
        net: false,
        path: false,
        zlib: false,
        http: false,
        https: false,
        stream: false,
        crypto: false,
      },
    },
    output: {
      path: path.resolve(__dirname, ouputDir),
      filename: "[name]-bundle.js",
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: "process/browser",
      }),
    ],
  };
}

export function splitChunks() {
  return {
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendor",
            chunks: "initial" as "initial" | "all" | "async",
          },
        },
      },
    },
  };
}

export function checkCircularDependencies() {
  return {
    plugins: [
      new CircularDependencyPlugin({
        // exclude detection of files based on a RegExp
        exclude: /a\.js|node_modules/,
        // include specific files based on a RegExp
        include: /src/,
        // add errors to webpack instead of warnings
        failOnError: true,
        // allow import cycles that include an asyncronous import,
        // e.g. via import(/* webpackMode: "weak" */ './file.js')
        allowAsyncCycles: false,
        // set the current working directory for displaying module paths
        cwd: process.cwd(),
      }),
    ],
  };
}

export function clean() {
  return {
    output: {
      clean: true,
    },
  };
}

export function devServer(path = "./dist") {
  return {
    watch: true,
    plugins: [
      new WebpackPluginServe({
        port: process.env.PORT || 5000,
        static: path,
        liveReload: true,
        waitForBuild: true,
      }),
    ],
  };
}

export function page({ title }: { title: string }) {
  return {
    plugins: [new HtmlWebpackPlugin({ context: { title } })],
  };
}

export function loadTypescript(src = "src") {
  return {
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          include: path.join(__dirname, src),
          exclude: /node_modules/,
          use: ["ts-loader"],
        },
      ],
    },
  };
}

export function loadCSS() {
  return {
    module: {
      rules: [{ test: /\.css$/, use: ["style-loader", "css-loader"] }],
    },
  };
}

const APP_SOURCE = path.join(__dirname, "src");

export function loadJavaScript() {
  return {
    module: {
      rules: [
        // Consider extracting include as a parameter
        { test: /\.js$/, include: APP_SOURCE, use: "babel-loader" },
      ],
    },
  };
}

export function generateSourceMaps({ type }: { type: string }) {
  return { devtool: type };
}

export function attachRevision() {
  return {
    plugins: [
      new webpack.BannerPlugin({
        banner: new GitRevisionPlugin().version(),
      }),
    ],
  };
}

export function minifyJavaScript() {
  return {
    optimization: { minimizer: [new TerserPlugin()] },
  };
}

export function loadSVGR() {
  return {
    module: {
      rules: [
        {
          test: /\.svg$/,
          issuer: /\.tsx?$/,
          use: ["@svgr/webpack", "asset"],
        },
      ],
    },
  };
}

export function loadSVG() {
  return {
    module: {
      rules: [
        {
          test: /\.svg$/,
          use: ["asset"],
        },
      ],
    },
  };
}

export function loadImages({ limit }: { limit: number } = { limit: 30000 }) {
  return {
    module: {
      rules: [
        {
          test: /\.(jpg|jpeg|png|gif|mp3)$/,
          type: "asset",
          parser: { dataUrlCondition: { maxSize: limit } },
        },
      ],
    },
  };
}
