document.getElementById("saveButton").addEventListener("click",storeSettings);

function storeSettings(){
     var textColor = document.getElementById("textColor");
     localStorage.setItem("textColor", textColor.value);

     var hotkeyHighlight = document.getElementById("hotkeyHighlight");
     localStorage.setItem("hotkeyHighlight", hotkeyHighlight.value);
    }