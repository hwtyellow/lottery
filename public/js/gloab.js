var opt_url = 'http://' + window.location.host;

function startChange(rank) {
    $.ajax({
        url: opt_url + '/lottery/start',
        type: 'GET',
         data: {rank: rank},
        success: function(d) {
            if(d.flag == 0){
                console.log('success!')
                var data = d.data[0].data;
                timer = setInterval(function(){
                    var index = parseInt(Math.random() * data.length, 10);
                    $('.p_start .namewrapper p').text(data[index][0]+' '+data[index][1]);
                }, 80);
                $('.operate.start').addClass('no_dis');
                $('.operate.stop').removeClass('no_dis');
            }else{
                $('.p_start .namewrapper p').text('');
                $('.operate.stop').addClass('no_dis');
                $('.operate.start').addClass('no_dis');
                $('.operate.confirm').not('.reload').removeClass('no_dis');
                alert(d.msg);
            }
        },
        error: function(xmlHTTPRequest, status, error) {
            console.log(status);
            alert('cuowu!');
        }
    })
}

function stopChange(rank){
    $.ajax({
        url: opt_url + '/lottery/end',
        type: 'GET',
        data: {rank: rank},
        success: function(d) {
            if(d.flag == 0 || d.flag == 1){
                console.log('success!');
                console.log(d);
                // var data = d.data;
                // $('#class3').text(data[index][0]+' '+data[index][1]);
                window.clearInterval(timer);
                $('.p_start .namewrapper p').text(d.data[0]+' '+d.data[1]);
                if(d.flag == 1){
                    $('.operate.stop').addClass('no_dis');
                    $('.operate.start').addClass('no_dis');
                    $('.operate.confirm').not('.reload').removeClass('no_dis');
                }else{
                    $('.operate.stop').addClass('no_dis');
                    $('.operate.start').addClass('no_dis');
                    $('.operate.reload').removeClass('no_dis');
                }
            }else{
                window.clearInterval(timer);
                $('.p_start .namewrapper p').text('');
                $('.operate.stop').addClass('no_dis');
                $('.operate.start').addClass('no_dis');
                $('.operate.confirm').not('.reload').removeClass('no_dis');
                alert(d.msg);
            }
        },
        error: function(xmlHTTPRequest, status, error) {
            console.log(status);
            alert('error end!');
        }
    })
}

function nextChange(rank){
    var next = rank-1<0 ? -1 : rank-1;
    if(next > -1){
        window.location.href = opt_url + "/lottery?rank=" + next;
    }else{
        window.location.href = opt_url + "/lottery/list";
    }
}

prize = {
    0: {
        title: '特等奖',
        items: [{
            name: 'iphone 7 plus',
            image: '../images/iphone7p.jpg',
        }],
        count: 0
    },
    1: {
        title: '一等奖',
        items: [{
            name: 'ipad 2',
            image: '../images/ipad.jpg',
        },
        {
            name: '3000元旅游票',
            image: '../images/lvyou.jpeg',
        }],
        count: 0
    },
    2: {
        title: '二等奖',
        items: [{
            name: '电动牙刷',
            image: '../images/ys.jpg',
        },
        {
            name: '空气净化器',
            image: '../images/jhq.jpg',
        },
        {
            name: '化妆品等值物品',
            image: '../images/hzp.jpg',
        }],
        count: 0
    },
    3: {
        title: '三等奖',
        items: [{
            name: '笔',
            image: '../images/bi.jpg',
        },
        {
            name: '咖啡机',
            image: '../images/kafei.jpg',
        },
        {
            name: '星巴克券',
            image: '../images/starb.jpg',
        },
        {
            name: '小米等值物品',
            image: '../images/xiaomi.jpg',
        },
        {
            name: '保温杯',
            image: '../images/baowen.jpg',
        }],
        count: 0
    }
};
