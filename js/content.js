console.log("Initiating content script");
//chrome.storage.sync.clear();

console.log(window.location.href)

var managementURL =  chrome.extension.getURL('management.html');
if(window.location.href == managementURL){
	console.log("management page loaded")
	getAllHighlights()
}
else
{
	isNewPage();
}

function addManagementEntry(itemname, item){
	console.log("into manage")
	console.log(item);
	pageCol = $(".panel").first().clone();
	pageCol.find('a')[0].innerHTML = itemname;
	for(entry in item){
		console.log("entry")
		pageLi = pageCol.find('li').first().clone();
		pageLi[0].innerText = item[entry].text;
		pageCol.find('ul').first().append(pageLi)
	}
	pageCol.find('li').first().remove()
	$( ".panel-group" ).append(pageCol);
}

function getAllHighlights(){
	chrome.storage.sync.get(null, function(items) {
		console.log(items)
		for(item in items){
			addManagementEntry(item, items[item])
		}
		if(Object.keys(items).length != 0){
			$(".panel").first().remove()
		}
	});
}

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

function removeHighlight(text){
	console.log(text);
	console.log(getSelectedParent().parentNode.innerHTML)
	temp = getSelectedParent().parentNode.innerHTML;
	//temp = temp.replace("<span class=\"highlight\">","").replace("</span>","");
    //getSelectedParent().parentNode.innerHTML = temp;

    chrome.storage.sync.get(window.location.href, function(items) {
    console.log(items);
	    for(i=0;i<items[window.location.href].length;i++){
	    	console.log("temp:"+ temp + "item: " + items[window.location.href][i].text)
	    	if(items[window.location.href][i].text.indexOf(text) !== -1){
	    		spantext = "<span class=\"highlight\">"+items[window.location.href][i].text+"</span>";
	    		temp = temp.replace(spantext,items[window.location.href][i].text);
	    		getSelectedParent().parentNode.innerHTML = temp;
	    		items[window.location.href].splice(i,1);
	    		console.log("updated obj");

	    		obj = {}
				obj[window.location.href] = items[window.location.href];
				chrome.storage.sync.set(obj, function() {
	          			console.log('highlights deleted');
	        		});

	    	} 
		} 
	});

}

window.onkeyup = function(e) {keys[e.keyCode]=false;}
window.onkeydown = function(e) {keys[e.keyCode]=true;}

function isNewPage(){
	chrome.storage.sync.get(window.location.href, function (obj) {
		new_page = (Object.keys(obj).length == 0)
		console.log(new_page)
		if(new_page == false){
			loadHighlights(window.location.href)
		}
	});	
}

function loadHighlights(pageurl){
	console.log("loading saved highlights")
	chrome.storage.sync.get(pageurl, function(items) {
	console.log(items);
	highlights = items[pageurl]
	for(entry in highlights){
		console.log("highlight: ");
		console.log(highlights[entry])
		highlight(highlights[entry]['text']);
	}
	});
}


function highlightText(text){
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
			tempobj = obj[window.location.href];
			tempobj.push({"text":text, "color":"yellow"})
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

$('body').mouseup(function(e) {
    if(keys["68"]){ //d is pressed
        console.log("d is pressed")
        var text=getSelectedText();
        if (text!=''){
        	removeHighlight(text);            
        }
    }
});

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

function getSelectedParent() {
  if (window.getSelection) {
      selection = window.getSelection();
  } else if (document.selection) {
      selection = document.selection.createRange();
  }
  var parent = selection.anchorNode;
  return parent.parentNode;
}
