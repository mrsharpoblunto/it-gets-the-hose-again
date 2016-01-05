var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var path = require('path');

module.exports = {
    debug: false,
    entry: {
        app: [__dirname + '/assets/css/app.scss',__dirname + '/assets/js/app.js'],
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
        new webpack.optimize.CommonsChunkPlugin('vendor','vendor.js'),
        new ExtractTextPlugin('css/app.css')

    ],
    resolve: {
        extensions: [ '','.js','.jsx']
    },
    module: {
        loaders: [
            { test: /\.jsx?$/, loaders: ['babel?stage=0&optional=runtime'], exclude: /node_modules/ },
            {test: /\.scss$/, loader: ExtractTextPlugin.extract('css?autoprefixer&minimize!resolve-url!sass-loader?outputStyle=compressed')},
            {test: /\.(ttf|eot|svg|woff(2)?)/, loader: 'file?name=css/fonts/[name].[ext]?v=[hash]'},
            {test: /\.(png|gif|jpg)/, loader: 'file?name=/css/images/[name].[ext]?v=[hash]'}
        ],
        noParse: [/moment/]
    },
    externals: {
        '$': 'window.$',
        'jQuery': 'window.jQuery'
    }
};
