import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const tutorialText = require("./src/components/tutorialText.json");

const __dirname = path.resolve();

const webpackOutputs = (function () {
  const filenames = ["trans_mountain"];

  function entryJs() {
    const paths = {};
    filenames.forEach((name) => {
      paths[`js/iamc/${name}`] = `./src/entry_points/${name}.ts`;
      paths[`js/iamc/tutorial`] = `./src/entry_points/tutorial.ts`;
    });
    return paths;
  }

  function outputHtml() {
    const html = [];
    filenames.forEach((name) => {
      html.push(
        new HtmlWebpackPlugin({
          filename: `index.html`,
          template: "src/components/iamc.hbs",
          chunks: [`js/iamc/${name}`],
          minify: { collapseWhitespace: true },
        })
      );
    });
    html.push(
      new HtmlWebpackPlugin({
        page: JSON.parse(JSON.stringify(tutorialText)),
        filename: `tutorial.html`,
        template: "src/components/tutorial.hbs",
        // inject: false,
        chunks: [`js/iamc/tutorial`],
        minify: true,
      })
    );
    return html;
  }

  return {
    entryJs,
    outputHtml,
  };
})();

export default {
  entry: webpackOutputs.entryJs(),
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
    filename: "[name].[contenthash].js",
  },

  plugins: [
    ...webpackOutputs.outputHtml(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src", "GCWeb"),
          to: path.resolve(__dirname, "dist", "GCWeb"),
        },
        {
          from: path.resolve(__dirname, "src", "components", "images"),
          to: path.resolve(__dirname, "dist", "images", "tutorial"),
        },
        {
          from: path.resolve(
            __dirname,
            "node_modules",
            "leaflet",
            "dist",
            "images"
          ),
          to: path.resolve(__dirname, "dist", "images"),
        },
        {
          from: path.resolve(
            __dirname,
            "src",
            "company_data",
            "community_profiles",
            "images"
          ),
          to: path.resolve(__dirname, "dist", "images", "territories"),
        },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: "main.[contenthash].css",
    }),
    new CleanWebpackPlugin(),
  ],

  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        exclude: /node_modules/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
        sideEffects: true,
      },
      {
        test: /\.css$/,
        include: /node_modules/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader", options: { url: false } },
        ],
        sideEffects: true,
      },
      {
        test: /\.png$/,
        exclude: /node_modules/,
        use: {
          loader: "file-loader",
          options: {
            publicPath: "dist/images/",
            outputPath: "images",
            name: "[name].[contenthash].png",
          },
        },
        type: "javascript/auto",
      },
      {
        test: /\.hbs$/,
        loader: "handlebars-loader",
        options: {
          precompileOptions: {
            noEscape: true,
            strict: true,
            knownHelpersOnly: false,
          },
          // runtime: path.resolve(__dirname, "src/components/helpers.cjs"),
          // knownHelpersOnly: false,
        },
      },
    ],
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },

  optimization: {
    usedExports: true,
    runtimeChunk: {
      name: "shared/runtime.js",
    },
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        defaultVendors: {
          enforce: true,
          test: /node_modules/,
          filename: "js/vendor/vendor.[contenthash].js",
          reuseExistingChunk: true,
        },
      },
    },
  },
};
