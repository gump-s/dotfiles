
function onAddressKey(event)
{
    var characterCode;
    // First, check for the enter key
    if(event && event.which)
    {
        //if which property of event object is supported (NN4)
        characterCode = event.which; //character code is contained in NN4's which property
    }
    else
    {
        characterCode = event.keyCode; //character code is contained in IE's keyCode property
    }

    if(characterCode == 13)
    {
        onAddressEnter();
        return false;
    }
}

function onSearchKey(event) {
	var characterCode;
	// First, check for the enter key
	if (event && event.which) {
		//if which property of event object is supported (NN4)
		characterCode = event.which; //character code is contained in NN4's which property
	}
	else {
		characterCode = event.keyCode; //character code is contained in IE's keyCode property
	}

	if (characterCode == 13) {
		onSearchEnter();
		return false;
	}
}

function sendParentMessage(msg)
{
	var data = escape(JSON.stringify(msg));
    window.parent.postMessage(data, "*");
}

function navigate(url, onComplete)
{
	sendParentMessage({ cmd: "NAVIGATECONTAINER", url: url });
}

function onAddressFocus()
{
    window.setTimeout(function() { document.getElementById("addressBox").select()}, 100);
}

function onBack()
{
	sendParentMessage({ cmd: "BACK" });
}

function onForward()
{
    sendParentMessage({ cmd: "FORWARD" });
}

function onSearchFocus()
{
	window.setTimeout(function() { document.getElementById("searchBox").select() }, 100);
}

function onSearchEnter() {
	// Navigate the top frame so this navigation gets into the history and the
	// back / forward queue
	var text = document.getElementById("searchBox").value;
	var url = "http://www.xadnet.com/search?src=sb&q=" + encodeURIComponent(text);
	sendParentMessage({ cmd: "NAVIGATECONTAINER", url: url, nosearch: true });
}

function onAddressEnter()
{
    // Navigate the top frame so this navigation gets into the history and the
    // back / forward queue
    var url = document.getElementById("addressBox").value;
    sendParentMessage({ cmd:"NAVIGATECONTAINER", url: url });
}

function onReturnToChrome()
{
    sendParentMessage({ cmd:"RETURNTOCHROME" });
}

function onOptions()
{
    sendParentMessage({ cmd:"SHOWIEOPTIONS" });
}

function onBookmark()
{
	sendParentMessage({ cmd: "BOOKMARK" });
    return false;
}

function onStateChange(state, newValue) {
// Not used for now -- users are happy with the integrated Chrome button BK/FWD behavior
return;
	if (state == "back") {
		var elBack = document.getElementById("back");
		if (newValue) {
			elBack.src = "images/back.png";
			elBack.parentNode.href = "javascript:onBack()";
		}
		else {
			elBack.src = "images/noback.png";
			elBack.parentNode.removeAttribute("href");
		}
	}
	else if (state == "forward") {
		var elForward = document.getElementById("forward");
		if (newValue) {
			elForward.src = "images/fwd.png";
			elForward.parentNode.href = "javascript:onForward()";
		}
		else {
			elForward.src = "images/nofwd.png";
			elForward.parentNode.removeAttribute("href");
		}
	}
}

function onParentMessage()
{
    var msg = JSON.parse(unescape(event.data));

    switch(msg.cmd)
    {
        case "ONTITLECHANGE":
            onTitleChange(msg.newTitle);
            break;
        case "NAVIGATECOMPLETE2":
            onNavigateComplete2(msg.url);
            break;
        case "ONSTATECHANGE":
           	onStateChange(msg.state, msg.newValue);
           	break;
           case "ONPARENTINIT":
           	g_currentUrl = msg.startUrl;
           	// And populate the address box with it.  Note that we communicate locally only,
           	// don't want to be sending visited URLs back!
           	document.getElementById("addressBox").value = g_currentUrl;
           	var el = document.getElementById("settings");
           	el.href = "http://www.ietab.net/options?initial=" + encodeURIComponent(g_currentUrl);

           	// Populate the UI elements with the localized strings
           	for (var strName in msg.resultStrings) {
           		var el = document.getElementById(strName);
           		if (el)
           			el.title = msg.resultStrings[strName];
           	}

           	break;
    }
}

function onTitleChange(newTitle)
{
    document.title = "IE: " + newTitle;
}

function onNavigateComplete2(url)
{
    g_currentUrl = url;
    document.getElementById("addressBox").value = url;
}

function addEventListeners() {
    var el = document.getElementById("addressBox");
    el.addEventListener("focus", onAddressFocus, false);
    el.addEventListener("keypress", onAddressKey, false);

    el = document.getElementById("goButton");
    el.addEventListener("click", onAddressEnter, false);

    el = document.getElementById("bookmark");
    el.addEventListener("click", onBookmark, false);

    el = document.getElementById("searchBox");
    el.addEventListener("focus", onSearchFocus, false);
    el.addEventListener("keypress", onSearchKey, false);

    el = document.getElementById("tipSearch");
    el.addEventListener("click", onSearchEnter, false);

    el = document.getElementById("closeBtn");
    el.addEventListener("click", onReturnToChrome, false);
}

function init() {
	addEventListeners();

    // Add the message event listener to get commands from our UI.
	window.addEventListener("message", function(event) {
		onParentMessage(event);
	}, false);

	sendParentMessage({ cmd: "ONUIINIT",
	                    strings: [ "tipIETabOptions", "tipBookmarkPage", "tipDocs", "tipSearch", "tipClose" ]
	});

	if (document.location.href.indexOf("showsearchbox=1") != -1) {
		document.getElementById("searchColumn").style.display = "table-cell";
	}
}

// Parse the starting URL
var g_currentUrl = "about:blank";
var g_urlOptions = "";

init();
