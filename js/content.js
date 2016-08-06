console.log("Initiating content script");

console.log(window.location.href)
var keys = [];
var new_page = true;

function highlight(text)
{
	console.log(text)
    inputText = document.querySelector('body')
    var innerHTML = inputText.innerHTML
    var index = innerHTML.indexOf(text);
    if ( index >= 0 )
    { 
        innerHTML = innerHTML.substring(0,index) + "<span class='highlight'>" + innerHTML.substring(index,index+text.length) + "</span>" + innerHTML.substring(index + text.length);
        inputText.innerHTML = innerHTML 
    }

}

window.onkeyup = function(e) {keys[e.keyCode]=false;}
window.onkeydown = function(e) {keys[e.keyCode]=true;}

//chrome.storage.sync.clear();
function isNewPage(){
	chrome.storage.sync.get(window.location.href, function (obj) {
		new_page = (Object.keys(obj).length == 0)
		console.log(new_page)
		if(new_page == false){
			loadHighlights()
		}
	});	
}

isNewPage();

loadHighlights();
function loadHighlights(){
	console.log("loading saved highlights")
	chrome.storage.sync.get(null, function(items) {
	//var allKeys = Object.keys(items);
	//console.log(JSON.stringify(items));
	//console.log("curent");console.log(JSON.stringify(items[window.location.href]))
	highlights = items[window.location.href]
	for(entry in highlights){
		console.log("highlight: "); console.log(highlights[entry])
		//$('body').highlight(highlights[entry]['text']);
		highlight(highlights[entry]['text']);
	}
	});
}

function highlightText(text){
	//$('body').highlight(text);
	highlight(text);
	if(new_page){
		console.log("saving new highlight")
		pageurl = window.location.href;
		var obj = {};
		obj[pageurl] = [{"text":text, "color":"yellow"}] ;
		chrome.storage.sync.set(obj, function() {
          console.log('highlight saved');
          new_page = false;
        });
	}
	else{
		console.log("not new page")
		chrome.storage.sync.get(window.location.href, function (obj) {
                	//console.log(JSON.stringify(obj))
                        //console.log(JSON.stringify(obj[window.location.href]))
			tempobj = obj[window.location.href];
			tempobj.push({"text":text, "color":"yellow"})
			//console.log(JSON.stringify(tempobj))
			obj = {}
			obj[window.location.href] = tempobj;
			chrome.storage.sync.set(obj, function() {
          			console.log('highlight saved');
        		});	
       		});
	}
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

/*function getSelectedText() {
    if (window.getSelection) {
	console.log(window.getSelection().toString());
        return window.getSelection().toString();
    } else if (document.selection) {
	console.log(document.selection.createRange().text);
        return document.selection.createRange().text;
    }
    return '';
}*/
function getSelectedText() {
    var html = "";
    if (typeof window.getSelection != "undefined") {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var container = document.createElement("div");
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
            }
            html = container.innerHTML;
        }
    } else if (typeof document.selection != "undefined") {
        if (document.selection.type == "Text") {
            html = document.selection.createRange().htmlText;
        }
    }
    console.log(html)
    return html;
}
