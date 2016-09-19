var delta;
var highlight_key;
var delete_key;
var lastKeypressTime = 0;
var highlightEnabled = false;
var deleteEnabled = false;
var settingsURL =  chrome.extension.getURL('settings.html');

document.onkeypress = KeyHandler;

loadSettings();

if(window.location.href == settingsURL){
	var highlightKey = document.getElementById("highlight_key");
	var deleteKey = document.getElementById("delete_key");
	var inputGap = document.getElementById("time_diff");

	document.getElementById("updateButton").addEventListener("click",updateSettings);

}

chrome.storage.onChanged.addListener(function(changes) {
	for (key in changes) {
      var storageChange = changes[key];
      if(key == "highlightKey")
      {
      	highlight_key = storageChange.newValue.charCodeAt(0);
      }
      else if(key == "deleteKey"){
      	delete_key = storageChange.newValue.charCodeAt(0);
      }
      else if(key == "inputGap"){
      	delta = storageChange.newValue;
      }
  	}
});

function loadSettings(){
	chrome.storage.local.get(['highlightKey','deleteKey','inputGap']	, function(result) {
        	if(Object.keys(result).length != 0){
        		console.log("loading saved settings")
        		if(window.location.href == settingsURL){
	        		highlightKey.value = result.highlightKey;
					deleteKey.value = result.deleteKey;
					inputGap.value = result.inputGap;
				}
				highlight_key = result.highlightKey.charCodeAt(0);
        		delete_key = result.deleteKey.charCodeAt(0);
        		delta = result.inputGap;
		  	}
		  	else{
		  		//saving default settings
		  		chrome.storage.local.set({'highlightKey': 'h','deleteKey':'d','inputGap':200 }, function() {
		  			console.log(" default settings saved");
		        });
		  	}
        });
}

function updateSettings(){
	chrome.storage.local.set({'highlightKey': highlightKey.value,'deleteKey':deleteKey.value,'inputGap':inputGap.value }, function() {
		  			alert("settings updated");
		        });
}

function KeyHandler(event)
{
	if($('#highlight_key').is(':focus')){
		$('#highlight_key').val(String.fromCharCode(event.keyCode));
	}
	if($('#delete_key').is(':focus')){
		$('#delete_key').val(String.fromCharCode(event.keyCode));
	}
   if ( event.keyCode == highlight_key )
   {
      var thisKeypressTime = new Date();
      if ( thisKeypressTime - lastKeypressTime <= delta )
      {
        enableHighlight();
        thisKeypressTime = 0;
      }
      lastKeypressTime = thisKeypressTime;
   }
   else if ( event.keyCode == delete_key )
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
	pageCol.find('a').attr("href", itemname);
	for(entry in item){
		pageLi = pageCol.find('li').first().clone();
		pageLi[0].innerHTML =  "<button class='btn btn-danger deleteEntryButton btn-xs pull-xs-right' data-title='Delete' data-toggle='modal' data-target='#delete' ><span class='glyphicon glyphicon-trash'></span></button>" + item[entry].text;
		pageCol.find('ul').first().append(pageLi)
	}
	pageCol.find('li').first().remove()
	$( ".panel-group" ).append(pageCol);
}

function getAllHighlights(){
	chrome.storage.local.get(null, function(items) {
		for(item in items){
			if(item !="deleteKey" && item !="highlightKey" && item != "inputGap"){
				addManagementEntry(item, items[item]);
			}	
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
    return index
}

function removeHighlight(text){
	temp = getSelectedParent().parentNode.innerHTML;
    chrome.storage.local.get(window.location.href, function(items) {
	    for(i=0;i<items[window.location.href].length;i++){
	    	if(items[window.location.href][i].text.indexOf(text) !== -1){
	    		spantext = "<span class=\"highlight\">"+items[window.location.href][i].text+"</span>";
	    		temp = temp.replace(spantext,items[window.location.href][i].text);
	    		getSelectedParent().parentNode.innerHTML = temp;
	    		items[window.location.href].splice(i,1);
	    		obj = {}
				obj[window.location.href] = items[window.location.href];
				chrome.storage.local.set(obj, function() {
	        		});

	    	} 
		} 
	});

}

$(document).on('click', '.deleteEntryButton', function () {

    var delText = $(this).parent().html().replace('<button class="btn btn-danger deleteEntryButton btn-xs pull-xs-right" data-title="Delete" data-toggle="modal" data-target="#delete"><span class="glyphicon glyphicon-trash"></span></button>',"");
    var fromPage =  $(this).parent().parent().parent().parent().parent().find('.panel-heading h4 a').html();

    chrome.storage.local.get(fromPage, function(items) {
	    for(i=0;i<items[fromPage].length;i++){
	    	if(items[fromPage][i].text.indexOf(delText) !== -1){
	    		items[fromPage].splice(i,1);
	    		obj = {}
				obj[fromPage] = items[fromPage];
				chrome.storage.local.set(obj, function() {
					location.reload();
	        		});

	    	} 
		} 
	});

});

$(document).on('click', '.deletePage', function () {
    var page = $(this).parent().find('a')[0].innerText;

    chrome.storage.local.remove(page, function(items) {
	    if (chrome.runtime.lastError) {
        }
        else{
        	location.reload();
        }
	});

});


function isNewPage(){
	chrome.storage.local.get(window.location.href, function (obj) {
		new_page = (Object.keys(obj).length == 0)
		if(new_page == false){
			loadHighlights(window.location.href)
		}
	});	
}

function loadHighlights(pageurl){
	chrome.storage.local.get(pageurl, function(items) {
	highlights = items[pageurl]
	for(entry in highlights){
		highlight(highlights[entry]['text']);
	}
	});
}


function highlightText(text){
	findStatus = highlight(text);
	if(findStatus == -1){
		alert("unable to save highlight. You possibly selected text over multiple elements")
		return;
	}
	if(new_page){
		pageurl = window.location.href;
		var obj = {};
		obj[pageurl] = [{"text":text, "color":"yellow"}] ;
		chrome.storage.local.set(obj, function() {
          new_page = false;
        });
	}
	else{
		chrome.storage.local.get(window.location.href, function (obj) {
			tempobj = obj[window.location.href];
			tempobj.push({"text":text, "color":"yellow"})
			obj = {}
			obj[window.location.href] = tempobj;
			chrome.storage.local.set(obj, function() {
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
