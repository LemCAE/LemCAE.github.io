// 若找不到该模块,则用npm i fs安装一下即可
var fs = require('fs');
 
// 此处为模拟数据,后期会从页面传数据
var params = {
    "name": "hh"
}
 
//写入json文件选项
function reviseData(id, params) {
    //现将json文件读出来
    fs.readFile('msg.json', function(err, data) {
        if (err) {
            return console.error(err);
        }
        var msg = data.toString(); //将二进制的数据转换为字符串
        msg = JSON.parse(msg); //将字符串转换为json对象
 
        //找到对应的数据id进行删除
        for (var i = 0; i < msg.data.length; i++) {
            if (id == msg.data[i].id) {
                for (var key in params) {   //此处的key就是params数据键值对中的键，也就是将params中传过来的数据根据键名去更新原来此id的数据
                    if (msg.data[i][key]) {
                        msg.data[i][key] = params[key];
                    }
                }
 
            }
        }
 
        msg.total = msg.data.length; //刷新一下总数，以后分页会用上
        console.log(msg);
        var str = JSON.stringify(msg, "", "\t"); //因为nodejs的写入文件只认识字符串或者二进制数，因此进行必要的转换
        fs.writeFile('msg.json', str, function(err) {
            if (err) {
                console.error(err);
            }
            console.log('----------修改成功-------------');
        })
    })
}
 
//执行新增数据方法;
reviseData(1, params)