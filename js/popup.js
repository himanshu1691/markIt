document.getElementById("clearButton").addEventListener("click",openManager);

function openManager(){
	var newURL =  chrome.extension.getURL('management.html');;
  	chrome.tabs.create({ url: newURL });
     }
