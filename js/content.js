console.log("Initiating content script");

console.log(window.location.href)
var keys = [];

window.onkeyup = function(e) {keys[e.keyCode]=false;}
window.onkeydown = function(e) {keys[e.keyCode]=true;}


function isNewPage(){
	var empty_status = false;
	chrome.storage.sync.get(window.location.href, function (obj) {
		empty_status = (Object.keys(obj).length == 0)
		console.log("inside" + empty_status)
	});
	console.log("outside"+empty_status)
	return empty_status
}

function loadHighlights(){
	console.log("loading saved highlights")
	chrome.storage.sync.get(null, function(items) {
    var allKeys = Object.keys(items);
    console.log(allKeys);
	});
}

function highlightText(text){
	$('body').highlight(text);
	console.log("is it new page: " +isNewPage())
	if(isNewPage()){
		console.log("saving new highlight")
		pageurl = window.location.href;
		chrome.storage.sync.set({pageurl: [{"text":text, "color":"yellow"}]}, function() {
          // Notify that we saved.
          message('highlight saved');
        });
	}
	else{
		console.log("not new page")
	}
}

if(!isNewPage()){
    loadHighlights();
}

$('body').mouseup(function(e) {
    if(keys["72"]){ //h is pressed
        console.log("h is pressed")
        var text=getSelectedText();
        if (text!=''){
        	highlightText(text);            
        }
    }
});

function getSelectedText() {
    if (window.getSelection) {
        return window.getSelection().toString();
    } else if (document.selection) {
        return document.selection.createRange().text;
    }
    return '';
}