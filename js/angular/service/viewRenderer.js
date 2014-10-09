/**
 * @private
 * TODO document
 */

IonicModule

.constant('$ionicViewConfig', {
  transition: 'ios-transition'
})

.factory('$ionicViewRenderer',[
  '$rootScope',
  '$ionicHistory',
  '$ionicClickBlock',
  '$ionicConfig',
  '$ionicViewConfig',
  '$compile',
  '$controller',
  '$animate',
function($rootScope, $ionicHistory, $ionicClickBlock, $ionicConfig, $ionicViewConfig, $compile, $controller, $animate) {

  // data keys for jqLite elements
  var DATA_NO_CACHE = '$ionicNoCache';
  var DATA_ELE_IDENTIFIER = '$ionicEleId';
  var DATA_VIEW_ACCESSED = '$ionicAccessed';

  var transitionCounter = 0;
  var nextTransition;
  var nextDirection;


  function createViewElement(viewLocals) {
    if (viewLocals && viewLocals.$template) {
      var div = jqLite('<div>').html(viewLocals.$template);
      var nodes = div.contents();
      for(var i = 0; i < nodes.length; i++) {
        if (nodes[i].nodeType == 1) {
          // first try to get just a child element
          return nodes.eq(i);
        }
      }
      // fallback to return the div so it has one parent element
      return div;
    }
  }

  function getViewElementIdentifier(locals, view) {
    if (locals && view) {
      if (locals.$$state.self.abstract) {
        return locals.$$state.self.name;
      }
      if (view.stateId) return view.stateId;
    }
    return ionic.Utils.nextUid();
  }


  var viewRenderer = {

    create: function(navViewScope, navViewElement, viewLocals, enteringView) {
      var transitionId = ++transitionCounter;

      // get a reference to an entering/leaving element if they exist
      // loop through to see if the view is already in the navViewElement
      var enteringEle, leavingEle;
      var viewElements = navViewElement.children();
      var enteringEleIdentifier = getViewElementIdentifier(viewLocals, enteringView);

      for(var x=0, l=viewElements.length; x<l; x++) {

        if (enteringEleIdentifier && viewElements.eq(x).data(DATA_ELE_IDENTIFIER) == enteringEleIdentifier) {
          // we found an existing element in the DOM that should be entering the view
          enteringEle = viewElements.eq(x);

        } else if (viewElements.eq(x).hasClass('view-active')) {
          // this element is currently the active one, so it will be the leaving element
          leavingEle = viewElements.eq(x);
        }

        if (enteringEle && leavingEle) break;
      }

      // if we got an entering element than it's already in the DOM
      var alreadyInDom = !!enteringEle;

      if (!enteringEle) {
        // still no existing element to use
        // create it using existing template/scope/locals
        enteringEle = createViewElement(viewLocals);
      }


      var trans = {

        init: function(callback) {

          $ionicClickBlock.show();

          trans.render(function(){

            callback && callback();

          });

        },

        transition: function(direction) {
          var transData = viewRenderer.getTransitionData(viewLocals, enteringEle, direction, enteringView);

          trans.notify('before', transData);

          $animate.transition( transData.transition, transData.direction, enteringEle, leavingEle, function(){

            if (transitionId === transitionCounter) {

              trans.notify('after', transData);

              trans.cleanup(transData);

              // allow clicks to happen again after the transition
              $ionicClickBlock.hide();
            }

            // clean up any references that could cause memory issues
            enteringView = enteringEle = leavingEle = null;
          });
        },

        render: function(callback) {
          if (!alreadyInDom) {
            // the entering element is not already in the DOM
            // hasn't been compiled and isn't linked up yet

            // add the DATA_NO_CACHE data
            // if the current state has cache:false
            // or the element has cache-view="false" attribute
            if ( (viewLocals && viewLocals.$$state.self.cache === false) ||
                (enteringEle.attr('cache-view') == 'false') ) {
              enteringEle.data(DATA_NO_CACHE, true);
            }

            // compile the entering element and get the link function
            var link = $compile(enteringEle);

            // existing elements in the DOM are looked up by their state name and state id
            enteringEle.data(DATA_ELE_IDENTIFIER, getViewElementIdentifier(viewLocals, enteringView) );

            // append the entering element to the DOM
            enteringEle.addClass('view-entering');
            navViewElement.append(enteringEle);

            // create a new scope for the entering element
            var scope = navViewScope.$new();

            // if it's got a controller then spin it all up
            if (viewLocals.$$controller) {
              viewLocals.$scope = scope;
              var controller = $controller(viewLocals.$$controller, viewLocals);
              navViewElement.children().data('$ngControllerController', controller);
            }

            // run link with the view's scope
            link(scope);
          }

          // update that this view was just accessed
          enteringEle.data(DATA_VIEW_ACCESSED, Date.now());

          $rootScope.$$postDigest(function(){
            callback();
          });
        },

        notify: function(step, transData) {
          var scope = enteringEle.scope();
          if(scope) {
            scope.$emit('$ionicView.' + step + 'Enter', transData);
          }

          scope = leavingEle && leavingEle.scope();
          if(scope) {
            scope.$emit('$ionicView.' + step + 'Leaving', transData);
          }
        },

        cleanup: function(transData) {
          var viewElements = navViewElement.children();
          var viewElementsLength = viewElements.length;
          var x, viewElement, removableEle;
          var activeStateId = enteringEle.data(DATA_ELE_IDENTIFIER);

          // check if any views should be removed
          if ( transData.direction == 'back' && !$ionicConfig.cacheForwardViews && leavingEle ) {
            // if they just navigated back we can destroy the forward view
            // do not remove forward views if cacheForwardViews config is true
            removableEle = leavingEle;

          } else if ( leavingEle && leavingEle.data(DATA_NO_CACHE) ) {
            // remove if the leaving element has DATA_NO_CACHE===false
            removableEle = leavingEle;

          } else if ( (viewElementsLength - 1) > $ionicConfig.maxCachedViews ) {
            // check to see if we have more cached views than we should
            // the total number of child elements has exceeded how many to keep in the DOM
            var oldestAccess = Date.now();

            for(x=0; x<viewElementsLength; x++) {
              viewElement = viewElements.eq(x);

              if ( viewElement.data(DATA_VIEW_ACCESSED) < oldestAccess ) {
                // remove the element that was the oldest to be accessed
                oldestAccess = viewElement.data(DATA_VIEW_ACCESSED);
                removableEle = viewElements.eq(x);
              }
            }
          }

          if (removableEle) {
            // we found an element that should be removed
            // destroy its scope, then remove the element
            removableEle.scope().$destroy();
            removableEle.remove();
          }

          nextTransition = nextDirection = null;
        }
      };

      return trans;
    },

    getTransitionData: function(viewLocals, enteringEle, direction, enteringView) {
      // Priority
      // 1) attribute directive
      // 2) entering element's attribute
      // 3) entering view's $state config property
      // 4) view registration data
      // 5) global config
      // 6) fallback value

      var viewState = viewLocals && viewLocals.$$state && viewLocals.$$state.self || {};
      enteringView = enteringView || {};

      return {
        transition: nextTransition || enteringEle && enteringEle.attr('view-transition') || viewState.viewTransition || $ionicConfig.viewTransition === 'platform' && $ionicViewConfig.transition || $ionicConfig.viewTransition,
        direction: nextDirection || enteringEle && enteringEle.attr('view-direction') || viewState.viewDirection || direction || 'none',
        viewId: enteringView.viewId,
        stateId: enteringView.stateId,
        stateName: enteringView.stateName,
        stateParams: enteringView.stateParams
      };
    },

    nextTransition: function(val) {
      nextTransition = val;
    },

    nextDirection: function(val) {
      nextDirection = val;
    }

  };

  return viewRenderer;

}]);
