function openedit(){
    var popBox = document.getElementById("edit-window")
    popBox.style.display = "block";
}

function closePoP(){
    let popDiv = document.getElementById("edit-window");
    popDiv.style.display = "none";
}

function ShowContent(id1,id2){
    var liList = document.getElementById('ch1')
    var liText = liList[0].textContent
    document.getElementById('ch1ip').value = liText;
}
