var delta;
var highlight_key;
var delete_key;
var lastKeypressTime = 0;
var highlightEnabled = false;
var deleteEnabled = false;
var settingsURL =  chrome.extension.getURL('settings.html');


loadSettings();
stopPlugin();

chrome.extension.onMessage.addListener(
function (msg, sender, sendResponse) {
    if (msg.action == "togglePlugin") {
        if(msg.OnOffState == false){
        	$(document).unbind("keypress",KeyHandler);
        	highlightEnabled = false;
        	deleteEnabled = false;
        }
        else{
	    		$(document).bind("keypress",KeyHandler);
	    }
    	chrome.storage.local.get('urlfilter', function(items) {

	    for(i=0;i<items['urlfilter'].length;i++){
	    	if(window.location.href.indexOf(items['urlfilter'][i]) !== -1){
	    		//dont activate keypress
	    		console.log("This page is in Markit's filter URLs. Extension will not work here.Check Settings")
	    	} 
	    	else{
	    		$(document).bind("keypress",KeyHandler);
	    	}
		} 
		});
    	
    
    }
    if (msg.action == "urlFILTER") {
    	console.log("URL checking on content page");
    	chrome.storage.local.get('urlfilter', function(items) {
    	console.log(items);
    	if(items['urlfilter'].length == 0){
    		console.log("activating markit if global settings is ON");
	    		chrome.extension.sendMessage({ cmd: "getOnOffState" }, function (response) {
					console.log(response)
				    if (response == true) {
				    	console.log("plugin is activated on this page");
     	    			$(document).bind("keypress",KeyHandler);
				    }
				});
    	}
	    for(i=0;i<items['urlfilter'].length;i++){
	    	if(window.location.href.indexOf(items['urlfilter'][i]) !== -1){
	    		//dont activate keypress
	    		$(document).unbind("keypress",KeyHandler);
	        	highlightEnabled = false;
	        	deleteEnabled = false;
	    		console.log("This page is in Markit's filter URLs. Extension will not work here.Check Settings")
	    	} 
	    	else{
	    		console.log("activating markit if global settings is ON");
	    		chrome.extension.sendMessage({ cmd: "getOnOffState" }, function (response) {
					console.log(response)
				    if (response == true) {
				    	console.log("plugin is activated on this page");
     	    			$(document).bind("keypress",KeyHandler);
				    }
				});
	    		
	    	}
		} 
		});
    }
    
});

function stopPlugin(){
	chrome.storage.local.get('urlfilter', function(items) {
		if(items['urlfilter'].length == 0){
			chrome.extension.sendMessage({ cmd: "getOnOffState" }, function (response) {
				if (response == true) {
		    			$(document).bind("keypress",KeyHandler);
			    }
			});
		}
	    for(i=0;i<items['urlfilter'].length;i++){
	    	if(window.location.href.indexOf(items['urlfilter'][i]) !== -1){
	    		//dont activate keypress
	    		console.log("This page is in Markit's filter URLs. Extension will not work here.Check Settings")
	    	} 
	    	else{
	    		//GET plugin on/off status
				chrome.extension.sendMessage({ cmd: "getOnOffState" }, function (response) {
					console.log(response)
				    if (response == true) {
				    	console.log("plugin is activated on this page");
     	    			$(document).bind("keypress",KeyHandler);
				    }
				});
	    	}
		} 
	});
}

if(window.location.href == settingsURL){
	var highlightKey = document.getElementById("highlight_key");
	var deleteKey = document.getElementById("delete_key");
	var inputGap = document.getElementById("time_diff");

	document.getElementById("updateButton").addEventListener("click",updateSettings);
	document.getElementById("donateButton").addEventListener("click",openPaypal);
	document.getElementById("filterURL").addEventListener("click",addFilter);		

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

function addFilter(){
	$('#filterUL').append('<li class="list-group-item">' + "<button class='btn btn-danger deleteURL btn-xs pull-xs-right' data-title='Delete' data-toggle='modal' data-target='#delete' ><span class='glyphicon glyphicon-trash'></span></button>" + $('#filter_add_key').val()  +'</li>');
	chrome.storage.local.get('urlfilter', function(result) {
		urls = result.urlfilter;
		urls.push($('#filter_add_key').val());
		obj = {}
		obj['urlfilter'] = urls;
		chrome.storage.local.set(obj, function() {
				chrome.extension.sendMessage({ cmd: "initiateUrlCheck" }); //toggle url check on all pages
    		});
    });
}

function openPaypal(){
	var newURL =  "https://www.paypal.me/HimanshuJain";
  	chrome.tabs.create({ url: newURL });
     }

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
		  			if(window.location.href == settingsURL){
		  				highlightKey.value = 'h';
						deleteKey.value = 'd';
						inputGap.value = 200;
		  			}
		        });
		  	}
        });

	chrome.storage.local.get('urlfilter', function(result) {
		urls = result.urlfilter;
		if(urls == undefined){
			chrome.storage.local.set({'urlfilter': []}, function() {
		  			console.log(" default settings saved");
		        });
		}
		else{
			var arrayLength = urls.length;
			for (var i = 0; i < arrayLength; i++) {
				$('#filterUL').append('<li class="list-group-item">' + "<button class='btn btn-danger deleteURL btn-xs pull-xs-right' data-title='Delete' data-toggle='modal' data-target='#delete' ><span class='glyphicon glyphicon-trash'></span></button>" + urls[i]  +'</li>');

			}	
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
	console.log(itemname);
	if(itemname == "urlfilter"){return;}
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

$(document).on('click', '.deleteURL', function () {

    var delText = $(this).parent().html().replace('<button class="btn btn-danger deleteURL btn-xs pull-xs-right" data-title="Delete" data-toggle="modal" data-target="#delete"><span class="glyphicon glyphicon-trash"></span></button>',"");
    chrome.storage.local.get('urlfilter', function(items) {

	    for(i=0;i<items['urlfilter'].length;i++){
	    	if(items['urlfilter'][i].indexOf(delText) !== -1){
	    		items['urlfilter'].splice(i,1);
	    		obj = {}
				obj['urlfilter'] = items['urlfilter'];
				chrome.storage.local.set(obj, function() {
					chrome.extension.sendMessage({ cmd: "initiateUrlCheck" }); //toggle url check on all pages
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

$(document).on('click', '.exportPage', function () {
    var page = $(this).parent().find('a')[0].innerText;

    chrome.storage.local.get(page, function(items) {
	    console.log(items);
	    let docContent = JSON.stringify(items);
		let doc = URL.createObjectURL( new Blob([docContent], {type: 'application/octet-binary'}) );
		chrome.downloads.download({ url: doc, filename: "exported_highlight.json", conflictAction: 'overwrite', saveAs: true });
	});


});

$(document).on('change', '#import_page', function(event) {
	var uploadedFile = event.target.files[0]; 

    if (uploadedFile) {
        var readFile = new FileReader();
        readFile.onload = function(e) { 
            var contents = e.target.result;
            var json = JSON.parse(contents);
            chrome.storage.local.set(json, function() {
		      alert("highlight imported");
		      location.reload();
		    });
        };
        readFile.readAsText(uploadedFile);
    } else { 
        alert("Failed to load file");
    }
	

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
		console.log("unable to save highlight. You possibly selected text over multiple elements")
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
