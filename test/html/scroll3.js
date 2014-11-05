/**
 * Created by perry on 10/28/14.
 * Inspired by Aria Hidayat http://java.dzone.com/articles/javascript-kinetic-scrolling-0
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
  self.iterator = 0;
  self.delta = 0;

  element.on('touchmove scroll', onScroll);

  if(ionic.Platform.isIOS()){
    //if(ionic.Platform.version() < 8 || ionic.Platform.isWebView()){
      self.virtualScrollEventsRequired = true;
      element.on('touchend', scrollPolyfill);
      element.on('touchmove', updateVelocity);
      console.log('binding scrollPolyfill');
    //}
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
      v = 1000 * self.delta / (1 + self.elapsed);
      self.velocity = 0.8 * v + 0.4 * self.velocity;
      console.log(self.velocity, self.delta, self.elapsed)
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
    //console.log(self.velocity);
    self.startVelocity = self.delta/self.elapsed;
    self.startScrollTop  = node.scrollTop;
    if (self.velocity > 10 || self.velocity < -10) {
      self.amplitude = 0.8 * velocity;
      self.target = Math.round(node.scrollTop + self.amplitude);
      self.timestamp = Date.now();
      requestAnimationFrame(scrollPolyfillLoop);
    }
  }


  function scrollPolyfillLoop() {
    //console.log(self.amplitude);
    if (!!self.amplitude) {
      elapsed = Date.now() - self.timestamp;
      delta = -self.amplitude * Math.exp(-elapsed / self.timeConstant);
      if (delta > 1 || delta < -1) {
        requestAnimationFrame(scrollPolyfillLoop);
      } else {
        //console.log(target);

        //console.log(self.startDecelerationData);
        console.log('travelled: ', node.scrollTop - self.startScrollTop);
      }
    }
  }

  function updateVelocity(e){
      var time = +now();
      self.elapsed = time - self.timestamp;
      self.timestamp = time;
      self.delta = e.touches[0].screenX - self.frame;
      self.frame = e.touches[0].screenX;
  }

}

