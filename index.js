#!/usr/bin/env node

var express = require('express');
var app = express();
var config = require('nconf');
var phantom= require('node-phantom');


config.file({ file: 'config.json' }).env().argv();

var DEFAULTS = {
  'ignore-ssl-errors': 'yes',
  'load-images': 'no',
  'web-security': 'yes',
  'ssl-protocol': 'any',
  'phantomPath': require('phantomjs').path
};


phantom.create(function(err,ph) {
  return ph.createPage(function(err,page) {
    console.log('created page');
    return page.open(config.get('url'), function(err,status) {
      console.log("opened site? ", status);
      page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function(err) {
        //jQuery Loaded.
        //Wait for a bit for AJAX content to load on the page. Here, we are waiting 5 seconds.
        setTimeout(function() {
          return page.evaluate(function() {
          //Get what you want from the page using jQuery. A good way is to populate an object with all the jQuery commands that you need and then return the object.
            return $(window);
          }, function(err,result) {
            console.log(result);
            ph.exit();
          });
        }, 500);
      });
    });
  });
}, DEFAULTS);











// nightmare sadness

// var opts = {
//     loadImages: false,
//     sslProtocol: 'sslv2'
// };

// new Nightmare(opts)
//     .viewport(1024, 768)
//     .goto(config.get('url'))
//     .type('input[name="username"]', config.get('username'))
//     .type('input[name="password"]', config.get('password'))
//     .click('.signinbutton')
//     .wait()
//     // .inject('js', 'libs/jquery.min.js')
//     // .run(function (err, nightmare){
//         // nightmare.page.includeJs('https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js');
//         // console.log($);
//         // nightmare.page.evaluate(function() {
//         //     console.log($);
//         // });

//         // jQuery('.o365buttonLabel:contains(Calendar):first').parent().click();
//         // nightmare.wait()
//         .screenshot('img.png')
//         .run(function (err, nightmare) {
//             if (err) return console.log(err);
//             console.log('Done!');
//         });
//     // });







// var port = process.env.PORT || 5000;

// app.listen(port, function() {
//   console.log("Listening on " + port);
// });