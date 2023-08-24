function openedit(){
    var popBox = document.getElementById("edit-window")
    popBox.style.display = "block";
}

function closePoP(){
    let popDiv = document.getElementById("edit-window");
    popDiv.style.display = "none";
}

function ShowContent(chtr,iptw){
    var contenttg = document.getElementById(chtr).innerText;
    document.getElementById(iptw).value = contenttg;
}
//读取<li>至<input>
//chtr:要读取的<li>元素的id
//iptw:要写入的<input>元素的id

function ChangeContent(iptr,litw){
    var valuetcg = document.getElementById(iptr).value;
    document.getElementById(litw).innerHTML = valuetcg;
}
//读取<input>至<li>
//iptr:要读取的<input>元素的id
//litw:要写入的<li>元素的id

function ChangeContentCh(){
    ChangeContent('chip1','ch1');
    ChangeContent('chip2','ch2');
    ChangeContent('chip3','ch3');
    ChangeContent('chip4','ch4');
    ChangeContent('chip5','ch5');
}
//大力出奇迹!!!

function ShowContentCh(){
    ShowContent('ch1','chip1')
    ShowContent('ch2','chip2')
    ShowContent('ch3','chip3')
    ShowContent('ch4','chip4')
    ShowContent('ch5','chip5')
}

function ReadFromJson(idn,idw){
    var givenjson, v;
    givenjson = data;
    v = givenjson.idn;
    document.getElementById(idw).innerText = v
}

function WriteToJson(){

}