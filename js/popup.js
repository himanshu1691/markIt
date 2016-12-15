document.getElementById("settingsButton").addEventListener("click",openSettings);
document.getElementById("managementButton").addEventListener("click",openManager);
document.getElementById("pluginCheck").addEventListener("click",pluginStatusSwitch);

chrome.extension.sendMessage({ cmd: "getOnOffState" }, function (response) {
    if (response == true) {
    	$('#onStatus').show();
		$('#offStatus').hide();
		document.getElementById("pluginCheck").checked = true;
    }
    else{
		$('#offStatus').show();
		$('#onStatus').hide();
		document.getElementById("pluginCheck").checked = false;
	}
});

function openSettings(){
	var newURL =  chrome.extension.getURL('settings.html');
  	chrome.tabs.create({ url: newURL });
     }

function openManager(){
	var newURL =  chrome.extension.getURL('management.html');;
  	chrome.tabs.create({ url: newURL });
     }

function pluginStatusSwitch(){
	chrome.extension.sendMessage({ cmd: "setOnOffState", data: { value: document.getElementById("pluginCheck").checked } });
	if(document.getElementById("pluginCheck").checked){
		$('#onStatus').show();
		$('#offStatus').hide();
	}
	else{
		$('#offStatus').show();
		$('#onStatus').hide();
	}
	

}

