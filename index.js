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





// scraperbike.write([{
//     endDate: '7-15-2015 4:00 PM',
//     location: 'Zeitgeist',
//     organizer: 'Jason Muscat',
//     startDate: '7-15-2015 3:00 PM',
//     title: 'The Code Forum'
// },{
//     endDate: '7-15-2015 7:30 PM',
//     location: 'Lexi Steigelman',
//     organizer: 'Lexi Steigelman',
//     startDate: '7-15-2015 5:00 PM',
//     title: '[EA] E3 Team Dinner!'
// },{
//     endDate: '7-17-2015 5:30 PM',
//     location: 'Linzi Bergmann',
//     organizer: 'Linzi Bergmann',
//     startDate: '7-17-2015 2:30 PM',
//     title: 'Adventure Cat!'
// },{
//     endDate: '7-8-2015 6:00 PM',
//     location: 'Basketball Court @ Hayes &amp',
//     organizer: 'Linzi Bergmann',
//     startDate: '7-8-2015 5:00 PM',
//     title: 'Blue + Green #COLORBASH'
// },{
//     endDate: '7-9-2015 5:00 PM',
//     location: 'Zeitgeist',
//     organizer: 'Linzi Bergmann',
//     startDate: '7-9-2015 4:00 PM',
//     title: 'Team Blue Meeting'
// }]);