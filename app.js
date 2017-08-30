var express = require('express');
var app = express();
var xlsx = require('node-xlsx');
var fs = require('fs');
var path = require('path');
var ejs = require('ejs');

app.set('views', path.join(__dirname, '/views'));
app.engine('html', ejs.__express);
app.set('view engine', 'html');

app.use(express.static(__dirname + '/public'));

app.get('/init', function(req, res, next) {
    var allfile = "./public/images/auth.xlsx";

    fs.exists(allfile, function(exists) {
        if (exists) {
            var obj = importExcel(allfile);
            fs.writeFile('./public/images/todo.txt', JSON.stringify(obj), { encoding: 'utf-8' ,flag: 'w+'}, function(err) {
                if (err) throw err;
            });
            fs.writeFile('./public/done.txt', '{"prize0":[],"prize1":[],"prize2":[],"prize3":[]}', { encoding: 'utf-8' ,flag: 'w+'}, function(err) {
                if (err) throw err;
            });
            fs.writeFile('./public/prize.txt', '{"total":[1,2,3,5], "count":[0,0,0,0]}', { encoding: 'utf-8' ,flag: 'w+'}, function(err) {
                if (err) throw err;
            });
            res.end('init complete!');
        }
        if (!exists) {
            res.end("文件不存在");
        }
    })
});

app.get('/lottery', function(req, res, next) {
    var rank = req.query.rank;
    var title = '';
    switch(rank){
        case "3": 
            title = "三";
            break;
        case "2": 
            title = "二";
            break;
        case "1": 
            title = "一";
            break;
        case "0": 
            title = "特";
            break;
    }
    // 读取剩余奖项数量
    fs.readFile('./public/prize.txt', { encoding: 'utf-8' }, function(err, bytesRead) {
        var prizeOption = toObject(bytesRead);
        var prizecount = prizeOption.count;
        res.render('start', {title: title, rank: rank, count: prizecount[rank]});
    })
});

app.get('/lottery/start', function(req, res, next) {
    var rank = parseInt(req.query.rank);
    fs.readFile('./public/prize.txt', { encoding: 'utf-8' }, function(err, bytesRead) {
        if (err) throw err;
        var prizeOption = toObject(bytesRead);
        var prizecount = prizeOption.total;
        console.log("readFile prize.txt success");

        var leftnum = parseInt(prizecount[rank], 10);
        console.log('leftnum:' + leftnum);
        if (leftnum == 0) {
            res.send({ flag: -1, msg: '该奖项已全部抽完！' });
        }else{
            var filename = "./public/name.xlsx";
            fs.exists(filename, function(exists) {
                if (exists) {
                    var obj = importExcel(filename);
                    res.contentType('json'); //返回的数据类型
                    res.send({ flag: 0, msg: '', data: obj }); //给客户端返回一个json格式的数据
                }
                if (!exists) {
                    res.end("文件不存在");
                }
            })

        }
    })
});

app.get('/lottery/end', function(req, res, next) {
    var rank = parseInt(req.query.rank);
    var prizeOption = null,
        todo = null,
        done = null;
    var donefile = "./public/done.txt";
    var todofile = "./public/images/todo.txt";

    // 读取剩余奖项数量
    fs.readFile('./public/prize.txt', { encoding: 'utf-8' }, function(err, bytesRead) {
        if (err) throw err;
        prizeOption = toObject(bytesRead);
        console.log("readFile prize.txt success");
        // 读取待抽奖名单
        fs.readFile(todofile, { encoding: 'utf-8' }, function(err, bytesRead1) {
            if (err) throw err;
            // console.log(bytesRead1);
            todo = toObject(bytesRead1);
            console.log(todo);
            console.log("readFile todo.txt success");
            
            var prizecount = prizeOption.total;
            var leftnum = parseInt(prizecount[rank], 10);
            console.log('leftnum:' + leftnum);
            if (leftnum == 0) {
                res.send({ flag: -1, msg: '该奖项已全部抽完！' });
            } else {
                // 读取获奖名单
                fs.readFile(donefile, { encoding: 'utf-8' }, function(err, bytesRead2) {
                    if (err) throw err;
                    done = toObject(bytesRead2);
                    console.log("readFile done.txt success");
                    // 抽取获奖人员
                    var namelist = todo[0].data;
                    console.log(namelist);
                    var index = parseInt(Math.random() * namelist.length, 10);
                    var temp = namelist[index];
                    console.log(temp);
                    while(temp[2].indexOf(rank) == -1){
                        index = parseInt(Math.random() * namelist.length, 10);
                        temp = namelist[index];
                    }
                    var winner = namelist.splice(index, 1)[0];
                    console.log(winner);
                    done['prize'+rank].push(winner);
                    // 存入获奖名单
                    fs.writeFile(donefile, JSON.stringify(done), { encoding: 'utf-8' }, function(err) {
                        if (err) throw err;
                        console.log("Import done.txt Success!");
                        // res.end("Import done.txt Success!");
                        // 存入待抽奖名单
                        todo[0].data = namelist;
                        fs.writeFile(todofile, JSON.stringify(todo), { encoding: 'utf-8' }, function(err) {
                            if (err) throw err;
                            console.log("Import todo.txt Success!");
                            // res.end("Import todo.txt Success!");

                        });
                        // 修改剩余数量
                        prizecount[rank]--;
                        prizeOption.total = prizecount;
                        prizeOption.count[rank]++;
                        fs.writeFile('./public/prize.txt', JSON.stringify(prizeOption), { encoding: 'utf-8' }, function(err) {
                            if (err) throw err;
                            console.log("Import todo.txt Success!");
                            // res.end("Import todo.txt Success!");

                            var flag = parseInt(prizecount[rank], 10)==0 ? 1 : 0;
                            res.send({ flag: flag, msg: '', data: winner });
                        });
                    });
                });

            }
        });
    });
});

app.get('/lottery/list', function(req, res, next) {
    fs.readFile('./public/done.txt', { encoding: 'utf-8' }, function(err, bytesRead) {
        if (err) throw err;
        var list = toObject(bytesRead);
        console.log("readFile done.txt success");

        res.render('list', list);
    })
})

function toObject(a) {
    return (new Function('return ' + a))();
};

function importExcel(filename) {
    console.error(filename);
    // read from a file  
    var obj = xlsx.parse(filename);
    return obj;
}

function exportExcel(tempname, res) {
    var filename = './public/test.xlsx';
    console.error(filename);
    // read from a file  
    var obj = xlsx.parse(filename);
    console.log(JSON.stringify(obj));

    var buffer = xlsx.build(obj);
    fs.writeFileSync(tempname, buffer, 'binary');
}
app.get('/importExcel', function(req, res, next) {
    var filename = './public/test.xlsx';
    console.error(filename);
    // read from a file  
    var obj = xlsx.parse(filename);
    console.log(JSON.stringify(obj));

    var buffer = xlsx.build(obj);
    fs.writeFileSync('./public/temp.xlsx', buffer, 'binary');
    res.send('export successfully!');
});

app.listen(8888);
