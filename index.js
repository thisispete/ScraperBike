#!/usr/bin/env node

var async = require('async');
var config = require('nconf');
var debug = require('debug')('scraperbike');
var express = require('express');
var moment = require('moment');
var Pageload = require('./util/pageload.js');
var phantom = require('node-phantom');

config.file({ file: 'config.json' }).env().argv();

var app = express();
var ph, page, pageload;

var phantomConfig = {
    'ignore-ssl-errors': 'yes',
    'load-images': 'yes',
    'web-security': 'yes',
    'ssl-protocol': 'any',
    'phantomPath': require('phantomjs').path
};


var scrapeDay = function(id, callback) {
    async.waterfall([
        function(next) {
            debug('injeting jquery');
            page.includeJs(config.get('jQueryAddress'), next);
        },
        function(next){
            debug('scraping page events');
            page.evaluate( function() {
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
                    var details = elem.parent().parent().html().split('<br>').pop();
                    var start = elem.attr('title').split(' - ').shift();
                    var end = elem.attr('title').split(' - ')[1].split(' ,').shift();

                    events.push({
                        startDate: m + '-' + d + '-' + y + ' ' + start,
                        endDate: m + '-' + d + '-' + y + ' ' + end,
                        title: elem.html(),
                        location: details.split('; ').shift(),
                        organizer: details.split('; ').pop()
                    });
                });
                $('a[title="Next Day"]').click();

                return events;
            }, function(err, result){
            console.log(result);
                next(null, result);
            }); //--> result
        },
        function(result, next) {
            pageload.afterNextPageLoad(function(){
                next(null, result);
            });
        }
    ], callback);



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
            scrapeDay(i, function(err, result){
                next(err, result);
            });
        }, callback);
    }
    // function(callback) {
    //     debug('taking screenshot');
    //     page.render('img.png', callback);
    // }


], function (err, result) {
    console.log('completed', result);
    ph.exit();
});


//'YYYY-MM-DD HH:mm A'

//$('a[title="Next Day"]').click();

// var port = process.env.PORT || 5000;

// app.listen(port, function() {
//   console.log("Listening on " + port);
// });