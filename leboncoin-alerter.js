// FS part
var system = require('system');
var env = system.env;
var home = env.HOME;
var path = home + '/.config/lbc'
var serialization_file = path + 'data.json'
var fs = require('fs');
fs.makeDirectory(path); // http://phantomjs.org/api/fs/
var serialization_file = path + '/data.json';
if (!fs.isFile(serialization_file) || fs.size(serialization_file) == 0)
    fs.write(serialization_file, '[ ]', 'w');
var data = require(serialization_file); 

// casper init part
var casper = require('casper').create();
var debug = casper.cli.has("verbose");
require('./casper_lib'); // add debug stuff and url filtering
var xpath = require('casper').selectXPath;

// global vars part
var idsParsed = [];
var url = casper.cli.get('url');
if (!url || !/leboncoin\.fr/.test(url)) {
    casper.echo("usage: casperjs leboncoin-alerter.js --url=http://leboncoin.fr/annonces/xxx [--verbose]");
    casper.exit(1);
}
url = decodeURI(url);

function echoOnDebug(msg) {
    if (debug === true) casper.echo(msg);
}

casper.start(url);

casper.then(function() {
    casper.waitForSelector('section#listingAds > section.list > section.tabsContent > ul > li > a > div > span', function then() {
        // good
        echoOnDebug("=> end waiting for page");
    }, function timeout() {
        echoOnDebug("=> timeout waiting for page");
        //throw 'timeout error';
    }, 8000);
})

casper.then(function(){
    var count = casper.evaluate(function() {
        return __utils__.findAll('section#listingAds > section.list > section.tabsContent > ul > li > a').length;
    })

    for (var x=1; x<=count; x++) {
        (function(x) { // IIFE, no need casper.each here
            casper.then(function() {
                var href = casper.evaluate(function(x) {
                    return __utils__.getElementByXPath('//section[@id="listingAds"]/section/section/ul/li['+x+']/a')
                    .getAttribute('href');
                }, x).replace(/^\/\//g, 'https://');

                if (href && href.length) {
                    echoOnDebug("=> Treating href: " + href);
                    var base64_url = casper.evaluate(function(href) { return __utils__.encode(href); }, href);
                    // id of the sell
                    var id = href.match(/\d+(?=\.htm)/)[0]; // regex (?=) : positive look-ahead
                    echoOnDebug("=> Treating id: " + id);

                    // is this id already parsed ?
                    var knownId = data.some(function(elt){ return elt === id; });

                    // need to fetch this one
                    if (!knownId) {
                        idsParsed.push(id);
                        var filename = '/tmp/lbc_' + base64_url + '_.png';
                        echoOnDebug("=> waiting image to complete...");
                        casper.waitUntilVisible(xpath('//section[@id="listingAds"]/section/section/ul/li['+x+']/a/div/span/img[@itemprop]'),
                        function () {
                            echoOnDebug("=> end loading image");
                        }, function timeout() {
                            echoOnDebug("=> timeout waiting for page");
                            //throw 'timeout error';
                        }, 16000);
                        echoOnDebug("=> write " + filename + " file to FS");
                        casper.captureSelector(filename, xpath('//section[@id="listingAds"]/section/section/ul/li['+x+']'));
                    }
                }
            })
        })(x);
    }

})

casper.then(function(){
    // serialization to JSON file for future comparison
    var bigArray = data.concat(idsParsed);
    fs.write(serialization_file, JSON.stringify(bigArray), 'w');
    // XXX improvment: create an object with dates and wipe stuff > n days if the JSON get too big for memory
    // or use sqlite :)
})

casper.run(function() {
    if (debug == true) {
        casper.echo("=> capture to /tmp/out.png");
        casper.capture('/tmp/out.png');
    }
    casper.exit();
})
