var webpack = require('webpack');
var path = require('path');

module.exports = {
    devtool: 'source-map',
    debug: true,
    entry: {
        app: [__dirname + '/assets/css/app.scss', 'webpack-dev-server/client?', 'webpack/hot/dev-server', __dirname + '/assets/js/app.js'],
        vendor: ['react', 'redux', 'react-redux', 'redux-logger', 'redux-thunk', 'react-dom', 'moment']
    },
    output: {
        path: path.join(__dirname, 'public'),
        publicPath: '/',
        filename: "[name].js",
        devtoolModuleFilenameTemplate: '[resource-path]'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("debug")
            }
        }),
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js')
    ],
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    module: {
        loaders: [{
            test: /\.jsx?$/,
            loaders: ['react-hot', __dirname + '/babel-loader?stage=0&optional=runtime&loose=es6.modules'],
            exclude: /node_modules/
        }, {
            test: /\.scss$/,
            loader: 'style!css!resolve-url!sass-loader?outputStyle=compressed'
        }, {
            test: /\.(ttf|eot|svg|woff(2)?)/,
            loader: 'file?name=css/fonts/[name].[ext]?v=[hash]'
        }, {
            test: /\.(png|gif|jpg)/,
            loader: 'file?name=/css/images/[name].[ext]?v=[hash]'
        }],
        noParse: [/moment/]
    },
    externals: {
        '$': 'window.$',
        'jQuery': 'window.jQuery'
    }
};
