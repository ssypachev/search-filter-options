const path = require('path');

const serverConfig = {
	target: 'node',
	entry: './src/index.js',
	output: {
		filename: 'bundle.node.js',
		path: path.resolve(__dirname, 'dist'),
		libraryTarget: 'umd',
		library: 'SearchFilterOptions'
	}
};

const webConfig = {
	target: 'web',
	entry: './src/index.js',
	output: {
		filename: 'bundle.web.js',
		path: path.resolve(__dirname, 'dist'),
		libraryTarget: 'window'
	},
	module: {
		rules: [{
			test: /\.js$/,
			exclude: /node_modules/,
			use: {
				loader: 'babel-loader',
			}
		}]
	}
};

module.exports = [serverConfig, webConfig];