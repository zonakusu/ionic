/**
 * @private
 */
IonicModule.config([
  '$provide',
function($provide) {
  function $AnimateDecorator($animate, $timeout) {

    var CSS_DIRECTIONS = 'nav-forward nav-back nav-enter nav-exit nav-swap'.split(' ');
    var NG_ANIMATE_PARENT_KEY = '$$ngAnimateKey';

    var usedTransitions = [];
    var useAnimation = true;


    $animate.transition = function(animation, transition, direction, enteringElement, leavingElement, callback) {
      var parentElement = enteringElement.parent();
      var shouldAnimate = $animate.shouldAnimate(transition, direction);

      $animate.stage(shouldAnimate, animation, transition, direction, parentElement, enteringElement, leavingElement, function(){

        $animate.start(shouldAnimate, animation, transition, direction, enteringElement, leavingElement, function(){

          $animate.end(animation, transition, direction, parentElement, enteringElement, leavingElement, callback);

        });

      });

    };


    $animate.shouldAnimate = function(transition, direction) {
      return !!(useAnimation && direction && direction !== 'none' && transition && transition !== 'none');
    };


    $animate.stage = function(shouldAnimate, animation, transition, direction, parentElement, enteringElement, leavingElement, callback) {

      var x, isExisitingTransition;

      for (x=0; x<usedTransitions.length; x++) {
        if (usedTransitions[x] === transition && shouldAnimate) {
          isExisitingTransition = true;
        } else {
          parentElement.removeClass( usedTransitions[x] );
        }
      }

      for (x=0; x<CSS_DIRECTIONS.length; x++) {
        if (CSS_DIRECTIONS[x] !== direction) {
          parentElement.removeClass( CSS_DIRECTIONS[x] );
        }
      }

      if ( shouldAnimate ) {
        if (!isExisitingTransition) {
          usedTransitions.push(transition);
        }

        parentElement.addClass(transition)
                     .addClass('nav-' + direction);

        // classes can change on the parent, so make sure the parent ID uses the classname
        // and not the default parent counter within $animate
        var classParentID = extractElementNode(parentElement).getAttribute('class');
        var parentID = parentElement.data(NG_ANIMATE_PARENT_KEY);
        if (parentID !== classParentID) {
          parentElement.data(NG_ANIMATE_PARENT_KEY, classParentID);
        }
      }

      // ensure
      enteringElement.addClass(animation + '-entering')
                     .removeClass(animation + '-cache')
                     .removeClass(animation);

      if (leavingElement) {
          leavingElement.addClass(animation + '-leaving')
                        .removeClass(animation + '-cache')
                        .addClass(animation);

        if ( shouldAnimate ) {
          leavingElement.addClass('ng-animate');
        }
      }

      $timeout(callback, 10);

    };


    $animate.start = function(shouldAnimate, animation, transition, direction, enteringElement, leavingElement, callback) {

      function next() {
        ++next.c > 1 && callback();
      }
      next.c = 0;

      if (enteringElement && shouldAnimate) {
        $animate.addClass(enteringElement, animation, next);
      } else {
        next();
      }

      if (leavingElement && shouldAnimate) {
        $animate.removeClass(leavingElement, animation, next);
      } else {
        next();
      }

    };


    $animate.end = function(animation, transition, direction, parentElement, enteringElement, leavingElement, callback) {

      ionic.requestAnimationFrame(function(){

        if (enteringElement) {
          enteringElement.addClass(animation + '-active')
                         .removeClass(animation + '-cache')
                         .removeClass(animation + '-entering')
                         .removeClass(animation + '-leaving')
                         .addClass(animation);
        }

        if (leavingElement) {
          leavingElement.addClass(animation + '-cache')
                        .removeClass(animation + '-active')
                        .removeClass(animation + '-entering')
                        .removeClass(animation + '-leaving');
        }

        parentElement.removeClass(animation);

        for (var x=0; x<CSS_DIRECTIONS.length; x++) {
          parentElement.removeClass(CSS_DIRECTIONS[x]);
        }

        callback && callback();

      });

    };


    $animate.useAnimation = function(val) {
      if (arguments.length) {
        useAnimation = val;
      }
      return useAnimation;
    };


    function extractElementNode(element) {
      for (var i = 0; i < element.length; i++) {
        var elm = element[i];
        if (elm.nodeType == 1) return elm;
      }
    }


    return $animate;
  }

  $provide.decorator('$animate', ['$delegate', '$timeout', $AnimateDecorator]);
}]);
