function ReadFromJson(){
    t =  $.ajax({
        url: "homeworkboard_setting.json",
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

function Reload(){
    location.reload();
}

function WriteToJson(){
    var popBox = document.getElementById("edit-json")
    popBox.style.display = "block";
}

function CloseWriter(){
    let popDiv = document.getElementById("edit-json");
    popDiv.style.display = "none";
}
function closeJsonEditor(){
    let popDiv = document.getElementById("edit-json");
    popDiv.style.display = "none";
}