// const path = require("path");
// const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const UglifyJSPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
    entry: {
        app: "./app.js"
    },
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    module: {
        loaders: [
            {
                test: /\.pug$/,
                loader: "pug-loader"
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                query: {
                    presets: ["env"]
                }
            }
        ]
    },
    resolve: {
        extensions: [
            ".ts",
            ".js"
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./index.pug"
        })
        // new UglifyJSPlugin()
    ]
};