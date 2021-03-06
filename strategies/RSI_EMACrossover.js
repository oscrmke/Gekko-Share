// Original Source: https://raw.githubusercontent.com/vrfurl/gekko/stable/strategies/EMACrossover.js
// Downloaded from: https://github.com/xFFFFF/Gekko-Strategies
// Changed EMA's to 3 and 50 periods and Added 9 Period RSI. (TC Mabe 7/11/2018)
// This strategy enters a trade when EMA-3 is above EMA-50 and RSI-9 is equal or above 60.
// This strategy exits a trade when the EMA-50 is above the EMA-3 regardless of RSI values.
// This strategy was built with 15 minutes intervals in mind.

var _ = require('lodash');
var log = require('../core/log.js');

// let's create our own method
var method = {};

// prepare everything our method needs
method.init = function() {
  this.name = 'EMACrossover';

  this.currentTrend;
  this.requiredHistory = 0;

  this.delta = this.settings.delta;

  //Determine if we first want to buy or sell
  if(this.settings.firstTrade === 'buy') {
    this.currentTrend = 'down';
  }
  else if(this.settings.firstTrade === 'sell'){
    this.currentTrend = 'up';
  }

  log.debug("Short EMA size: "+this.settings.shortSize);
  log.debug("Long EMA size: "+this.settings.longSize);

  this.addTalibIndicator('shortEMA', 'ema', {optInTimePeriod : this.settings.shortSize});
  this.addTalibIndicator('longEMA', 'ema', {optInTimePeriod : this.settings.longSize});
  this.addTalibIndicator('rsi', 'rsi', {optInTimePeriod : this.settings.rsiPeriods});

  log.debug(this.name+' Strategy initialized');

}

// what happens on every new candle?
method.update = function(candle) {
  // nothing!
}

// for debugging purposes: log the last calculated
// EMAs and diff.
method.log = function() {
  var shortEMA = this.talibIndicators.shortEMA;
  var longEMA = this.talibIndicators.longEMA;
  var rsi = this.talibIndicators.rsi; 

  log.debug('Required history is: '+this.requiredHistory);

  log.debug('calculated EMA properties for candle:');

  log.debug('\t shortEMA :', shortEMA.result);

  log.debug('\t', 'longEMA:', longEMA.result);

  log.debug('\t', 'rsi:', rsi.result);
}

method.check = function(candle) {

  var shortResult = this.talibIndicators.shortEMA.result.outReal;
  var longResult = this.talibIndicators.longEMA.result.outReal;
  var rsiResult = this.talibIndicators.rsi.result.outReal;
  var price = candle.close;

  var message = '@ ' + price.toFixed(8);


  //EMA Golden Cross
  if((shortResult - longResult) >= this.delta && rsiResult >=  this.settings.rsiHigh) {
    log.debug('we are currently in uptrend', message);

    if(this.currentTrend !== 'up') {
      this.currentTrend = 'up';
      this.advice('long');
      log.debug("Going to buy");
    } else {
      log.debug("Nothing to buy");
      this.advice();
    }

  } else if(longResult > shortResult) {
    log.debug('we are currently in a downtrend', message);

    if(this.currentTrend !== 'down') {
      this.currentTrend = 'down';
      this.advice('short');
      log.debug("Going to sell");
    } else
      log.debug("Nothing to sell");
      this.advice();

  } else {
    log.debug('we are currently not in an up or down trend', message);
    this.advice();
  }
}

module.exports = method;
