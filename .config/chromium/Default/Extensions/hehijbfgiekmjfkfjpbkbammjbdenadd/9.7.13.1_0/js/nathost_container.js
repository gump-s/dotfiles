/*
 * nathost_container.js
 *
 * Script for the container that will use the Native Host for rendering the WebBrowser control.
 *
*/

var NativeHostContainer = {
    BW: null,  // The background window
    windowId: null,
    tabId: null,
    isAttached: false,
    realTitle: '',
    hostWindowId: null,
    hideAddressBar: false,
    navCompleteReceived: false,

    ATTACH_RETRY_TIMEOUT: 50,
    DISCONNECT_MESSAGE_WAIT: 3000,  // Don't show the disconnect message right away

    // We have a resize delay to deal with an obscure case:
    //    If you zoom in on the container page, you get the resize before
    //    the page has fully repainted.  So the anchor color line is still on the screen
    //    and we find it at the old location, thus we end up positioning the IE window
    //    where it WAS, not where it currently is.  You can see this by zooming the address
    //    bar out and then it happens when you zoom back in.
    RESIZE_DELAY: 50,

    navCompleteChanges: {},
    NAV_COMPLETE_CHANGE_WAIT: 2000,

    ONE_DAY_MS: 1000 * 3600 * 24,

    buildContainerUrl: function(childUrl, popupId) {
        var containerPage = 'nhc.htm';
        var containerUrl = chrome.extension.getURL(containerPage);
        if (popupId) {
            containerUrl += '#p=' + popupId + '&';
        } else {
            containerUrl += '#';
        }
        containerUrl += 'url=' + childUrl;
        return containerUrl;
    },

    navigateContainer: function(childUrl, replaceEntry) {
        // BACK / FWD ASSISTANCE
        // See Google Doc titled 'IE Tab BACK/FWD Support' for an explanation
        // of how navigateContainer, navigateHost, and the address bar cooperate
        // to make sure history is properly updated.
        var newUrl = this.buildContainerUrl(childUrl);
        if (newUrl != window.top.location.href) {
            if (replaceEntry) {
                window.top.location.replace(newUrl);
            } else {
                window.top.location = newUrl;
            }
        }
    },

    extractChildUrl: function() {
        var regex = /[#&]url=([^&].*)/;
        var url = document.location.href.toString();
        var match = url.match(regex);
        if(match) {
            return match[1];
        } else {
            return 'about:blank';
        }
    },

    updateAddressBar: function() {
        var url = this.extractChildUrl();
        $('#address-box').val(url);
    },

    handleResize: function() {
        window.setTimeout(function() {
            var msgResize = {
                type: 'RESIZE',
                innerWidth: this.getIEWidth(),
                innerHeight: this.getIEHeight()
            };
            NativeHost.postMessage(msgResize);
        }.bind(this), this.RESIZE_DELAY);
    },

    restoreTitle: function() {
        document.title = this.realTitle;
    },

    onReturnToChrome: function() {
        window.top.location = this.extractChildUrl();
    },

    onBookmark: function() {
    },

    navigateHost: function(url) {
        // If this change came from NAVIGATE_COMPLETE then don't navigate the host again
        // because he initiated this request and may have already moved on
        // with a redirect.  This avoids infinite loops, etc.
        if (this.navCompleteChanges[url]) {
            this.navCompleteReceived = true;
            delete this.navCompleteChanges[url];
            return;
        }
        this.navCompleteReceived = false;
        NativeHost.postMessage({ type: 'NAVIGATE', url: url });
    },

    sendOptions: function() {
        var msg = {
            type: 'OPTIONS',
            options: {
                'autourl-list':         Settings.get('autourl-list'),
                'exclusion-list':       Settings.get('exclusion-list'),
                'enable-chrome-popups': Settings.get('enable-chrome-popups'),
                'only-auto-urls':       Settings.get('only-auto-urls'),
                'never-open-exceptions':Settings.get('never-open-exceptions'),
                'enable-dep':           Settings.get('enable-dep'),
                'enable-atl-dep':       Settings.get('enable-atl-dep'),
                'show-status-text':     Settings.get('show-status-text'),
                'enable-direct-invoke': Settings.get('enable-direct-invoke'),
                'favicon':              Settings.get('favicon')
            }
        }
        NativeHost.postMessage(msg);
    },

    getIEWidth: function() {
        return Math.floor(window.innerWidth * window.devicePixelRatio);
    },

    getIEHeight: function() {
        var topHeight = this.hideAddressBar ? 1 : $('#address-bar')[0].offsetHeight;

        return Math.floor( (window.innerHeight - topHeight) * window.devicePixelRatio );
    },

    tryAttach: function() {
        if (this.isAttached) {
            return;
        }
        // Check whether we are the active tab
        chrome.tabs.getCurrent(function(tab) {
            // We can't attach if we don't have a window id or aren't active
            if (!tab.active || !this.windowId) {
                this.restoreTitle();
                return;
            }

            // Remember the title change is asynchronous, so don't keep changing it or the helper
            // will never find it.  We may have to retry several times to find the window after
            // a single title change
            if (document.title.indexOf('ietaba:') == -1) {
                this.realTitle = document.title;
                document.title = 'ietaba:' + Background.getNextIETabId();
            }

            var msg = {
                type: 'ATTACH',
                tabTitle: document.title,
                innerWidth: this.getIEWidth(),
                innerHeight: this.getIEHeight()
            }
            NativeHost.postMessage(msg);
        }.bind(this));
    },

    openNewWindow: function(url, features, popupInfo) {
        // If the full-window option is on or there are no features then use a full window
        var fullWindow = Settings.get('enable-use-full-window-popups') || !features;

        // Open in Chrome if the only-auto-urls value is set and this is not an auto URL
        var openInChrome = Settings.get("only-auto-urls") && !Background.isAutoURL(url);
        // With exception for about:blank
        openInChrome = openInChrome && (url != 'about:blank');

        // Also check for "never-open-exceptions"
        openInChrome |= (Settings.get('never-open-exceptions') && Background.isAutoURLException(url));
        if (!openInChrome) {
            // Store the popup info so the popup can find it
            var popupId = Background.getNextIETabId();
            Background.popupInfo[popupId] = popupInfo;
            url = this.buildContainerUrl(url, popupId);
        }

        // See if we should just open the pop-up in a tab
        var openInTab = Settings.get('open-popups-in-tab');
        if (openInTab) {
            chrome.tabs.create({ url: url, active: true });
            return;
        }

        // Build the window creation options
        var createOptions = {};
        if (fullWindow) {
            createOptions = { url: url };
        } else {
            // Find the options for creating the popup window
            var arrFeatures = features.split(',');
            createOptions = {
                url: url,
                focused: true,
                type: 'popup'
            }
            for (var i=0; i < arrFeatures.length; i++) {
                var parts = arrFeatures[i].split('=');
                if (typeof(parts[1]) == 'undefined')
                    continue;
                var value = parseInt(parts[1]);
                if (isNaN(value))
                    continue;
                switch(parts[0]) {
                    case 'left':
                    case 'right':
                    case 'top':
                        createOptions[parts[0]] = value;
                        break;
                    case 'width':
                        createOptions.width = value + 16;
                        break;
                    case 'height':
                        createOptions.height = value + 40;
                        break;
                }
            }
        }
        chrome.windows.create(createOptions);
    },

    setTitle: function(newTitle) {
        this.realTitle = newTitle;
        if (document.title.indexOf('ietaba:') == -1) {
            document.title = newTitle;
        }
    },

    onDisconnected: function() {
        // During shutdown, since the port was opened by the background page, it's possible
        // for the window object to be null here.
        if (window) {
            window.setTimeout(function() {
                $('#helper-disconnected').css('display', 'block');
            }, this.DISCONNECT_MESSAGE_WAIT);
        }
    },

    onScriptError: function(msg) {
        var text = '';
        if(msg['context'] == 'IE') {
            text = msg.context + ': ' + 'Error: ' + msg['errorMessage'] + '.  Source: ' + msg['errorUrl'] + ':' + msg['errorLine'];
        } else if(msg['context'] == 'IEC') {
            text = msg.context + ': ' + 'Error: ' + msg['description'] + ', line: ' + msg['lineNumber'];
        }
        console.error(text);
    },

    onLogMessage: function(msg) {
        var text = msg['context'] + ': ' + msg['message'];
        console.log(text);
    },

    onNativeMessage: function(msg, fnResponse) {
        // Only handle messages from our host window
        if (msg.hostWindowId && (msg.hostWindowId != this.hostWindowId)) {
            return;
        }

        switch(msg.type) {
            case 'TITLE_CHANGE':
                this.setTitle(msg.newTitle);
                break;
            case 'NAVIGATE_COMPLETE':
                // Track the URLs that came from NAVIGATE_COMPLETE so we don't try to update the host
                // again when a change comes back down from the Chrome address bar being changed.
                this.navCompleteChanges[msg.url] = true;
                window.setTimeout(function() {
                    delete this.navCompleteChanges[msg.url];
                }.bind(this), this.NAV_COMPLETE_CHANGE_WAIT);
                this.navigateContainer(msg.url, !this.navCompleteReceived);
                this.navCompleteReceived = true;
                break;
            case 'NEW_WINDOW':
                this.openNewWindow(msg.url, msg.features, { hostWindowId: msg.popupHostWindowId, port: NativeHost._port });
                break;
            case 'RETURN_TO_CHROME':
                window.top.location = msg.url;
                break;
            case 'WINDOW_CLOSING':
                window.setTimeout(function() {
                    window.close();
                }, 300);
                break;
            case 'BEFORENAVIGATE2':
                this.showLoadingFavicon();
                break;
            case 'CLOSED':
                console.log('CLOSED, disconnecting');
                NativeHost.disconnect();
                break;
            case 'CMDLINE':
                console.log('CMDLINE = ' + msg.value);
                break;
            case 'ATTACH_SUCCESS':
                this.isAttached = true;
                this.restoreTitle();
                break;
            case 'ATTACH_FAILED_METRO':
            case 'ATTACH_RETRY':
                window.setTimeout(function() {
                    this.tryAttach();
                }.bind(this), this.ATTACH_RETRY_TIMEOUT);
                break;
            case '_DISCONNECTED':
                this.onDisconnected();
                break;
            case 'SEND_MESSAGE':
                chrome.runtime.sendMessage(msg.extensionId, JSON.parse(msg.message));
                break;
            case 'SCRIPT_ERROR':
                this.onScriptError(msg);
                break;
            case 'LOG_MESSAGE':
                this.onLogMessage(msg);
                break;
            case 'FAVICON_CHANGED':
                this.updateFavicon(msg.newFavicon);
                break;
        }
    },

    initHostWindow: function(fnContinue) {
        // If we have popup info, then we already have a host window
        if (this.popupInfo) {
            fnContinue();
            return;
        }

        // Create a new host window.  It will initially be invisible.
        var anchorColor = this.hideAddressBar ? [ 0xad, 0xae, 0xad ] : [ 0x6b, 0x92, 0xe7 ];
        var msgCreate = {
            type: 'CREATE',
            anchorColor: anchorColor
        }
        NativeHost.sendMessage(msgCreate, function(msgResult) {
            if (msgResult.type == 'CREATE_SUCCESS') {
                this.hostWindowId = msgResult.hostWindowId;
                NativeHost.setIncludeWithAll({ hostWindowId: this.hostWindowId });
                fnContinue();
            } else {
                // Treat this like we were disconnected.
                this.onDisconnected();
            }
        }.bind(this));
    },

    sendCookies: function(url, fnFinished) {
        if (!Settings.get('cookie-sync')) {
            fnFinished();
            return;
        }
        chrome.cookies.getAll({ url: url }, function(cookies) {
            var cookieStrings = [];
            for (var i=0; i<cookies.length; i++) {
                var cookie = cookies[i];
                var str = cookie.name + '=' + cookie.value + '; path=' + cookie.path + '; domain=' + cookie.domain;
                if (!cookie.session && (typeof(cookie.expirationDate) != 'undefined')) {
                    var strDate = new Date(cookie.expirationDate * 1000);
                    str += '; expires=' + strDate.toUTCString();
                }
                if (cookie.httpOnly) {
                    str += '; httpOnly';
                }
                if (cookie.secure) {
                    str += '; secure';
                }
                cookieStrings.push(str);
            }

            var msgCookies = {
                type: 'COOKIES',
                url: url,
                cookies: cookieStrings
            }

            NativeHost.sendMessage(msgCookies);
            fnFinished();
        });
    },

    finalInit: function() {
        // Supply the options
        this.sendOptions();

        // Listen for host messages
        NativeHost.addListener(function(msg, fnResponse) {
            this.onNativeMessage(msg, fnResponse);
        }.bind(this));

        // Listen for activation changes which the helpers uses to hide/show the host window
        chrome.tabs.onActivated.addListener(function(activeInfo) {
            if (activeInfo.windowId != this.windowId) {
                return;
            }

            if (activeInfo.tabId != this.tabId) {
                NativeHost.postMessage({ type: 'TABDEACTIVATED' });
            } else {
                if (!this.isAttached) {
                    // We have to attach first
                    this.tryAttach();
                } else {
                    NativeHost.postMessage({ type: 'TABACTIVATED' });
                }
            }
        }.bind(this));

        // Tell the helper when we are detached so it can hide the window
        chrome.tabs.onDetached.addListener(function(tabId, detachInfo) {
            console.log('onDetached: ' + tabId);
            if (tabId != this.tabId) {
                return;
            }
            this.windowId = null;
            this.isAttached = false;
            console.log("Detached");
            NativeHost.postMessage({ type: 'DETACH' });
        }.bind(this));

        // Tell the helper to re-attach to the new tab
        chrome.tabs.onAttached.addListener(function(tabId, attachInfo) {
            if (tabId != this.tabId) {
                return;
            }
            this.windowId = attachInfo.newWindowId;
            console.log('onAttached: ' + tabId);
            this.tryAttach();
        }.bind(this));

        window.onresize = this.handleResize.bind(this);
        // Handle focus change like resize.  We need this to fix the Z-Order on window restore, otherwise
        // the IE Tab window will end up behind the hidden hack RenderWidgetHostHWND and will be inactive.
        window.addEventListener('focus', function() {
            this.handleResize();
        }.bind(this), false);

        window.onhashchange = function() {
            var url = this.extractChildUrl();

            // Always update the IE Tab address bar on a hash change
            this.updateAddressBar();
            this.navigateHost(url);
        }.bind(this);

        // Attach the host control to this window
        this.tryAttach();

        this.updateAddressBar();
        if (!this.isPopup()) {
            this.navigateHost(this.extractChildUrl());
        }
    },

    initCurrentTab: function(fnContinue) {
        chrome.tabs.getCurrent(function(tab) {
            this.tabId = tab.id;
            this.windowId = tab.windowId;
            fnContinue();
        }.bind(this));
    },

    initNativeHost: function(fnContinue) {
        // Popups connect to the existing port
        if (this.popupInfo) {
            NativeHost.connectExisting(this.popupInfo.port);
            // Include the popup's host window id with all requests
            NativeHost.setIncludeWithAll({ hostWindowId: this.popupInfo.hostWindowId });
            fnContinue();
            return;
        }

        // Normal window connection
        NativeHost.connect(function(result) {
            if (result == 'OK') {
                NativeHost.sendMessage({ type: 'INITREGISTRY' });
                // If we have never initialized the registry, then re-connect
                if (!IETAB.Storage.get('regInitialized3')) {
                    IETAB.Storage.set('regInitialized3', true);
                    this.initNativeHost(fnContinue);
                    return;
                } else {
                    fnContinue();
                }
            } else {
                var childUrl = this.extractChildUrl();
                var chromeVersion = { major: parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10) };
                var infoUrl = '/nativehostrequired.html#url=' + childUrl;
                if (chromeVersion.major < 34) {
                    infoUrl = '/nativehostrequired_msi.html#url=' + childUrl;
                }
                window.top.location = infoUrl;

            }
        }.bind(this));
    },

    getPopupId: function() {
        var regex = /[^#]*#p=([^&]*)/;
        var match = document.location.href.match(regex);
        return match ? match[1] : null;
    },

    isPopup: function() {
        return !!this.getPopupId();
    },

    //
    // We have to wait for information about this popup from our Creator.  Tab is Great!
    //
    popupInit: function(fnCallback) {
        var popupId = this.getPopupId();
        if (popupId) {
            this.popupInfo = Background.popupInfo[popupId];
            this.hostWindowId = this.popupInfo.hostWindowId;
            delete Background.popupInfo[popupId];
        }
        fnCallback();
    },

    isPlatformSupported: function() {
        return (window.navigator.platform.toLowerCase().indexOf('win') == 0);
    },

    dealWithUnsupportedPlatform: function() {
        var url = 'http://www.ietab.net/notsupported';
        // Uninstall if it is less than 10 minutes old.  This takes care of uninstalling for recent
        // installs, but it doesn't uninstall for users who may inadvertently click the button
        // while on an unsupported platform (which uninstalls across all sync'd devices).
        var firstSeen = IETAB.Storage.get("firstSeen");
        if (firstSeen) {
            var age = (new Date()).getTime() - firstSeen;
            age = age / (1000 * 60);
            if (age < 10) {
                Background.uninstallSelf();
                url += '?uninstalled=1';
            }
        }
        window.top.location = url;
    },

    getDayString: function(time) {
        var date = new Date(time);
        return date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
    },

    didShowReminderToday: function() {
        var lastShown = IETAB.Storage.get('ab-regtest-lastshown');
        if (!lastShown) {
            return false;
        }
        var lastDay = this.getDayString(lastShown);

        var now = (new Date()).getTime();
        var thisDay = this.getDayString(now);

        return (thisDay == lastDay);
    },

    shouldShowRegReminder: function() {
        // Only show a reg reminder if they are in the regtest
        if (!IETAB.Storage.get('ab-regtest-1'))
            return false;

        // No reg reminder for users with a license of course!
        var key = Settings.get('license-key');
        if (key)
            return false;

        // Don't show a reg-reminder for 30 days.
        var now = (new Date()).getTime();
        var firstSeen = IETAB.Storage.get('firstSeen');
        if ( (now - firstSeen) < this.ONE_DAY_MS * 30)
            return false;

        // Finally, only show it if we didn't show one yet today
        return !this.didShowReminderToday();
    },

    shouldShowRegReminder3: function() {
        // Only show a reg reminder if they are in the regtest
        if (!IETAB.Storage.get('ab-regtest-3'))
            return false;

        // No reg reminder for users with a license of course!
        var key = Settings.get('license-key');
        if (key)
            return false;

        // If we've shown it 8 times, then we need to keep showing it because it is disabled
        // until they get a license
        var nShown = IETAB.Storage.get('ab-regtest-3-regcount');
        if (nShown > 7)
            return true;

        // If less than 8 times, then just show it once per day
        return !this.didShowReminderToday();
    },

    initRegReminder: function(testIndex) {
        // Update last-shown
        var now = (new Date()).getTime();
        IETAB.Storage.set('ab-regtest-lastshown', now);

        var strCount = 'ab-regtest-' + testIndex + '-regcount';
        // Update shown count
        var n = IETAB.Storage.get(strCount);
        if (!n) n = 0;
        n++;
        IETAB.Storage.set(strCount, n);

        // Set the count as a cookie on ietab.net
        var cookieExpire = now + (1000 * 3600 * 24 * 30 * 12);  // Expires in 12 months
        // Convert expiration to seconds
        cookieExpire = cookieExpire / 1000;
        chrome.cookies.set({
            url: 'http://www.ietab.net/',
            name: strCount,
            value: n.toString(),
            domain: '.ietab.net',
            expirationDate: cookieExpire
        });

        var nShown = IETAB.Storage.get('ab-regtest-3-regcount');
        var nRemaining = 8;
        if (nShown)
          nRemaining = nRemaining - nShown;

        var disableIETab = false;
        if (testIndex == 1) {
            $('#reg-reminder-1').css('display', 'block');
        } else if (testIndex == 3) {
            $('#reg-reminder-gpo').css('display', 'block');
            $('#stop-working').text(nRemaining + ((nRemaining >1) ? ' days' : ' day'));
            if (nRemaining <= 0) {
                disableIETab = true;
                $('.reg-reminder-header').text('IE Tab License Expired');
                $('.remind-later').css('display', 'none');
            }
        }
        $('.buy-now').click(function() {
            if (!disableIETab)
                this.initNormal();
        }.bind(this));
        $('.remind-later').click(function() {
            chrome.tabs.create({ url: 'http://www.ietab.net/pricing?fr=reglater', active: false });
            if (!disableIETab)
                this.initNormal();
        }.bind(this));
    },

    initNormal: function() {
        $('#reg-reminder2').css('display', 'none');

        if (!this.isPlatformSupported()) {
            this.dealWithUnsupportedPlatform();
            return;
        }

        var chromeVersion = { major: parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10) };
        if (chromeVersion.major < 29) {
            window.top.location = '/chrome-too-old.html';
            return;
        }

        this.hideAddressBar = Settings.get('hide-addr-bar');
        // Hide the address bar before we do other initialization to avoid flicker
        if (this.hideAddressBar) {
            $('#address-bar').css('display', 'none');
            $('#no-address-bar-anchor').css('display', 'block');
        }

        this.setTitle(this.extractChildUrl());

        this.popupInit(function() {
            this.initNativeHost(function() {
                this.initCurrentTab(function() {
                    this.initHostWindow(function() {
                        this.sendCookies(this.extractChildUrl(), function() {
                            this.finalInit();
                        }.bind(this));
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        }.bind(this));
    },

    sendEval: function(context, cmd) {
        var msg = {
            type: 'DO_EVAL',
            context: context,
            cmd: cmd
        }
        NativeHost.sendMessage(msg);
    },

    useFavicon: function() {
        if (!Settings.get('favicon'))
            return false;

        var helperVersion = Settings.get('helper-version');
        return (Utils.dotVersionCompare(helperVersion, '9.7.12.1') >= 0);
    },

    updateFavicon: function(newFavicon) {
        if (!this.useFavicon())
            return;

        if(this.lastFavicon == newFavicon)
            return;
        this.lastFavicon = newFavicon;

        // First, change to a blank one because if the new one doesn't exist then
        // Chrome will keep the previous one.  This way we get a blank one in the case
        // where one doesn't exist.
        favicon.change('images/default_favicon.ico');
        window.setTimeout(function() {
            // We use a timeout because on some versions of Chrome, the default favicon
            // doesn't stick if it isn't around long enough before changing it.
            favicon.change(newFavicon);
        }, 200);
    },

    initCommandSupport: function() {
        window.ie = {
            eval: function(cmd) {
                this.sendEval('IE', cmd);
            }.bind(this)
        }
        window.iec = {
            eval: function(cmd) {
                this.sendEval('IEC', cmd);
            }.bind(this)
        }
    },

    showLoadingFavicon: function() {
        if (!this.useFavicon())
            return false;

        this.lastFavicon = null;
        favicon.animate([
            "images/loading/image1.gif", "images/loading/image2.gif",
            "images/loading/image3.gif", "images/loading/image4.gif",
            "images/loading/image5.gif", "images/loading/image6.gif",
            "images/loading/image7.gif", "images/loading/image8.gif"
        ], 400);
    },

    init: function() {
        this.showLoadingFavicon();

        this.BW = chrome.extension.getBackgroundPage();
        window.Background = this.BW.Background;
        window.Settings = this.BW.Settings;

        this.initCommandSupport();

        chrome.runtime.onMessage.addListener(function(message) {
            switch(message.type) {
                case 'AUTH_REQUESTED':
                    NativeHost.postMessage({ type: 'TABDEACTIVATED' });
                    break;
                case 'DUMP_PROCESS':
                    var msg = { type: 'DUMP_SINGLE_PROCESS' };
                    msg.url = $('#address-box').val();
                    msg.processId = NativeHost.getProcessId();
                    chrome.runtime.sendMessage(msg);
                    break;
            }
        }.bind(this));

        chrome.runtime.onMessageExternal.addListener(function(message, sender) {
            if (sender && sender.id) {
                NativeHost.postMessage({ type: 'MESSAGE_EXTERNAL', sender: sender.id, message: JSON.stringify(message) });
            }
        }.bind(this));

        if (this.shouldShowRegReminder()) {
            this.initRegReminder(1);
        } else if (this.shouldShowRegReminder3()) {
            this.initRegReminder(3);
        } else {
            this.initNormal();
        }
    }
}

window.onload = function() {
    NativeHostContainer.init();
}
