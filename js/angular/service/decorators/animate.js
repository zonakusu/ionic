/**
 * @private
 */
IonicModule.config([
  '$provide',
function($provide) {
  function $AnimateDecorator($animate) {

    var CSS_DIRECTIONS = 'nav-forward nav-back nav-enter nav-exit nav-swap'.split(' ');
    var CSS_VIEW_ACTIVE = 'view-active';
    var CSS_VIEW_CACHE = 'view-cache';
    var CSS_VIEW_ENTERING = 'view-entering';
    var CSS_VIEW_LEAVING = 'view-leaving';
    var CSS_ANIMATION_SUPER = 'nav-view';
    var NG_ANIMATE_PARENT_KEY = '$$ngAnimateKey';

    var usedAnimationClasses = [];
    var useAnimation = true;


    $animate.transition = function(animationClass, navDirection, enteringElement, leavingElement, callback) {
      var parentElement = enteringElement.parent();
      var shouldAnimate = $animate.shouldAnimate(animationClass, navDirection);

      $animate.stage(shouldAnimate, animationClass, navDirection, parentElement, enteringElement, leavingElement);

      $animate.start(shouldAnimate, enteringElement, leavingElement, function(){

        $animate.end(animationClass, parentElement, enteringElement, leavingElement);

        callback && callback();

      });

    };


    $animate.shouldAnimate = function(animationClass, navDirection) {
      return !!(useAnimation && navDirection && navDirection !== 'none' && animationClass && animationClass !== 'none');
    };


    $animate.stage = function(shouldAnimate, animationClass, navDirection, parentElement, enteringElement, leavingElement) {

      var x, isExistingAnimationClass;

      for(x=0; x<usedAnimationClasses.length; x++) {
        if(usedAnimationClasses[x] === animationClass && shouldAnimate) {
          isExistingAnimationClass = true;
        } else {
          parentElement.removeClass( usedAnimationClasses[x] );
        }
      }

      for(x=0; x<CSS_DIRECTIONS.length; x++) {
        if(CSS_DIRECTIONS[x] !== navDirection) {
          parentElement.removeClass( CSS_DIRECTIONS[x] );
        }
      }

      if( shouldAnimate ) {
        if(!isExistingAnimationClass) {
          usedAnimationClasses.push(animationClass);
        }

        parentElement.addClass(animationClass)
                     .addClass('nav-' + navDirection);

        // classes can change on the parent, so make sure the parent ID uses the classname
        // and not the default parent counter within $animate
        var classParentID = extractElementNode(parentElement).getAttribute('class');
        var parentID = parentElement.data(NG_ANIMATE_PARENT_KEY);
        if(parentElement !== classParentID) {
          parentElement.data(NG_ANIMATE_PARENT_KEY, classParentID);
        }
      }

      // ensure
      enteringElement.addClass(CSS_VIEW_ENTERING)
                     .removeClass(CSS_VIEW_CACHE)
                     .removeClass(CSS_ANIMATION_SUPER);

      if(leavingElement) {
          leavingElement.addClass(CSS_VIEW_LEAVING)
                        .removeClass(CSS_VIEW_CACHE)
                        .addClass(CSS_ANIMATION_SUPER);

        if( shouldAnimate ) {
          leavingElement.addClass('ng-animate');
        }
      }

    };



    $animate.start = function(shouldAnimate, enteringElement, leavingElement, callback) {

      function next() {
        next.callCount++;
        next.callCount > 1 && callback && callback();
      }
      next.callCount = 0;

      if(enteringElement && shouldAnimate) {
        $animate.addClass(enteringElement, CSS_ANIMATION_SUPER, next);
      } else {
        next();
      }

      if(leavingElement && shouldAnimate) {
        $animate.removeClass(leavingElement, CSS_ANIMATION_SUPER, next);
      } else {
        next();
      }

    };


    $animate.end = function(animationClass, parentElement, enteringElement, leavingElement) {

      if(enteringElement) {
        enteringElement.addClass(CSS_VIEW_ACTIVE)
                       .removeClass(CSS_VIEW_CACHE)
                       .removeClass(CSS_VIEW_ENTERING)
                       .removeClass(CSS_VIEW_LEAVING)
                       .addClass(CSS_ANIMATION_SUPER);
      }

      if(leavingElement) {
        leavingElement.addClass(CSS_VIEW_CACHE)
                      .removeClass(CSS_VIEW_ACTIVE)
                      .removeClass(CSS_VIEW_ENTERING)
                      .removeClass(CSS_VIEW_LEAVING);
      }

      parentElement.removeClass(animationClass);

      for(var x=0; x<CSS_DIRECTIONS.length; x++) {
        parentElement.removeClass(CSS_DIRECTIONS[x]);
      }
    };


    $animate.useAnimation = function(val) {
      if(arguments.length) {
        useAnimation = val;
      }
      return useAnimation;
    };


    function extractElementNode(element) {
      for(var i = 0; i < element.length; i++) {
        var elm = element[i];
        if(elm.nodeType == 1) return elm;
      }
    }


    return $animate;
  }

  $provide.decorator('$animate', ['$delegate', $AnimateDecorator]);
}]);
