/**
 * Created by perry on 10/28/14.
 */
function initScrollPolyfill(element){
  var isScrolling = false;
  var lastScrollPos;
  //var scrollParent = ionic.DomUtil.getParentOrSelfWithClass(element,'scroller', 10);
  var scrollParent = document.getElementById('scroller');
  console.log(scrollParent);
  var activePolyfillEnabled = true; // TODO: make this configurable
  var eventBubbles = false; // TODO: make this configurable
  var eventObj = {
    target:element,
    scrollParent:scrollParent
  };
  ionic.on('scroll', startScroll, element);
  ionic.on('touchmove', startScroll, element);
  var debounceScrollEvents = ionic.Utils.debounce(loopScrollEvent, 100, false);

  function startScroll(){
    console.log('scroll detected', isScrolling,activePolyfillEnabled);
    if((!isScrolling) && activePolyfillEnabled){
      isScrolling = true;
      debounceScrollEvents();
      ionic.trigger('$scrollStart',eventObj, eventBubbles)
    }
    ionic.trigger('$scroll',{target:element}, eventBubbles);
    lastScrollingPos = scrollParent.scrollTop;
  }

  function loopScrollEvent() {
    console.log(lastScrollPos, scrollParent.scrollTop);
    if(lastScrollPos == scrollParent.scrollTop){
      console.log('stopping');
      isScrolling = false;
      ionic.trigger('$scrollend');
    }else{
      ionic.trigger('$scroll',{target:element}, eventBubbles);
      console.log('keep on scrolling');
      lastScrollPos = scrollParent.scrollTop;
      debounceScrollEvents();
    }
  }
}

