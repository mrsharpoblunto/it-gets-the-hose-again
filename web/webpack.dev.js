var webpack = require('webpack');
var path = require('path');

module.exports = {
    devtool: 'eval-source-map',
    debug: true,
    entry: {
        app: [__dirname + '/assets/css/app.css','webpack-dev-server/client?','webpack/hot/dev-server',__dirname + '/assets/js/app.js'],
        vendor: ['react','redux','react-redux','redux-logger','redux-thunk','react-dom','superagent','moment','jquery','materialize-css']
    },
    output: {
        path: path.join(__dirname,'public'),
        publicPath: '/',
        filename: "[name].js",
        devtoolModuleFilenameTemplate: '[resource-path]'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            "process.env": { NODE_ENV: JSON.stringify("debug") }
        }),
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.CommonsChunkPlugin('vendor','vendor.js')
    ],
    resolve: {
        extensions: [ '','.js','.jsx'],
        alias: {
            'jQuery':'jquery'
        }
    },
    module: {
        loaders: [
            { test: /\.jsx?$/, loaders: ['react-hot',__dirname + '/babel-loader?stage=0&optional=runtime&loose=es6.modules'], exclude: /node_modules/ },
            { test: /\.css$/, loader: 'style!css?importLoaders=1' }

        ],
        noParse: [/moment/,/jquery/]
    }
};
