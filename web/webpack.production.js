var webpack = require('webpack');
var path = require('path');

module.exports = {
    debug: false,
    entry: {
        app: __dirname + '/assets/js/app.js',
        vendor: ['react','react-dom','redux','react-redux','redux-logger','redux-thunk','superagent','moment']
    },
    output: {
        path: path.join(__dirname,'public'),
        publicPath: '/',
        filename: "[name].js",
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({minimize: true}),
        new webpack.DefinePlugin({
            "process.env": { NODE_ENV: JSON.stringify("production") }
        }),
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.CommonsChunkPlugin('vendor','vendor.js')
    ],
    resolve: {
        extensions: [ '','.js','.jsx']
    },
    module: {
        loaders: [
            { test: /\.jsx?$/, loaders: ['babel?stage=0&optional=runtime'], exclude: /node_modules/ }
        ],
        noParse: [/moment/]
    },
    externals: {
        '$': 'window.$',
        'jQuery': 'window.jQuery'
    }
};
