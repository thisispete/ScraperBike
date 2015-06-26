#!/usr/bin/env node

var express = require('express');
var app = express();

var config = require('nconf');
var Nightmare = require('nightmare');

// Setup nconf to use (in-order):
//   1. Command-line arguments
//   2. Environment variables
//   3. config.json
config.argv().env().file({ file: 'config.json' });


//

var opts = {
    loadImages: false,
    sslProtocol: 'sslv2'
};

new Nightmare(opts)
    .viewport(1024, 768)
    .goto(config.get('url'))
    .wait()
    .type('input[name="username"]', config.get('username'))
    .type('input[name="password"]', config.get('password'))
    .click('.signinbutton')
    .wait()
    .screenshot('img.png')
    .run(function (err, nightmare) {
      if (err) return console.log(err);
      console.log('Done!');
    });






var port = process.env.PORT || 5000;

app.listen(port, function() {
  console.log("Listening on " + port);
});