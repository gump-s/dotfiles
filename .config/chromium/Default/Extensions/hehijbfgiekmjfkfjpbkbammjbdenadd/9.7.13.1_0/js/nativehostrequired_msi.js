
var NativeHostRequired = {
    init: function() {
        this.BW = chrome.extension.getBackgroundPage();
        window.Background = this.BW.Background;

        // Poll every 5 seconds for the native host to be available
        var theInterval = window.setInterval(function() {
            NativeHost.connect(function(result) {
                if (result == 'OK') {
                    // Hey, it's installed, redirect to the container page
                    window.clearInterval(theInterval);
                    var url = document.location.href.match(/#url=(.*)/)[1];
                    document.location.href = window.Background.getNativeHostContainer(url);
                }
            });
        }.bind(this), 5000);

    }
}

window.onload = function() {
    NativeHostRequired.init();
}
