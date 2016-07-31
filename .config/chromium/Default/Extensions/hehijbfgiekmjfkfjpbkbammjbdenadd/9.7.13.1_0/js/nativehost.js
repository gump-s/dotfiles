/*
 * nativehost.js
 *
 * Code for communicating with the native host
 *
*/
var NativeHost = {
    HOST_VERSION: '9.7.13.1',
    HOST_ID_PERUSER: 'net.ietab.ietabhelper.peruser',
    HOST_ID_PERBOX: 'net.ietab.ietabhelper.perbox',
    HOST_FILE_NAME: 'ietabhelper.exe',
    HOST_MANIFEST_FILE_NAME: 'ietab_nm_manifest.json',

    CALLBACK_TIMEOUT: 30000,
    UPGRADE_TIMEOUT:  10000,

    _port: null,
    _nextCallbackId: 1,
    _pendingCallbacks: {},
    _upgradeInProgress: false,
    _upgradeWaiters: [],
    _listeners: [],
    _includeWithAll: null,
    _processId: 0,


    /*
    *     sendMessage
    *
    *     Provides response callback functionality for message sending
     */
    sendMessage: function(msg, fnResponse) {
        if (fnResponse) {
            var callId = msg._callId = this._nextCallbackId++;
            this._pendingCallbacks[callId] = fnResponse;

            // Delete the callback entry if the callback never happens
            window.setTimeout(function() {
                if (this._pendingCallbacks[callId]) {
                    delete this._pendingCallbacks[callId];
                }
            }.bind(this), this.CALLBACK_TIMEOUT);
        }
        this.postMessage(msg);
    },

    postMessage: function(msg) {
        if (this._includeWithAll) {
            msg = $.extend(msg, this._includeWithAll);
        }
        this._port.postMessage(msg);
    },

    addListener: function(fnListener) {
        this._listeners.push(fnListener);
    },

    removeListener: function(fnListener) {
        for (var i=0; i<this._listeners.length; i++) {
            if (this._listeners[i] == fnListener) {
                this._listeners.splice(i, 1);
                break;
            }
        }
    },

    isConnected: function() {
        return !!this._port;
    },

    /*
    ** setIncludeWithAll
     *
     * Provide params that will be included with all outgoing messages
     *
    */
    setIncludeWithAll: function(params) {
        this._includeWithAll = $.extend({}, params);
    },

    _postMessageToListeners: function(msg) {
        for (var i=0; i<this._listeners.length; i++) {
            this._listeners[i](msg);
        }
    },

    // Return true if it has been handled.
    // Returns false if it should be forwarded to listeners.
    _handleNativeMessage: function(msg) {
        if (msg.type == 'DEBUG_LOG') {
            console.log('NM_LOG: ' + msg.text);
            return true;
        }
        return false;
    },

    onNativeMessage: function(msg) {
        if (msg._responseId) {
            // This was a "sendMessage" potentially with a callback, so call it.
            var fnResponse = this._pendingCallbacks[msg._responseId];
            if (!fnResponse) {
                return;
            }
            delete this._pendingCallbacks[msg._responseId];
            delete msg[msg._responseId];
            fnResponse(msg);
        } else {
            // A regular incoming message, check for internal handling, otherwise forward to listeners
            if (!this._handleNativeMessage(msg))
                this._postMessageToListeners(msg);
        }
    },

    _updateAllowedOrigins: function(manifestContent) {
        // hehijbfgiekmjfkfjpbkbammjbdenadd - Chrome Web Store release
        // knnoopddfdgdabjanjmeodpkmlhapkkl - Enterprise release at https://www.ietab.net/enterprise/update.manifest
        var origins = [
            'chrome-extension://hehijbfgiekmjfkfjpbkbammjbdenadd/',
            'chrome-extension://knnoopddfdgdabjanjmeodpkmlhapkkl/'
        ];
        var me = chrome.extension.getURL('');
        if ( (origins[0] != me) && (origins[1] != me)) {
            origins.push(me);
        }
        var cleanOrigins = JSON.stringify(origins);
        cleanOrigins = cleanOrigins.replace(/[\[\]]/g, '');
        return manifestContent.replace('ALLOWED_ORIGINS', cleanOrigins);
    },

    /*
    **  processIntallerFiles
    **
    **   Given the installer file content as Base-64 encoded and the manifest file content,
    **   this does the actual work of performing the installation
    **
    */
    _processInstallerFiles: function(legacyNPAPIObject, fileContent, manifestContent, fnResult) {
        // If they pass a legacy NPAPIObject, then just call the NPAPI installation routine.
        // This can be removed when NPAPI support has been removed from IE Tab.
        if (legacyNPAPIObject) {
            var success = true;
            try {
                legacyNPAPIObject.installHelper(this.HOST_VERSION, fileContent, manifestContent);
            } catch(ex) {
                success = false;
            }
            fnResult(success ? 'OK' : 'E_UPGRADE_FAILED');
            return;
        }

        // We have to be connected before we can do the work (be sure to pass true as the second argument
        // so we don't do another version check).
        this.connect(function(result) {
            if (result != 'OK') {
                fnResult(result);
                return;
            }

            //
            // UPGRADE responds with:
            //     OK
            //     E_UPGRADE_FAILED
            //
            this.sendMessage({
                type: 'UPGRADE',
                version: this.HOST_VERSION,
                fileContent: fileContent,
                manifestContent: manifestContent
            }, function(msgResult) {
                fnResult(msgResult.type);
            });
        }.bind(this), true);
    },

    /*
    **   upgradeHost
    *
    *    This function should only be called on the NativeHost object in the background page, otherwise
    *    we could end up with multiple times trying to perform simultaneous upgrades.
    *
    *    This function will call fnResult with one of:
    *        OK
    *        E_UPGRADE_FAILED
     */
    upgradeHost: function(fnResponse, legacyNPAPIObject) {
        var self = this;
        // Allow just one caller to upgrade at a time
        if (fnResponse) {
            this._upgradeWaiters.push(fnResponse);
        }
        if (this._upgradeInProgress) {
            return;
        }
        this._upgradeInProgress = true;

        var failTimeout = window.setTimeout(function() {
            fnSendResult('E_UPGRADE_FAILED');
        }, this.UPGRADE_TIMEOUT);

        // When finished, send the result to all waiting callers
        var fnSendResult = function(result) {
            window.clearTimeout(failTimeout);

            self._upgradeInProgress = false;
            for (var i=0; i < self._upgradeWaiters.length; i++) {
                self._upgradeWaiters[i](result);
            }
            self._upgradeWaiters = [];
        };

        // Get the host file content as base64
        Utils.getFileContent(this.HOST_FILE_NAME, true, function(content) {
            var fileContent = content;
            // Get the manifest file content
            Utils.getFileContent(this.HOST_MANIFEST_FILE_NAME, false, function(content) {
                var manifestContent = this._updateAllowedOrigins(content);

                // Do the installer work
                this._processInstallerFiles(legacyNPAPIObject, fileContent, manifestContent, fnSendResult);

            }.bind(this));
        }.bind(this));
    },

    /*
    **    NPAPIInstall
    *
    *     Use the NPAPI object to perform the initial installation of the native host.
    *
    *     Calls thei
    *        OK
    *        E_UPGRADE_FAILED
     */

    NPAPIInstall: function(ieObject, fnResponse) {
        this.upgradeHost(fnResponse, ieObject);
    },


    /*
    **  checkVersion
    *
    *   This function will call fnResult with one of:
    *       OK
    *       E_UPGRADE_FAILED
    *       E_VERSION_MIN_FAILED
    */
    checkVersion:  function(fnResult) {
        // CHECK_VERSION msg will respond with:
        //
        //    OK
        //    E_VERSION_MIN_FAILED    -- The extension version is too small for the host version
        //    UPGRADE_HOST            -- The host version is smaller than the extension's host version, initiate upgrade
        //
        this.sendMessage({
            type: 'CHECK_VERSION',
            extVersion: chrome.runtime.getManifest().version,
            hostVersion: this.HOST_VERSION
        }, function(msgResult) {
            if (msgResult.type == 'UPGRADE_HOST') {
                this.upgradeHost(function(result) {
                    if (result == 'OK') {
                        // Re-connect to the new host
                        this.connect(fnResult);
                    } else {
                        fnResult(result);
                    }
                }.bind(this));
            } else {
                // Either OK or E_VERSION_MIN_FAILED
                fnResult(msgResult.type);
            }
        }.bind(this));
    },

    getProcessId: function() {
        return this._processId;
    },

    /*
     *    tryConnectHost
     *
     *    Try to connect to the native host with the specified hostId.  It connects the port
     *    and sends an initial PING to confirm receipt.
     *    Possible response values:
     *
     *       OK
     *       E_NO_NATIVE_HOST      -- Could not connect to native host
     */
    _tryConnectHost: function(hostId, fnResponse) {
        var reportedBack = false;
        this.disconnect();

        var fnSafeResponse = function(result) {
            // Avoid re-entrancy if onDisconnect happens at the same time as we are
            // sending E_NO_NATIVE_HOST
            if (result != 'OK') {
                this._port = null;
            }
            if (reportedBack) {
                return;
            }
            reportedBack = true;
            fnResponse(result);
        }.bind(this);

        var fnDisconnect = function() {
            // We have to listen for onDisconnect if the host is missing
            fnSafeResponse('E_NO_NATIVE_HOST');
        }.bind(this);

        try {
            this._port = Background.connectNative(hostId);
            this._port.refCount = 1;
            this._port.onDisconnect.addListener(fnDisconnect);
        } catch(ex) {
            fnSafeResponse('E_NO_NATIVE_HOST');
            return;
        }

        // Start listening for messages
        this._port.onMessage.addListener(function(msg) {
            this.onNativeMessage(msg);
        }.bind(this));

        this.sendMessage({ type: 'PING' }, function(msg) {
            this._port.onDisconnect.removeListener(fnDisconnect);
            this._port.onDisconnect.addListener(function() {
                this._port = null;
            }.bind(this));
            if (msg && (msg.type == 'PONG')) {
                this._processId = msg.processId;
                fnSafeResponse('OK');
            } else {
                fnSafeResponse('E_NO_NATIVE_HOST');
            }
        }.bind(this));
    },

    _finishConnect: function(fnResponse) {
        // Listen for disconnects.
        this._port.onDisconnect.addListener(function() {
            this._port = null;
            this._postMessageToListeners({ type: '_DISCONNECTED' });
        }.bind(this));
    },

    /*
    *    connect
    *
    *    connect to the native host.  This will also perform a version check and a host upgrade if necessary
    *    Possible response values:
    *
    *       OK
    *       E_NO_NATIVE_HOST      -- Could not connect to native host
    */
    connect: function(fnResponse) {

        // Try the per-user host
        this._tryConnectHost(this.HOST_ID_PERUSER, function(result) {
            if (result == 'OK') {
                this._finishConnect();
                fnResponse('OK');
                return;
            }
            // Try the per-box host
            this._tryConnectHost(this.HOST_ID_PERBOX, function(result) {
                if (result == 'OK') {
                    this._finishConnect();
                    fnResponse('OK');
                    return;
                }
                fnResponse('E_NO_NATIVE_HOST');
            }.bind(this));
        }.bind(this));
    },

    connectExisting: function(port) {
        this._port = port;
        port.refCount++;
        this._port.onMessage.addListener(function(msg) {
            this.onNativeMessage(msg);
        }.bind(this));
    },

    testForHost: function(fnResult) {
        this.connect(function(result) {
            this.disconnect();
            fnResult(result == 'OK');
        }.bind(this), true);  // Skip the version check
    },

    disconnect: function() {
        if (this._port) {
            try { this._port.disconnect(); } catch(ex) {}
            this._port = null;
        }
    },

    _init: function() {
        this.BW = chrome.extension.getBackgroundPage();
        window.Background = this.BW.Background;
        window.Settings = this.BW.Settings;
        window.addEventListener('unload', function() {
            // Tell the native host to close this browser window
            if (this._port && this._port.refCount)
                this._port.refCount--;
            if (!this._port.refCount)
                this.disconnect();
            this.sendMessage({ type: 'PAGE_UNLOADED' });
        }.bind(this), true);
    }
}

NativeHost._init();