const favicon = require('serve-favicon');
const path = require('path');
var eStatic = require('express').static;

const DAY_TIME = 1000 * 60 * 60 * 24 //一天
const MONTH_TIME  = DAY_TIME * 30 //一月
const HALF_YEAR_TIME  = MONTH_TIME * 6; //半年
const IS_PRO = process.env.NODE_ENV === 'production';
const  {nodeModuleStaticMap, faviconPath, publicPath} = require('./index');
const map = nodeModuleStaticMap;

var distJsPathArr = [];

for(let name in map){
  var distName = IS_PRO ? name + '.min' : name;
  distName = distName + '.js';
  var v = map[name];
  v.distName = distName;
  var jsPath = v.url + '/' + distName;
  v.jsPath = jsPath;
  distJsPathArr.push(jsPath);
}
console.log('map', map);
function setup(app){
  app.use('/public', eStatic(publicPath));
  app.use(favicon(faviconPath));
  const maxAge = IS_PRO ? HALF_YEAR_TIME : 0;
  for(let i in map){
    let v = map[i];
    const filePath = path.join(v.fsDir, v.distName);
    console.log('filePath', filePath, v.url);
    app.use(v.jsPath, eStatic(filePath, {maxAge}));
  }
};

setup.nodeModuleStatic = distJsPathArr;

module.exports = setup;