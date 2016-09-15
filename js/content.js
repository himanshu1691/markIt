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
        // optional - if we'd rather not detect a triple-press
        // as a second double-press, reset the timestamp
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
	console.log(highlightEnabled);
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
	console.log(deleteEnabled);
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
    	console.log($(this).children(':visible').length);
    	if($(this).children(':visible').length == 0) {
		   //$(this).parentsUntil('.panel').hide();
		   $(this).parent().parent().parent().hide();
		}

    	
    });
});


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
		pageLi[0].innerHTML =  "<button class='btn btn-danger deleteEntryButton btn-xs pull-xs-right' data-title='Delete' data-toggle='modal' data-target='#delete' ><span class='glyphicon glyphicon-trash'></span></button>" + item[entry].text;
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
	//console.log(text);
	//console.log(getSelectedParent().parentNode.innerHTML)
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

$(document).on('click', '.deleteEntryButton', function () {
    //var delText = $(this).parent().html().replace(/<[^>]*>/g, "");

    var delText = $(this).parent().html().replace('<button class="btn btn-danger deleteEntryButton btn-xs pull-xs-right" data-title="Delete" data-toggle="modal" data-target="#delete"><span class="glyphicon glyphicon-trash"></span></button>',"");
    console.log(delText);
    var fromPage =  $(this).parent().parent().parent().parent().parent().find('.panel-heading h4 a').html();
  //console.log($(this).parent().parent().parent().parent().parent().find('.panel-heading h4 a').html())//.attr('href'));

    chrome.storage.sync.get(fromPage, function(items) {
	    for(i=0;i<items[fromPage].length;i++){
	    	if(items[fromPage][i].text.indexOf(delText) !== -1){
	    		items[fromPage].splice(i,1);
	    		console.log("updated obj");
	    		obj = {}
				obj[fromPage] = items[fromPage];
				chrome.storage.sync.set(obj, function() {
	          			console.log('highlights deleted');
	        		});

	    	} 
		} 
	});

});

$(document).on('click', '.deletePage', function () {
    //var delText = $(this).parent().html().replace(/<[^>]*>/g, "");
    var page = $(this).parent().find('a')[0].innerText;

    chrome.storage.sync.remove(page, function(items) {
	    if (chrome.runtime.lastError) {
            console.log("unable to delete object");
        }
        else{
        	console.log("object deleted");
        }
	});

});

document.onkeydown = KeyHandler;

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
    if(highlightEnabled){ //h is pressed
        console.log("h is pressed")
        var text=getSelectedText();
        if (text!=''){
        	highlightText(text);            
        }
    }
});

$('body').mouseup(function(e) {
    if(deleteEnabled){ //d is pressed
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
