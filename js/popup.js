document.getElementById("settingsButton").addEventListener("click",openSettings);

function openSettings(){
	var newURL =  chrome.extension.getURL('settings.html');
  	chrome.tabs.create({ url: newURL });
     }

document.getElementById("managementButton").addEventListener("click",openManager);

