console.log("Initiating content script");
//chrome.storage.sync.clear();


var delta = 500;
var lastKeypressTime = 0;
var highlightEnabled = false;
var deleteEnabled = false;
function KeyHandler(event)
{
   if ( event.keyCode == 72 )
   {
      var thisKeypressTime = new Date();
      if ( thisKeypressTime - lastKeypressTime <= delta )
      {
        enableHighlight();
        // optional - if we'd rather not detect a triple-press
        // as a second double-press, reset the timestamp
        thisKeypressTime = 0;
      }
      lastKeypressTime = thisKeypressTime;
   }
   else if ( event.keyCode == 68 )
   {
      var thisKeypressTime = new Date();
      if ( thisKeypressTime - lastKeypressTime <= delta )
      {
        enableDelete();
        thisKeypressTime = 0;
      }
      lastKeypressTime = thisKeypressTime;
   }
}

function enableHighlight(){
	if(highlightEnabled == true){
		highlightEnabled = false;
		chrome.runtime.sendMessage({msg: "Highlight mode deactivated"});
	}
	else{
		highlightEnabled = true;
		deleteEnabled = false;
		chrome.runtime.sendMessage({msg: "Highlight mode activated"});
	}
}

function enableDelete() {
	if(deleteEnabled == true){
		deleteEnabled = false;
		chrome.runtime.sendMessage({msg: "Delete mode deactivated"});

	}
	else{
		deleteEnabled = true;
		highlightEnabled = false;
		chrome.runtime.sendMessage({msg: "Delete mode activated"});
	}
}

var managementURL =  chrome.extension.getURL('management.html');

$("#searchbox").bind("keyup", function() {
	$('.panel').show();
    var value = $(this).val().toLowerCase();
    $(".list-group-item").each(function() {
        if ($(this).text().search(value) > -1) {
            $(this).show();
        }
        else {
            $(this).hide();
        }
    });

    $(".list-group").each(function() {
    	if($(this).children(':visible').length == 0) {
		   //$(this).parentsUntil('.panel').hide();
		   $(this).parent().parent().parent().hide();
		}

    	
    });
});


if(window.location.href == managementURL){
	getAllHighlights()
}
else
{
	isNewPage();
}

function addManagementEntry(itemname, item){
	pageCol = $(".panel").first().clone();
	pageCol.find('a')[0].innerHTML = itemname;
	for(entry in item){
		pageLi = pageCol.find('li').first().clone();
		pageLi[0].innerHTML =  "<button class='btn btn-danger deleteEntryButton btn-xs pull-xs-right' data-title='Delete' data-toggle='modal' data-target='#delete' ><span class='glyphicon glyphicon-trash'></span></button>" + item[entry].text;
		pageCol.find('ul').first().append(pageLi)
	}
	pageCol.find('li').first().remove()
	$( ".panel-group" ).append(pageCol);
}

function getAllHighlights(){
	chrome.storage.sync.get(null, function(items) {
		for(item in items){
			addManagementEntry(item, items[item])
		}
		if(Object.keys(items).length != 0){
			$(".panel").first().remove()
		}
	});
}

var new_page = true;

function highlight(text)
{
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
	temp = getSelectedParent().parentNode.innerHTML;
    chrome.storage.sync.get(window.location.href, function(items) {
	    for(i=0;i<items[window.location.href].length;i++){
	    	if(items[window.location.href][i].text.indexOf(text) !== -1){
	    		spantext = "<span class=\"highlight\">"+items[window.location.href][i].text+"</span>";
	    		temp = temp.replace(spantext,items[window.location.href][i].text);
	    		getSelectedParent().parentNode.innerHTML = temp;
	    		items[window.location.href].splice(i,1);
	    		obj = {}
				obj[window.location.href] = items[window.location.href];
				chrome.storage.sync.set(obj, function() {
	        		});

	    	} 
		} 
	});

}

$(document).on('click', '.deleteEntryButton', function () {

    var delText = $(this).parent().html().replace('<button class="btn btn-danger deleteEntryButton btn-xs pull-xs-right" data-title="Delete" data-toggle="modal" data-target="#delete"><span class="glyphicon glyphicon-trash"></span></button>',"");
    var fromPage =  $(this).parent().parent().parent().parent().parent().find('.panel-heading h4 a').html();

    chrome.storage.sync.get(fromPage, function(items) {
	    for(i=0;i<items[fromPage].length;i++){
	    	if(items[fromPage][i].text.indexOf(delText) !== -1){
	    		items[fromPage].splice(i,1);
	    		obj = {}
				obj[fromPage] = items[fromPage];
				chrome.storage.sync.set(obj, function() {
	        		});

	    	} 
		} 
	});

});

$(document).on('click', '.deletePage', function () {
    var page = $(this).parent().find('a')[0].innerText;

    chrome.storage.sync.remove(page, function(items) {
	    if (chrome.runtime.lastError) {
        }
        else{
        	// object deleted
        }
	});

});

document.onkeydown = KeyHandler;

function isNewPage(){
	chrome.storage.sync.get(window.location.href, function (obj) {
		new_page = (Object.keys(obj).length == 0)
		if(new_page == false){
			loadHighlights(window.location.href)
		}
	});	
}

function loadHighlights(pageurl){
	chrome.storage.sync.get(pageurl, function(items) {
	highlights = items[pageurl]
	for(entry in highlights){
		highlight(highlights[entry]['text']);
	}
	});
}


function highlightText(text){
	highlight(text);
	if(new_page){
		pageurl = window.location.href;
		var obj = {};
		obj[pageurl] = [{"text":text, "color":"yellow"}] ;
		chrome.storage.sync.set(obj, function() {
          new_page = false;
        });
	}
	else{
		chrome.storage.sync.get(window.location.href, function (obj) {
			tempobj = obj[window.location.href];
			tempobj.push({"text":text, "color":"yellow"})
			obj = {}
			obj[window.location.href] = tempobj;
			chrome.storage.sync.set(obj, function() {
        		});	
       		});
	}
}

$('body').mouseup(function(e) {
    if(highlightEnabled){ //h is pressed
        var text=getSelectedText();
        if (text!=''){
        	highlightText(text);            
        }
    }
});

$('body').mouseup(function(e) {
    if(deleteEnabled){ //d is pressed
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
