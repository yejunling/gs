var video = document.getElementById('video');
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var time = document.getElementById('time');
var date = document.getElementById('date');
var week = document.getElementById('week');
var dialog = document.getElementById('dialog');
var dialogBody = document.getElementById('dialogBody');
var noDialog = document.getElementById('noDialog');
var signInInfo = document.getElementById('signInInfo');
var lookInfo = document.getElementById('lookInfo');
var table = document.getElementById('table');
var pages = document.getElementById('pages');
var face = document.getElementById('face');
var id = document.getElementById('id');
var name = document.getElementById('name');
var message = document.getElementById('message');
var messageImg = document.getElementById('messageImg');
//const baseUrl = 'http://gongshang.dev.tianheng-uestc.com'
const baseUrl = 'http://192.168.253.69:9998'

var uuid;

var Ajax={
    get: function(url, fn) {
        // XMLHttpRequest对象用于在后台与服务器交换数据
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function() {
            // readyState == 4说明请求已完成
            if (xhr.readyState == 4 && xhr.status == 200 || xhr.status == 304) {
                // 从服务器获得数据
                fn.call(this, xhr.responseText);
            }
        };
        xhr.send();
    },
    // datat应为'a=a1&b=b1'这种字符串格式，在jq里如果data为对象会自动将对象转成这种字符串格式
    post: function (url, data, fn) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        // 添加http头，发送信息至服务器时内容编码类型
        //xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
       // xhr.setRequestHeader("Content-Type", "multipart/form-data");
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 304)) {
                fn.call(this, xhr.responseText);
            }
        };
        xhr.send(data);
    }
}

if(typeof(UniversalTerminalShell) ===  'undefined'){
    uuid = 'cs';
}else{
    uuid = UniversalTerminalShell.getUUID();
}
document.getElementById('uuid').innerHTML = `UUID:${uuid}`;

window.onload = function() {
    initDate();
    initVideo();

    dialog.addEventListener('click',()=>{
        noDialogClick();
    })
    dialogBody.addEventListener('click',(e)=>{
        e.stopPropagation();
    })
};

function initVideo(){

    var tracker = new tracking.ObjectTracker('face');
    tracker.setInitialScale(4);
    tracker.setStepSize(2);
    tracker.setEdgesDensity(0.1);

    tracking.track('#video', tracker, { camera: true });

    tracker.on('track', function(event) {
        context.clearRect(0, 0, canvas.width, canvas.height);

        event.data.forEach(function(rect) {
            context.strokeStyle = '#a64ceb';
            context.strokeRect(rect.x, rect.y, rect.width, rect.height);
            context.font = '11px Helvetica';
            context.fillStyle = "#fff";
            context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
            context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
        });


    });


}
function initDate(){
    setInterval(function(){
        var _date = new Date();
        var year = _date.getFullYear();    //获取当前年份
        var mon = _date.getMonth()+1;      //获取当前月份
        var day = _date.getDate();          //获取当前日
        var _week = _date.getDay();          //获取当前星期几
        var h = _date.getHours();          //获取小时
        var m = _date.getMinutes();        //获取分钟
        var s = _date.getSeconds();        //获取秒
        var arr= new Array("星期日","星期一","星期二","星期三","星期四","星期五","星期六");

        time.innerHTML = h+':'+m+':'+s;
        date.innerHTML = year+'/'+mon+'/'+day;
        week.innerHTML = arr[_week];
    },1000)
}
function signInClick(e){
    e.stopPropagation();
    dialog.style.display = 'block';
    signInInfo.style.display = 'block';
    lookInfo.style.display = 'none';
    context.drawImage(video, 0, 0, 300, 170);
    var snapData = canvas.toDataURL('image/png');
    var imgSrc = "data:image/png;" + snapData;
    face.src = imgSrc;

    let file = dataURLtoFile(snapData,'signIn.png');

    let myFormData = new FormData();

    myFormData.append('image',file);
    myFormData.append('uuid',uuid);

    Ajax.post(baseUrl+'/api/v1/face-recog/sign-in',myFormData,(res)=>{
        res = JSON.parse(res);
       if(res.status === 'succeeded'){
           let img = res.data.url;
           messageImg.src='img/ok.png';
           id.innerHTML = res.data.id;
           name.innerHTML = res.data.name;
           face.src = img?img:imgSrc;
       }else{
           messageImg.src='img/error.png';
           message.innerHTML = res.message;
       }
    });
}
function InfoClick(){
    dialog.style.display = 'block';
    signInInfo.style.display = 'none';
    lookInfo.style.display = 'block';
    addTable();
}
function noDialogClick(){
    dialog.style.display = 'none';
}
function addTable() {
    var cols = [];
    var th = ['ID','编号','名称','签到时间','签出时间'];
    Ajax.get(baseUrl+'/api/v1/face-recog/sign-in',(res)=>{
        res = JSON.parse(res)
        cols = res.data.result;

        var tab="<table border='1' bordercolor='#F3F3F3' width='100%' style='padding:10px;'>";

        tab+="<tr style='height:30px;background-color: #F3F3F3;'>";
        for(let j=0;j<th.length;j++)
        {
            tab+="<th>"+th[j]+"</th>";
        }
        tab+="</tr>";
        for(var i=0;i<cols.length;i++)
        {
            tab+="<tr style='height:30px;'>";
            let c = cols[i];
            tab+="<td>"+c.id+"</td>"+"<td>"+c.id+"</td>"+"<td>"+c.id+"</td>"+"<td>"+c.signInTime+"</td>"+"<td>"+c.signOutTime+"</td>";
            tab+="</tr>";
        }
        tab+="</table>"
        table.innerHTML=tab;
    });
}
function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}
function lastPage(){
    console.log('分页')
}
function nextPage(){
    console.log('分页')
}