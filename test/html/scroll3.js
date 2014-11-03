/**
 * Created by perry on 10/28/14.
 */
var now = window.performance ?
  angular.bind(window.performance, window.performance.now) :
  Date.now;
function setupScrollPolyfill(element) {
  var scrolling = false;
  var node = element[0];
  var self = this;
  self.amplitude = 0;
  self.frame = 0;
  self.velocity = 0;
  self.lastScrollTime = null;
  self.lastScrollTop = null;
  self.timestamp = null;
  self.virtualScrollEventsRequired = false;
  self.timeConstant = 325; // magic number

  element.on('touchmove scroll', onScroll);

  if(ionic.Platform.isIOS()){
    if(ionic.Platform.version() < 8 || ionic.Platform.isWebView()){
      self.virtualScrollEventsRequired = true;
      element.on('touchend', scrollPolyfill);
      console.log('binding scrollPolyfill');
    }
  }

  function onScroll() {
    self.lastScrollTime = +now();
    if (!scrolling) {


      element.triggerHandler({type:'$scrollstart', scrollTop:node.scrollTop});
      scrolling = true;
      scrollLoop();
    }
  }

  function scrollLoop() {
    var time = +now();
    var scrollTop = node.scrollTop;

    if(self.virtualScrollEventsRequired){
      if(!self.velocity)self.velocity = 0;
      var elapsed, delta, v;

      elapsed = time - self.timestamp;
      self.timestamp = time;
      delta = scrollTop - self.frame;
      self.frame = scrollTop;

      v = 1000 * delta / (1 + elapsed);
      self.velocity = 0.8 * v + 0.2 * self.velocity;
    }

    element.triggerHandler({type:'$scroll', scrollTop:node.scrollTop, element:element});
    if (node.scrollTop !== self.lastScrollTop || time - self.lastScrollTime < 100) {
      self.lastScrollTop = scrollTop;
      ionic.requestAnimationFrame(scrollLoop);
    } else {
      element.triggerHandler({type:'$scrollend', scrollTop:node.scrollTop});
      scrolling = false;
    }
  }

  function scrollPolyfill() {
    console.log(self.velocity, node.scrollTop, self.amplitude);
    if (velocity > 10 || velocity < -10) {
      self.amplitude = 0.8 * velocity;
      self.target = Math.round(node.scrollTop + self.amplitude);
      self.timestamp = Date.now();
      requestAnimationFrame(scrollPolyfillLoop);
    }
  }


  function scrollPolyfillLoop() {
    var elapsed, delta;

    if (!!self.amplitude) {
      elapsed = Date.now() - self.timestamp;
      delta = -self.amplitude * Math.exp(-elapsed / self.timeConstant);
      if (delta > 0.5 || delta < -0.5) {
        console.log(self.velocity, node.scrollTop, self.amplitude);
        requestAnimationFrame(scrollPolyfillLoop);
      } else {
        console.log(target);
      }
    }
  }

}

