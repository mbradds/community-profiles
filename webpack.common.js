import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const webpackOutputs = (function () {
  const filenames = [
    ["ngtl", true],
    ["trans_mountain", true],
    ["alliance", false],
    ["norman_wells", false],
    ["enbridge_mainline", true],
    ["keystone", true],
    ["tcpl", true],
    ["trans_northern", false],
    ["westcoast", true],
    ["montreal", false],
    ["aurora", false],
    ["emera", false],
    ["foothills", false],
    ["many_islands", false],
    ["mnp", false],
    ["cochin", false],
    ["plains", false],
    ["southern_lights", false],
    ["tqm", false],
    ["genesis", false],
    ["vector", false],
    ["westspur", false],
    ["enbridge_bakken", false],
  ];

  function entryJs() {
    const paths = {};
    filenames.forEach((name) => {
      if (name[1]) {
        paths[`js/iamc/${name[0]}`] = `./src/entry_points/iamc/${name[0]}.js`;
      }
      paths[
        `js/pipeline-profiles/${name[0]}`
      ] = `./src/entry_points/pipeline-profiles/${name[0]}.js`;
    });
    return paths;
  }

  function outputHtml() {
    const html = [];
    filenames.forEach((name) => {
      const htmls = [
        new HtmlWebpackPlugin({
          filename: `html/pipeline-profiles/${name[0]}.html`,
          template: "src/components/pipeline-profiles.html",
          chunks: [`js/pipeline-profiles/${name[0]}`],
          minify: { collapseWhitespace: true },
        }),
      ];
      if (name[1]) {
        htmls.push(
          new HtmlWebpackPlugin({
            filename: `html/${name[0]}.html`,
            template: "src/components/iamc.html",
            chunks: [`js/iamc/${name[0]}`],
            minify: { collapseWhitespace: true },
          })
        );
      }
      html.push(...htmls);
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
    // new BundleAnalyzerPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src", "GCWeb"),
          to: path.resolve(__dirname, "dist", "GCWeb"),
        },
        {
          from: path.resolve(__dirname, "src", "index.html"),
          to: path.resolve(__dirname, "dist", "index.html"),
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
          to: path.resolve(__dirname, "dist", "html", "images"),
        },
        {
          from: path.resolve(
            __dirname,
            "src",
            "company_data",
            "community_profiles",
            "images"
          ),
          to: path.resolve(__dirname, "dist", "images"),
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
