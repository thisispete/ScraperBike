#!/usr/bin/env node

var express = require('express');
var later = require('later');
var app = express();
var scraperbike = require('./src/scraperbike.js');


//every 20 minutes on weekdays between 8am and 7pm fire a scrape
later.date.localTime();
var sched = later.parse.recur().every(20).minute().after(8).hour().before(19).hour().onWeekday();
later.setInterval(scraperbike.fire, sched);

scraperbike.fire();

app.get("/calendar", function(req, res){
  res.header('Content-Type', 'text/calendar; charset=utf-8');
  res.sendFile(__dirname + '/calendar.ics');
});

var port = process.env.PORT || 5000;
app.listen(port);
