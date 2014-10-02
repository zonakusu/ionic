/**
 * @private
 */
IonicModule.config([
  '$provide',
function($provide) {
  function $AnimateDecorator($animate, $q, $timeout) {

    var CSS_DIRECTIONS = 'nav-forward nav-back nav-enter nav-exit nav-switch'.split(' ');
    var CSS_VIEW_ACTIVE = 'view-active';
    var CSS_VIEW_CACHE = 'view-cache';
    var CSS_VIEW_ENTERING = 'view-entering';
    var CSS_VIEW_LEAVING = 'view-leaving';
    var CSS_ANIMATION_SUPER = 'view';
    var NG_ANIMATE_PARENT_KEY = '$$ngAnimateKey';

    var usedAnimationClasses = [];

    function extractElementNode(element) {
      for(var i = 0; i < element.length; i++) {
        var elm = element[i];
        if(elm.nodeType == 1) return elm;
      }
    }

    $animate.transition = function(animationClass, navDirection, parentElement, enteringElement) {
      var deferred = $q.defer();

      var leavingElement = parentElement[0].querySelector('.' + CSS_VIEW_ACTIVE);
      if(leavingElement) {
        leavingElement = jqLite(leavingElement);
      }

      $animate.stage(animationClass, navDirection, parentElement, enteringElement, leavingElement);

      $animate.start(animationClass, navDirection, parentElement, enteringElement, leavingElement).then(function(){

        $animate.end(animationClass, navDirection, parentElement, enteringElement, leavingElement);

         deferred.resolve();

      });

      return deferred.promise;
    };

    $animate.stage = function(animationClass, navDirection, parentElement, enteringElement, leavingElement) {

      var isExistingAnimationClass;
      for(var x=0; x<usedAnimationClasses.length; x++) {
        if(usedAnimationClasses[x] === animationClass && navDirection) {
          isExistingAnimationClass = true;
        } else {
          parentElement.removeClass(usedAnimationClasses[x]);
        }
      }
      if(!isExistingAnimationClass) {
        usedAnimationClasses.push(animationClass);
      }

      for(var x=0; x<CSS_DIRECTIONS.length; x++) {
        if(CSS_DIRECTIONS[x] !== navDirection) {
          parentElement.removeClass(CSS_DIRECTIONS[x])
        }
      }
      if(navDirection) {
        parentElement.addClass(animationClass)
                     .addClass('nav-' + navDirection);

        // classes can change on the parent, so make sure the parent ID uses the classname
        // and not the default parent counter within $animate
        var classParentID = extractElementNode(parentElement).getAttribute('class');
        var parentID = parentElement.data(NG_ANIMATE_PARENT_KEY);
        if(parentID !== classParentID) {
          parentElement.data(NG_ANIMATE_PARENT_KEY, classParentID);
        }
      }

      // ensure
      enteringElement.addClass(CSS_VIEW_ENTERING)
                     .removeClass(CSS_VIEW_CACHE);

      if(leavingElement) {
        leavingElement.addClass('ng-animate')
                      .addClass(CSS_VIEW_LEAVING)
                      .removeClass(CSS_VIEW_CACHE);
      }

    };


    $animate.start = function(animationClass, navDirection, parentElement, enteringElement, leavingElement) {
      var enteringDeferred = $q.defer();
      var leavingDeferred = $q.defer();

      $animate.addClass(enteringElement, CSS_ANIMATION_SUPER, function(){
        enteringDeferred.resolve();
      });

      if(leavingElement) {
        $animate.removeClass(leavingElement, CSS_ANIMATION_SUPER, function(){
          leavingDeferred.resolve();
        })
      } else {
        leavingDeferred.resolve();
      }

      return $q.all([ enteringDeferred.promise, leavingDeferred.promise ]);
    };


    $animate.end = function(animationClass, navDirection, parentElement, enteringElement, leavingElement) {

      if(enteringElement) {
        enteringElement.addClass(CSS_VIEW_ACTIVE)
                       .removeClass(CSS_VIEW_CACHE)
                       .removeClass(CSS_VIEW_ENTERING)
                       .removeClass(CSS_VIEW_LEAVING);
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


    return $animate;
  }

  $provide.decorator('$animate', ['$delegate', '$q', '$timeout', $AnimateDecorator]);
}]);
