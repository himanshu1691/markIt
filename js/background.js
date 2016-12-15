chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    chrome.notifications.create("functionEnabled",{   
        type: 'basic', 
        iconUrl: 'css/icon/icon_48.png', 
        title: "Function Enabled Notification", 
        message: request.msg
        }, function(){

    });
});

chrome.runtime.setUninstallURL("https://chrome.google.com/webstore/detail/markit-text-highlighter-a/gppkdamjnjjjbfpiopekeccgaigakcng/support", 
    function(){console.log("extension uninstalled. opening feedback url");}
    )

var isExtensionOn = true;

chrome.extension.onMessage.addListener(
function (request, sender, sendResponse) {
    if (request.cmd == "setOnOffState") {
        isExtensionOn = request.data.value;

        chrome.tabs.query({}, function(tabs) {
		    var message = {'OnOffState': isExtensionOn,action: "togglePlugin"};
		    for (var i=0; i<tabs.length; ++i) {
		        chrome.tabs.sendMessage(tabs[i].id, message);
		    }
		});
    }

    if (request.cmd == "getOnOffState") {
        sendResponse(isExtensionOn);
    }
    if (request.cmd == "initiateUrlCheck") {
        console.log("URL CHECK");
        chrome.tabs.query({}, function(tabs) {
            var message = {action: "urlFILTER"};
            for (var i=0; i<tabs.length; ++i) {
                chrome.tabs.sendMessage(tabs[i].id, message);
            }
        });
    }
});