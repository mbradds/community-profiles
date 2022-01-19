import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const webpackOutputs = (function () {
  const filenames = [["trans_mountain", true]];

  function entryJs() {
    const paths = {};
    filenames.forEach((name) => {
      if (name[1]) {
        paths[`js/iamc/${name[0]}`] = `./src/entry_points/${name[0]}.js`;
      }
    });
    return paths;
  }

  function outputHtml() {
    const html = [];
    filenames.forEach((name) => {
      if (name[1]) {
        html.push(
          new HtmlWebpackPlugin({
            filename: `index.html`,
            template: "src/components/iamc.html",
            chunks: [`js/iamc/${name[0]}`],
            minify: { collapseWhitespace: true },
          })
        );
      }
    });
    html.push(
      new HtmlWebpackPlugin({
        filename: `html/tutorial/tutorial.html`,
        template: "src/components/tutorial.html",
        inject: false,
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
          to: path.resolve(__dirname, "dist", "html", "tutorial", "images"),
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
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
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
      // {
      //   test: /\.png$/,
      //   include: /node_modules/,
      //   use: {
      //     loader: "file-loader",
      //     options: {
      //       publicPath: "../../images",
      //       outputPath: "images",
      //       name: "[name].png",
      //     },
      //   },
      //   type: "javascript/auto",
      // },
    ],
  },

  resolve: {
    extensions: ["*", ".js"],
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
