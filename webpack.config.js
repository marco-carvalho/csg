const path = require('path');
// const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: {
        app: './src/app.ts'
    },
    output: {
        path: __dirname,
        filename: 'app.bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.pug$/,
                loader: 'pug-loader'
            },
            {
              test: /\.ts$/,
              use: 'ts-loader',
              exclude: /node_modules/
            }
        ]
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.pug'
        }),
        // new UglifyJSPlugin()
    ]
}