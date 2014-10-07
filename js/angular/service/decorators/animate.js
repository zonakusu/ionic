/**
 * @private
 */
IonicModule.config([
  '$provide',
function($provide) {
  function $AnimateDecorator($animate, $timeout) {

    var CSS_DIRECTIONS = 'nav-forward nav-back nav-enter nav-exit nav-switch'.split(' ');
    var CSS_VIEW_ACTIVE = 'view-active';
    var CSS_VIEW_CACHE = 'view-cache';
    var CSS_VIEW_ENTERING = 'view-entering';
    var CSS_VIEW_LEAVING = 'view-leaving';
    var CSS_ANIMATION_SUPER = 'view-pane';
    var NG_ANIMATE_PARENT_KEY = '$$ngAnimateKey';

    var usedAnimationClasses = [];
    var useAnimation = true;


    $animate.transition = function(animationClass, navDirection, enteringElement, leavingElement, callback) {

      var parentElement = enteringElement.parent();
      var doAnimation = !!(navDirection && navDirection !== 'none' && useAnimation);

      $animate.stage(doAnimation, animationClass, navDirection, parentElement, enteringElement, leavingElement);

      $animate.start(doAnimation, enteringElement, leavingElement, function(){

        $animate.end(animationClass, navDirection, parentElement, enteringElement, leavingElement);

         callback && callback();

      });

    };


    $animate.stage = function(doAnimation, animationClass, navDirection, parentElement, enteringElement, leavingElement) {

      var x, isExistingAnimationClass;

      for(x=0; x<usedAnimationClasses.length; x++) {
        if(usedAnimationClasses[x] === animationClass && doAnimation) {
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

      if( doAnimation ) {
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
                     .removeClass(CSS_VIEW_CACHE);

      if(leavingElement) {
          leavingElement.addClass(CSS_VIEW_LEAVING)
                        .addClass('view')
                        .removeClass(CSS_VIEW_CACHE)
                        .addClass(CSS_ANIMATION_SUPER);

        if( doAnimation ) {
          leavingElement.addClass('ng-animate');
        }
      }

    };



    $animate.start = function(doAnimation, enteringElement, leavingElement, callback) {
      var enteringDone, leavingDone;

      function next() {
        enteringDone && leavingDone && callback && callback();
      }

      if(enteringElement && doAnimation) {
        $animate.addClass(enteringElement, CSS_ANIMATION_SUPER, function(){
          enteringDone = true;
          next();
        });
      } else {
        enteringDone = true;
        next();
      }

      if(leavingElement && doAnimation) {
        $animate.removeClass(leavingElement, CSS_ANIMATION_SUPER, function(){
          leavingDone = true;
          next();
        });
      } else {
        leavingDone = true;
        next();
      }

    };


    $animate.end = function(animationClass, navDirection, parentElement, enteringElement, leavingElement) {

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
                      .removeClass(CSS_VIEW_LEAVING)
                      .removeClass('view');
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

  $provide.decorator('$animate', ['$delegate', '$timeout', $AnimateDecorator]);
}]);
