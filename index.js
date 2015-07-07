#!/usr/bin/env node

var basicAuth = require('basic-auth-connect');
var config = require('nconf');
var express = require('express');
var later = require('later');
var scraperbike = require('./src/scraperbike.js');

config.file({ file: 'config.json' }).env().argv();

//every 20 minutes on weekdays between 8am and 7pm fire a scrape
later.date.localTime();
var sched = later.parse.recur().every(20).minute().after(8).hour().before(19).hour().onWeekday();
later.setInterval(scraperbike.fire, sched);

scraperbike.fire();

var app = express();
app.use(basicAuth(function(u, p) {
 return u === config.get('username') && p === config.get('pasword');
}));

app.get("/calendar", function(req, res){
  res.header('Content-Type', 'text/calendar; charset=utf-8');
  res.sendFile(__dirname + '/calendar.ics');
});

var port = process.env.PORT || 5000;
app.listen(port);
