
//borrowed / inspired / modified from nightmare.js

var debug = require('debug')('pageload');


module.exports = Pageload;

function Pageload (phantomPage) {
    this.page = phantomPage;

    // this.page.onLoadFinished = function(status) {
    //   console.log(status);
    // };
    // this.page.onResourceReceived = function(response) {
    //     if (response.stage !== "end") return;
    //     console.log('#');
    // };
    // this.page.onLoadStarted = function() {
    //     console.log('Load Started');
    // };
}



Pageload.prototype.until = function(check, timeout, interval, callback) {
  var start = Date.now();
  var checker = setInterval(function() {
    var diff = Date.now() - start;
    check(function(result){
      if(result || diff > timeout){
        clearInterval(checker);
        callback(result);
      }
    });
  }, interval);
};


Pageload.prototype.afterNextPageLoad = function(callback) {
  var self = this;
  var isUnloaded = function(next) {
    self.page.evaluate(function () {
      return document.readyState;
    }, function (err, result) {
      // debug('1', result);
      next(result !== "complete");
    });
  };
  var isLoaded = function(next) {
    self.page.evaluate(function () {
      return document.readyState;
    }, function (err, result) {
      // debug(result);
      next(result === "complete");
    });
  };
  this.until(isUnloaded, 8000, 50, function() {
    debug('detected page unload');
    self.until(isLoaded, 8000, 50, function() {
      debug('detected page load');
      callback();
    });
  });
};