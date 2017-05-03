// http://docs.casperjs.org/en/latest/writing_modules.html
// http://docs.casperjs.org/en/latest/extending.html

casper.userAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:23.0) Gecko/20130404 Firefox/23.0");
casper.options.viewportSize = { width: 1024, height: 768 };

casper.options.onResourceRequested = function(casper, requestData, request) {
    var skip = [
        'googleads.g.doubleclick.net',
        'cm.g.doubleclick.net',
        'www.googleadservices.com',
        'xiti.js',
        'tracking',
        'omnitagjs.com',
        'cedexis.com',
        'smartadserver',
        'weborama',
        'rlcdn.com',
        'rubiconproject.com',
        'gwallet.com',
        'adnxs.com',
        'crm4d.com',
        'tidaltv.com',
        'criteo.com',
        'mathtag.com',
        'yahoo.com',
        'amazon-adsystem.com',
        'teads.tv',
        'mookie1.com',
        'adform.net',
        'bidswitch.net',
        'nativeads.com',
        'stickyadstv.com',
        'adlooxtracking.com',
        'adotmob.com',
        'turn.com',
        'powerlinks.com',
        'wayfair.com',
        'w55c.net',
        'casalemedia.com',
        'tiqcdn.com',
        'schibsted.com'
    ];
    // jpe?g needed here
    //if (/\.(?:css|png|gif|svg|ttf)(?:;|$)/i.test(requestData.url)) {
    //    console.log("blocked url " + requestData.url);
    //    request.abort();
    //}
    skip.forEach(function(needle) {
        if (requestData.url.indexOf(needle) > 0) {
            debug && console.log("blocked url " + requestData.url);
            request.abort();
        }
    })
}

// debug in case of error (need to use try {} catch(e) { }
// for an evaluate (TODO override casper.evaluate)
casper.on('error', function(msg, backtrace) {
    console.log('backtrace: ' + JSON.stringify(backtrace, null, 4));
    console.log('message: ' + JSON.stringify(msg, null, 4));
    console.log('check capture in /tmp/error.png');
    this.capture('/tmp/error.png');
})

if (debug) {
    // debug evaluate
    casper.on("page.error", function(msg, trace) {
        console.log('\033[1;31m' + 'Page error: ' + msg + '\033[0m');
        throw ''; // trigger onError

    });

    casper.on('resource.error', function(resourceError, trace) {
        console.log('\033[1;31m' + 'Error (#' + resourceError.id + '): URL: ' + request.url + ' || ' + resourceError.errorCode + ' || Description: ' + resourceError.errorString + '\033[0m');
    });

    casper.on('resource.timeout', function(request) {
        console.log('\033[1;33m' + 'Timeout (#' + request.id + '): ' + request.url + '\033[0m');
    });

    casper.on('resource.requested', function(request) {
        console.log('\033[0;36m' + '--> Request (#' + request.id + '): ' + request.url + '\033[0m');
    });

    casper.on('resource.received', function(response) {
        console.log('\033[1;34m' + '<-- Response (#' + response.id + '): ' + response.url + '\033[0m');
    });

    // without this, console.log doesn't work in evaluate()
    casper.on('remote.message', function(msg) {
        console.log('remote: ' + msg);
    })
}

exports.casper = casper;
