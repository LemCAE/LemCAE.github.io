function openeditch(){
    var popBox = document.getElementById("edit-window-ch")
    popBox.style.display = "block";
}
function openeditma(){
    var popBox = document.getElementById("edit-window-ma")
    popBox.style.display = "block";
}
function openediten(){
    var popBox = document.getElementById("edit-window-en")
    popBox.style.display = "block";
}
function openeditph(){
    var popBox = document.getElementById("edit-window-ph")
    popBox.style.display = "block";
}
function openeditcl(){
    var popBox = document.getElementById("edit-window-cl")
    popBox.style.display = "block";
}
function openeditbi(){
    var popBox = document.getElementById("edit-window-bi")
    popBox.style.display = "block";
}
function openeditpo(){
    var popBox = document.getElementById("edit-window-po")
    popBox.style.display = "block";
}
function openeditot(){
    var popBox = document.getElementById("edit-window-ot")
    popBox.style.display = "block";
}





function closePoPch(){
    let popDiv = document.getElementById("edit-window-ch");
    popDiv.style.display = "none";
}

function closePoPma(){
    let popDiv = document.getElementById("edit-window-ma");
    popDiv.style.display = "none";
}

function closePoPen(){
    let popDiv = document.getElementById("edit-window-en");
    popDiv.style.display = "none";
}

function closePoPph(){
    let popDiv = document.getElementById("edit-window-ph");
    popDiv.style.display = "none";
}

function closePoPcl(){
    let popDiv = document.getElementById("edit-window-cl");
    popDiv.style.display = "none";
}

function closePoPbi(){
    let popDiv = document.getElementById("edit-window-bi");
    popDiv.style.display = "none";
}

function closePoPpo(){
    let popDiv = document.getElementById("edit-window-po");
    popDiv.style.display = "none";
}

function closePoPot(){
    let popDiv = document.getElementById("edit-window-ot");
    popDiv.style.display = "none";
}





function ShowContent(iptw,chtr){
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

function Reload(){
    location.reload();
}

function OpenEditor() {
    window.location.href='JsonEditor://45'
}

function ChangeContentCh(){
    ChangeContent('chip1','ch1');
    ChangeContent('chip2','ch2');
    ChangeContent('chip3','ch3');
    ChangeContent('chip4','ch4');
    ChangeContent('chip5','ch5');
}

function ChangeContentMa(){
    ChangeContent('maip1','ma1');
    ChangeContent('maip2','ma2');
    ChangeContent('maip3','ma3');
    ChangeContent('maip4','ma4');
    ChangeContent('maip5','ma5');
}

function ChangeContentEn(){
    ChangeContent('enip1','en1');
    ChangeContent('enip2','en2');
    ChangeContent('enip3','en3');
    ChangeContent('enip4','en4');
    ChangeContent('enip5','en5');
}

function ChangeContentPh(){
    ChangeContent('phip1','ph1');
    ChangeContent('phip2','ph2');
    ChangeContent('phip3','ph3');
    ChangeContent('phip4','ph4');
    ChangeContent('phip5','ph5');
}

function ChangeContentCl(){
    ChangeContent('clip1','cl1');
    ChangeContent('clip2','cl2');
    ChangeContent('clip3','cl3');
    ChangeContent('clip4','cl4');
    ChangeContent('clip5','cl5');
}

function ChangeContentBi(){
    ChangeContent('biip1','bi1');
    ChangeContent('biip2','bi2');
    ChangeContent('biip3','bi3');
    ChangeContent('biip4','bi4');
    ChangeContent('biip5','bi5');
}

function ChangeContentPo(){
    ChangeContent('poip1','po1');
    ChangeContent('poip2','po2');
    ChangeContent('poip3','po3');
    ChangeContent('poip4','po4');
    ChangeContent('poip5','po5');
}

function ChangeContentOt(){
    ChangeContent('otip1','ot1');
    ChangeContent('otip2','ot2');
    ChangeContent('otip3','ot3');
    ChangeContent('otip4','ot4');
    ChangeContent('otip5','ot5');
}





function ShowContentCh(){
    ShowContent('chip1','ch1');
    ShowContent('chip2','ch2');
    ShowContent('chip3','ch3');
    ShowContent('chip4','ch4');
    ShowContent('chip5','ch5');
}

function ShowContentMa(){
    ShowContent('maip1','ma1');
    ShowContent('maip2','ma2');
    ShowContent('maip3','ma3');
    ShowContent('maip4','ma4');
    ShowContent('maip5','ma5');
}

function ShowContentEn(){
    ShowContent('enip1','en1');
    ShowContent('enip2','en2');
    ShowContent('enip3','en3');
    ShowContent('enip4','en4');
    ShowContent('enip5','en5');
}

function ShowContentPh(){
    ShowContent('phip1','ph1');
    ShowContent('phip2','ph2');
    ShowContent('phip3','ph3');
    ShowContent('phip4','ph4');
    ShowContent('phip5','ph5');
}

function ShowContentCl(){
    ShowContent('clip1','cl1');
    ShowContent('clip2','cl2');
    ShowContent('clip3','cl3');
    ShowContent('clip4','cl4');
    ShowContent('clip5','cl5');
}

function ShowContentBi(){
    ShowContent('biip1','bi1');
    ShowContent('biip2','bi2');
    ShowContent('biip3','bi3');
    ShowContent('biip4','bi4');
    ShowContent('biip5','bi5');
}

function ShowContentPo(){
    ShowContent('poip1','po1');
    ShowContent('poip2','po2');
    ShowContent('poip3','po3');
    ShowContent('poip4','po4');
    ShowContent('poip5','po5');
}

function ShowContentOt(){
    ShowContent('otip1','ot1');
    ShowContent('otip2','ot2');
    ShowContent('otip3','ot3');
    ShowContent('otip4','ot4');
    ShowContent('otip5','ot5');
}

function ReadFromJson(){
    t =  $.ajax({
        url: "homeworkboard-setting.json",
        type: "GET",
        dataType: "json",
        async: false,
        });	
    tj=t.responseText;
    result =$.parseJSON(tj)
}

function FillElement(){
    document.getElementById('ch1').innerHTML = result.chinese1
    document.getElementById('ch2').innerHTML = result.chinese2
    document.getElementById('ch3').innerHTML = result.chinese3
    document.getElementById('ch4').innerHTML = result.chinese4
    document.getElementById('ch5').innerHTML = result.chinese5
    document.getElementById('ma1').innerHTML = result.math1
    document.getElementById('ma2').innerHTML = result.math2
    document.getElementById('ma3').innerHTML = result.math3
    document.getElementById('ma4').innerHTML = result.math4
    document.getElementById('ma5').innerHTML = result.math5
    document.getElementById('en1').innerHTML = result.english1
    document.getElementById('en2').innerHTML = result.english2
    document.getElementById('en3').innerHTML = result.english3
    document.getElementById('en4').innerHTML = result.english4
    document.getElementById('en5').innerHTML = result.english5
    document.getElementById('ph1').innerHTML = result.physics1
    document.getElementById('ph2').innerHTML = result.physics2
    document.getElementById('ph3').innerHTML = result.physics3
    document.getElementById('ph4').innerHTML = result.physics4
    document.getElementById('ph5').innerHTML = result.physics5
    document.getElementById('cl1').innerHTML = result.chemistry1
    document.getElementById('cl2').innerHTML = result.chemistry2
    document.getElementById('cl3').innerHTML = result.chemistry3
    document.getElementById('cl4').innerHTML = result.chemistry4
    document.getElementById('cl5').innerHTML = result.chemistry5
    document.getElementById('bi1').innerHTML = result.biology1
    document.getElementById('bi2').innerHTML = result.biology2
    document.getElementById('bi3').innerHTML = result.biology3
    document.getElementById('bi4').innerHTML = result.biology4
    document.getElementById('bi5').innerHTML = result.biology5
    document.getElementById('po1').innerHTML = result.politics1
    document.getElementById('po2').innerHTML = result.politics2
    document.getElementById('po3').innerHTML = result.politics3
    document.getElementById('po4').innerHTML = result.politics4
    document.getElementById('po5').innerHTML = result.politics5
    document.getElementById('ot1').innerHTML = result.others1
    document.getElementById('ot2').innerHTML = result.others2
    document.getElementById('ot3').innerHTML = result.others3
    document.getElementById('ot4').innerHTML = result.others4
    document.getElementById('ot5').innerHTML = result.others5
}

function change_room_charge() {
    var chargeArray = JSON.parse($('#chargeArray').val());
    $.each(chargeArray, function(index, item) {
      var key = Object.keys(item)[0];
      item[key].charge = 666;
    });
    $('#chargeArray').val(JSON.stringify(chargeArray));
    console.log($('#chargeArray').val());
}

