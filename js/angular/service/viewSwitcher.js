/**
 * @private
 * TODO document
 */

IonicModule

.constant('$ionicViewConfig', {
  transition: 'ios-transition'
})

.factory('$ionicViewSwitcher',[
  '$timeout',
  '$compile',
  '$controller',
  '$animate',
  '$ionicClickBlock',
  '$ionicConfig',
  '$ionicViewConfig',
function($timeout, $compile, $controller, $animate, $ionicClickBlock, $ionicConfig, $ionicViewConfig) {

  // data keys for jqLite elements
  var DATA_NO_CACHE = '$ionicNoCache';
  var DATA_ELE_IDENTIFIER = '$ionicEleId';
  var DATA_VIEW_ACCESSED = '$ionicAccessed';

  var transitionCounter = 0;
  var nextTransition;
  var nextDirection;


  function createViewElement(viewLocals) {
    var div = jqLite('<div>');
    if (viewLocals && viewLocals.$template) {
      div.html(viewLocals.$template);
      var nodes = div.contents();
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].nodeType == 1) {
          // first try to get just a child element
          return nodes.eq(i);
        }
      }
    }
    // fallback to return the div so it has one parent element
    return div;
  }

  function getViewElementIdentifier(locals, view) {
    if ( viewState(locals).abstract ) return viewState(locals).name;
    if ( view ) return view.stateId || view.viewId;
    return ionic.Utils.nextUid();
  }

  function viewState(locals) {
    return locals && locals.$$state && locals.$$state.self || {};
  }

  function getTransitionData(viewLocals, enteringEle, direction, enteringView) {
    // Priority
    // 1) attribute directive
    // 2) entering element's attribute
    // 3) entering view's $state config property
    // 4) view registration data
    // 5) global config
    // 6) fallback value

    var state = viewState(viewLocals);
    enteringView = enteringView || {};

    return {
      transition: nextTransition || enteringEle && enteringEle.attr('view-transition') || state.viewTransition || $ionicConfig.viewTransition === 'platform' && $ionicViewConfig.transition || $ionicConfig.viewTransition,
      direction: nextDirection || enteringEle && enteringEle.attr('view-direction') || state.viewDirection || direction || 'none',
      viewId: enteringView.viewId,
      stateId: enteringView.stateId,
      stateName: enteringView.stateName,
      stateParams: enteringView.stateParams
    };
  }


  return {

    create: function(navViewScope, navViewElement, viewLocals, enteringView) {
      // get a reference to an entering/leaving element if they exist
      // loop through to see if the view is already in the navViewElement
      var enteringEle, leavingEle;
      var transitionId = ++transitionCounter;
      var alreadyInDom;

      var switcher = {

        init: function(callback) {
          $ionicClickBlock.show();
          switcher.loadViewElements();

          switcher.render(function(){
            callback && callback();
          });
        },

        loadViewElements: function() {
          var viewElements = navViewElement.children();
          var enteringEleIdentifier = getViewElementIdentifier(viewLocals, enteringView);

          for(var x=0, l=viewElements.length; x<l; x++) {

            if (enteringEleIdentifier && viewElements.eq(x).data(DATA_ELE_IDENTIFIER) == enteringEleIdentifier) {
              // we found an existing element in the DOM that should be entering the view
              enteringEle = viewElements.eq(x);

            } else if (viewElements.eq(x).hasClass('nav-view-active')) {
              // this element is currently the active one, so it will be the leaving element
              leavingEle = viewElements.eq(x);
            }

            if (enteringEle && leavingEle) break;
          }

          alreadyInDom = !!enteringEle;

          if (!alreadyInDom) {
            // still no existing element to use
            // create it using existing template/scope/locals
            enteringEle = createViewElement(viewLocals);

            enteringEle.addClass('nav-view-entering');

            // existing elements in the DOM are looked up by their state name and state id
            enteringEle.data(DATA_ELE_IDENTIFIER, enteringEleIdentifier);

            // add the DATA_NO_CACHE data
            // if the current state has cache:false
            // or the element has cache-view="false" attribute
            if ( viewState(viewLocals).cache === false || enteringEle.attr('cache-view') == 'false' ) {
              enteringEle.data(DATA_NO_CACHE, true);
            }
          }
        },

        render: function(callback) {
          if ( alreadyInDom ) {
            // it was already found in the dom, just reconnect the scope
            ionic.Utils.reconnectScope( enteringEle.scope() );

          } else {
            // the entering element is not already in the DOM
            // hasn't been compiled and isn't linked up yet

            // compile the entering element and get the link function
            var link = $compile(enteringEle);

            // append the entering element to the DOM
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

          if( $animate.useAnimation() ) {
            $timeout(callback, 10);
          } else {
            callback();
          }

        },

        transition: function(direction) {
          var transData = getTransitionData(viewLocals, enteringEle, direction, enteringView);

          switcher.notify('before', transData);

          $animate.transition( 'nav-view', transData.transition, transData.direction, enteringEle, leavingEle).then(function(){
            if (transitionId === transitionCounter) {

              switcher.notify('after', transData);

              switcher.cleanup(transData);

              // allow clicks to happen again after the transition
              $ionicClickBlock.hide();
            }

            // clean up any references that could cause memory issues
            nextTransition = nextDirection = enteringView = enteringEle = leavingEle = null;
          });

        },

        notify: function(step, transData) {
          var scope = enteringEle.scope();
          if (scope) {
            scope.$emit('$ionicView.' + step + 'Enter', transData);
          }

          scope = leavingEle && leavingEle.scope();
          if (scope) {
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

          ionic.Utils.disconnectScope( leavingEle && leavingEle.scope() );
        },

        enteringEle: function(){ return enteringEle; },
        leavingEle: function(){ return leavingEle; }

      };

      return switcher;
    },

    nextTransition: function(val) {
      nextTransition = val;
    },

    nextDirection: function(val) {
      nextDirection = val;
    },

    getTransitionData: getTransitionData

  };

}]);
