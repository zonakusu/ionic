/**
 * Created by perry on 10/28/14.
 */
function initScrollPolyfill(element){
  var isScrolling;
  var lastScrollPos;
  var scrollParent = element.getParentOrSelfWithClass('scroll');
  var activePolyfillEnabled = false; // TODO: make this configurable
  var eventBubbles = false; // TODO: make this configurable
  element.on('scroll touchmove', function(){
    if(!isScrolling && activePolyfillEnabled){
      isScrolling = true;
      ionic.util.requestAnimationFrame(loopScrollEvent);
      var eventObj = {
        target:element,
        scrollParent:scrollParent
      };
      ionic.trigger('$scrollStart',eventObj, eventBubbles)
    }
    ionic.trigger('$scroll',{target:element}, eventBubbles);
    lastScrollingPos = scrollParent.scrollTop;
  })
}
