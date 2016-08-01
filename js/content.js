console.log("Initiating content script");

$('body').mouseup(function(e) {
    if(e.shiftKey){
        var text=getSelectedText();
        if (text!=''){
            $('body').highlight(text);}
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



/*check if page is saved in storage...

if yes -> get the saved info from that

if no -> do nothing


{
	application: MarkIt,
	saved_pages:[
	'page1':'somewaytostore',
	'page2':'somewaytostore'
	]

}*/
