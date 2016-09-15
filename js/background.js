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