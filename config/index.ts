import { defineConfig, type UserConfigExport } from "@tarojs/cli";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import devConfig from "./dev";
import prodConfig from "./prod";
import Os from "os";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import HtmlTagsPlugin from "html-webpack-tags-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig(async (merge, { command, mode }) => {
  const baseConfig: UserConfigExport = {
    projectName: "taro-demo",
    date: "2024-4-24",
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2,
    },
    sourceRoot: "src",
    outputRoot: "dist",
    plugins: [],
    defineConstants: {},
    copy: {
      patterns: [],
      options: {},
    },
    // 配置include/exclude缩小Loader对文件的搜索范围
    rules: [
      {
        exclude: /node_modules/,
        include: /src/,
        test: /\.js$/,
        use: [
          {
            loader: "babel-loader",
            options: { cacheDirectory: true },
          },
          // 并行构建
          {
            loader: "thread-loader",
            options: { workers: Os.cpus().length },
          },
        ],
      },
    ],
    framework: "react",
    compiler: "webpack5",
    cache: {
      enable: false, // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
    },
    prebundle: {
      enable: true,
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {},
        },
        url: {
          enable: true,
          config: {
            limit: 1024, // 设定转换尺寸上限
          },
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: "module", // 转换模式，取值为 global/module
            generateScopedName: "[name]__[local]___[hash:base64:5]",
          },
        },
      },
      webpackChain(chain) {
        chain.resolve.plugin("tsconfig-paths").use(TsconfigPathsPlugin);
      },
    },
    h5: {
      publicPath: "/",
      staticDirectory: "static",
      output: {
        filename: "js/[name].[fullhash:8].js",
        chunkFilename: "js/[name].[chunkhash:8].js",
      },
      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: "css/[name].[fullhash].css",
        chunkFilename: "css/[name].[chunkhash].css",
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: "module", // 转换模式，取值为 global/module
            generateScopedName: "[name]__[local]___[hash:base64:5]",
          },
        },
      },
      optimization: {
        concatenateModules: true,
      },
      webpackChain(chain) {
        chain.resolve.plugin("tsconfig-paths").use(TsconfigPathsPlugin);
        // 配置BundleAnalyzer分析打包文件结构
        chain.plugin("analyzer").use(BundleAnalyzerPlugin, [
          {
            analyzerMode: "static",
            openAnalyzer: true,
            reportFilename: "bundle-report.html",
          },
        ]);
        // 配置 HtmlTagsPlugin 插入外部资源文件
        chain.plugin("html-tags").use(HtmlTagsPlugin, [
          {
            tags: [
              {
                path: "https://polyfill.alicdn.com/polyfill.min.js", // 插入的外部 JS 库
                attributes: { type: "text/javascript" },
              },
            ],
            publicPath: false, // 使用公共路径
            append: false, // 默认为 true，表示插入的标签会被添加到 body 结束标签前
          },
        ]);
        chain.plugin("html").use(HtmlWebpackPlugin, [
          {
            inject: true, // 自动注入打包生成的资源
            minify: {
              collapseWhitespace: true, // 去除多余空格
              removeComments: true, // 去除注释
              removeRedundantAttributes: true, // 删除冗余的属性
              useShortDoctype: true, // 使用短的 doctype
              removeEmptyAttributes: true, // 删除空的属性
              removeStyleLinkTypeAttributes: true, // 删除 style 和 link 标签的 type 属性
              keepClosingSlash: true, // 保留单标签的闭合斜线
              minifyJS: true, // 压缩内联的 JavaScript
              minifyCSS: true, // 压缩内联的 CSS
              minifyURLs: true, // 压缩内联的 URL
            },
          },
        ]);
      },
    },
    rn: {
      appName: "taroDemo",
      postcss: {
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        },
      },
    },
  };
  if (process.env.NODE_ENV === "development") {
    // 本地开发构建配置（不混淆压缩）
    return merge({}, baseConfig, devConfig);
  }
  // 生产构建配置（默认开启压缩混淆等）
  return merge({}, baseConfig, prodConfig);
});
