var async = require('async');
var config = require('nconf');
var debug = require('debug')('scraperbike');
var moment = require('moment');
var Pageload = require('./pageload.js');
var phantom = require('node-phantom');
var ical = require('ical-generator');

config.file({ file: 'config.json' }).env().argv();

var page, pageload;

exports.fire = function() {
    var self = this;
    var ph;
    var phantomConfig = {
        'ignore-ssl-errors': 'yes',
        'load-images': 'yes',
        'web-security': 'yes',
        'ssl-protocol': 'any',
        'phantomPath': require('phantomjs').path
    };

    async.waterfall([
        function(callback) {
            debug('creating phantom');
            phantom.create(callback, phantomConfig); //--> err, ph
        },
        function(_ph, callback){
            ph = _ph;
            debug('creating page');
            ph.createPage(callback); //--> err, page
        },
        function(_page, callback){
            page = _page;
            pageload = new Pageload(_page);
            debug('setting user agent');
            //? why Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/534.34 (KHTML, like Gecko) PhantomJS/1.9.0 (development) Safari/534.34
            page.set('settings.userAgent', config.get('userAgent'), callback);
        },
        function(callback) {
            debug('setting viewport');
            page.setViewport({width:1200, height: 900}, callback);
        },
        function(callback) {
            debug('loading OWA');
            page.open(config.get('url'), callback); //--> status
        },
        function(status, callback) {
            debug('injeting jquery');
            page.includeJs(config.get('jQueryAddress'), callback);
        },
        function(callback){
            debug('logging in');
            page.evaluate( function(username, password) {
                $('input[name="username"]').val(username);
                $('input[name="password"]').val(password);
                $('.signinbutton').click();
                return;
            }, callback, config.get('username'), config.get('password')); //--> result
        },
        function(result, callback) {
            pageload.afterNextPageLoad(callback);
        },
        function(callback) {
            debug('injeting jquery');
            page.includeJs(config.get('jQueryAddress'), callback);
        },
        function(callback) {
            debug('loading calendar view');
            page.evaluate( function(){
                $('#lnkNavCal').click();
                return;
            // onClkPN(1);
            }, callback); //--> result
        },
        function(result, callback) {
            pageload.afterNextPageLoad(callback);
        },
        function(callback) {
            // cycle through next # days, each one grab event days, times, titles and locations for the calendar
            async.timesSeries(config.get('days'), function(i, next){
                self.scrapeDay(i, function(err, result){
                    next(err, result);
                });
            }, callback);
        }
        // function(callback) {
        //     debug('taking screenshot');
        //     page.render('img.png', callback);
        // }


    ], function (err, result) {
        var mergedList = [].concat.apply([], result);
        console.log('completed', mergedList);
        self.write(mergedList);
        ph.exit();
    });
};

exports.scrapeDay = function(id, callback) {
    async.waterfall([
        function(next) {
            debug('injeting jquery');
            page.includeJs(config.get('jQueryAddress'), next);
        },
        function(next){
            debug('scraping page events');
            var last = config.get('days') == id +1;
            page.evaluate( function(lastIteration) {
                $.urlParam = function(name) {
                    var results = new RegExp('[\?&amp;]' + name + '=([^&amp;#]*)').exec(window.location.href);
                    return results ? results[1] || '' : '';
                };

                var events = [];
                var y = $.urlParam('yr');
                var m = $.urlParam('mn');
                var d = $.urlParam('dy');
                $.each($('table.cdayvw tr table tr h1 a'), function(i, e){
                    var elem = $(e);
                    var details = "";
                    var findDetails = elem.parent().parent().find('h1')[0];
                    if(findDetails.nextSibling !== null){
                        if(findDetails.nextSibling.outerHTML == '<br>'){
                            details = findDetails.nextSibling.nextSibling.nodeValue;
                        }else{
                            details = findDetails.nextSibling.nodeValue;
                        }
                    }
                    var start = elem.attr('title').split(' - ').shift();
                    var end = elem.attr('title').split(' - ')[1].split(' ,').shift();
                    var location = "";
                    if(details.match(';') !== null){
                        if(details.split('; ')[0].length == 0){
                            location = details.split('; ').pop();
                        }else{
                            location = details.split('; ').shift();
                        }
                    }

                    events.push({
                        startDate: m + '-' + d + '-' + y + ' ' + start,
                        endDate: m + '-' + d + '-' + y + ' ' + end,
                        title: elem.html(),
                        location: location
                    });
                });
                if(!lastIteration){
                    $('a[title="Next Day"]').click();
                }else{
                    $('#lo').click();
                }

                return events;
            }, function(err, result){
                console.log(result);
                next(null, result);
            }, last ); //--> result
        },
        function(result, next) {
            pageload.afterNextPageLoad(function(){
                next(null, result);
            });
        }
    ], callback);

};

exports.write = function(events){
    var cal = ical({
        domain: require('os').hostname(),
        prodId: '//thisispete.com//Scraperbike//EN',
        name: config.get('publishTitle'),
        timezone: 'America/Los_Angeles'
    });
    var mask = 'MM-DD-YYYY HH:mm A'
    events.forEach(function(e, i){
        cal.createEvent({
            start: moment(e.startDate, mask).toDate(),
            end: moment(e.endDate, mask).toDate(),
            summary: e.title,
            location: e.location
        });
        var m = moment(e.startDate, mask)
        // console.log(moment(e.startDate, mask).toDate())
    });
    cal.save('calendar.ics');

};
