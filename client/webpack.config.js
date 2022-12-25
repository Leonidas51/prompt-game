const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isDevBuild = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: './client/src/index.tsx',
  mode: isDevBuild ? 'development' : 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      template: 'client/src/index.html',
    }),
  ],
  output: {
    filename: '[name].[contenthash].js',
    publicPath: '/',
    path: path.resolve(__dirname, '../dist/client'),
  },
  devServer: {
    hot: true,
    port: 9000,
  },
};
