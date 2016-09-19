document.getElementById("settingsButton").addEventListener("click",openSettings);
document.getElementById("managementButton").addEventListener("click",openManager);

function openSettings(){
	var newURL =  chrome.extension.getURL('settings.html');
  	chrome.tabs.create({ url: newURL });
     }

function openManager(){
	var newURL =  chrome.extension.getURL('management.html');;
  	chrome.tabs.create({ url: newURL });
     }

