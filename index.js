#!/usr/bin/env node

var auth = require('http-auth');
var config = require('nconf');
var express = require('express');
var later = require('later');
var scraperbike = require('./src/scraperbike.js');


config.file({ file: 'config.json' }).env().argv();

//every 20 minutes on weekdays between 8am and 7pm fire a scrape
later.date.localTime();
var sched = later.parse.recur().every(20).minute().after(8).hour().before(19).hour().onWeekday();
later.setInterval(scraperbike.fire, sched);


var basic = auth.basic({
        realm: config.get('publishTitle')
    }, function (username, password, callback) {
        console.log(username, password);
        console.log(config.get('username'), config.get('password'));
        callback(username === config.get('username') && password === config.get('password'));
    }
);

var app = express();
app.use(auth.connect(basic));

app.get("/calendar", function(req, res){
  res.header('Content-Type', 'text/calendar; charset=utf-8');
  res.sendFile(__dirname + '/calendar.ics');
});

var port = process.env.PORT || 5000;
app.listen(port);
scraperbike.fire();
