var _ = require('lodash');
var base = require('./dev');

const conf = {
  bundleName: '[name]_bundle_[chunkhash].js',   //打包文件的名字
  chunkName: '[name]_chunk_[chunkhash].js',     //由code-spliting生成的文件名字
  indexDir: './dist/pro',
  baseUrl: ''
};

module.exports =  _.merge(base, conf);
