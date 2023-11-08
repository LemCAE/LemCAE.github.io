function ReadFromJson(){
    t =  $.ajax({
        url: "homeworkboard_setting.json",
        type: "GET",
        dataType: "json",
        async: false,
        });	
    tj=t.responseText;
    result =$.parseJSON(tj);
}
function GetHideValue(){
    const SubjectValue = ['chinese','math','english','physics','chemistry','biology','others']
    const Num = [1,2,3,4,5]
    const EsSubName = ['ch','ma','en','ph','cl','bi','ot']    
    for(let i = 0; i < SubjectValue.length; i++){
        for(let j = 0; j < Num.length; j++){
            ValueName0 = SubjectValue[i]
            SubjectId = EsSubName[i] + Num[j]
            ValueName = SubjectValue[i] + Num[j]
            document.getElementById(SubjectId).style.display = result.hide_values[SubjectValue.indexOf(ValueName0)][ValueName]
        }
    }
}

function FillElement(){
    const SubjectValue = ['chinese','math','english','physics','chemistry','biology','others']
    const Num = [1,2,3,4,5]
    const EsSubName = ['ch','ma','en','ph','cl','bi','ot']
    for(let i = 0; i < SubjectValue.length; i++){
        for(let j = 0; j < Num.length; j++){
            SubjectId = EsSubName[i] + Num[j]
            ValueName = SubjectValue[i] + Num[j]
            document.getElementById(SubjectId).innerHTML = result[ValueName]
        }
    }
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
