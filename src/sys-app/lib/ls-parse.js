const INTERVAL = '/L/R/_/I/N/T/E/R/V/A/L/' // 文件名包含 双引号, 替换一下.
const INTERVAL_REG = new RegExp(INTERVAL, 'g');

function parse(result, isSelf) {
  if(!isSelf){
    result = result.substr(result.indexOf('\n') + 1); //remove total.
  }
  result = result.split('\n');
  result.pop();

  result = result.map((v) => {
    v = v.replace(/\\"/g, INTERVAL);
    v = v.split('"'); 
    // var name;
    let name = v[1];
    name = name.replace(INTERVAL_REG, '"');
    name = name.replace(/\\\\|\\n|\\t|\\r|\\f|\\v/g, function(mstr){
      switch(mstr){
        case '\\\\':
          return '\\';
        case '\\n':
          return '\n';
        case '\\t':
          return '\t';
        case '\\r':
          return '\r';
        case '\\f':
          return '\f';
        case '\\v':
          return '\v';
        default:
          return mstr;
      }
    });
    // }

    const _pre = v[0].split(/\s+/);
    
    const data = {
      name,
      permission: _pre[0],
      owner: _pre[2],
      group: _pre[3]
    }

    var size = _pre[4];
    var nextIndex = 5;
    if(size[size.length - 1] === ','){ 
      // 设备主副号 
      // https://unix.stackexchange.com/questions/367547

      data.device_type = _pre[4] + " " + _pre[5];

      nextIndex = 6;
      
    }else {
      data.size = Number(size);
    }

    data.mtime =  _pre[nextIndex] + " " + _pre[nextIndex + 1];
    
    let linkString = v[3];

    if(linkString){
      data.symbolicLink = linkString;
    }
    // name, permission, owner, group, size, mtime, ?device_type, ?symbolicLink
    return data;
  });
  return result;
}
export default parse;
