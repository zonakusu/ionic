/**
 * Created by perry on 10/28/14.
 */
var now = window.performance ?
  angular.bind(window.performance, window.performance.now) :
  Date.now;

function setupScrollPolyfill(element) {
  var scrolling = false;
  var node = element[0];
  var lastScrollTime;
  var lastScrollTop;

  element.on('touchmove scroll', onScroll);
  function onScroll() {
    lastScrollTime = +now();
    if (!scrolling) {


      element.triggerHandler({type:'$scrollstart', scrollTop:element.scrollTop});
      scrolling = true;
      scrollLoop();
    }
  }

  function scrollLoop() {
    var time = +now();
    var scrollTop = node.scrollTop;
    element.triggerHandler({type:'$scroll', scrollTop:element.scrollTop});
    if (node.scrollTop !== lastScrollTop || time - lastScrollTime < 100) {
      lastScrollTop = scrollTop;
      ionic.requestAnimationFrame(scrollLoop);
    } else {
      element.triggerHandler({type:'$scrollend', scrollTop:element.scrollTop});
      scrolling = false;
    }
  }

}

