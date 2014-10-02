/**
 * @private
 * TODO document
 */
IonicModule
.run([
  '$rootScope',
  '$state',
  '$location',
  '$document',
  '$ionicPlatform',
  '$ionicViewService',
function($rootScope, $state, $location, $document, $ionicPlatform, $ionicViewService) {

  // init the variables that keep track of the view history
  $rootScope.$viewHistory = {
    histories: { root: { historyId: 'root', parentHistoryId: null, stack: [], cursor: -1 } },
    views: {},
    backView: null,
    forwardView: null,
    currentView: null,
    disabledRegistrableTagNames: []
  };

  // set that these directives should not animate when transitioning
  // to it. Instead, the children <tab> directives would animate
  if ($ionicViewService.disableRegisterByTagName) {
    $ionicViewService.disableRegisterByTagName('ion-tabs');
    $ionicViewService.disableRegisterByTagName('ion-side-menus');
  }

  // always reset the keyboard state when change stage
  $rootScope.$on('$stateChangeStart', function(){
    ionic.keyboard.hide();
  });

  $rootScope.$on('viewState.changeHistory', function(e, data) {
    if(!data) return;

    var hist = (data.historyId ? $rootScope.$viewHistory.histories[ data.historyId ] : null );
    if(hist && hist.cursor > -1 && hist.cursor < hist.stack.length) {
      // the history they're going to already exists
      // go to it's last view in its stack
      var view = hist.stack[ hist.cursor ];
      return view.go(data);
    }

    // this history does not have a URL, but it does have a uiSref
    // figure out its URL from the uiSref
    if(!data.url && data.uiSref) {
      data.url = $state.href(data.uiSref);
    }

    if(data.url) {
      // don't let it start with a #, messes with $location.url()
      if(data.url.indexOf('#') === 0) {
        data.url = data.url.replace('#', '');
      }
      if(data.url !== $location.url()) {
        // we've got a good URL, ready GO!
        $location.url(data.url);
      }
    }
  });

  // Set the document title when a new view is shown
  $rootScope.$on('viewState.viewEnter', function(e, data) {
    if(data && data.title) {
      $document[0].title = data.title;
    }
  });

  // Triggered when devices with a hardware back button (Android) is clicked by the user
  // This is a Cordova/Phonegap platform specifc method
  function onHardwareBackButton(e) {
    if($rootScope.$viewHistory.backView) {
      // there is a back view, go to it
      $rootScope.$viewHistory.backView.go();
    } else {
      // there is no back view, so close the app instead
      ionic.Platform.exitApp();
    }
    e.preventDefault();
    return false;
  }
  $ionicPlatform.registerBackButtonAction(
    onHardwareBackButton,
    PLATFORM_BACK_BUTTON_PRIORITY_VIEW
  );

}])

.factory('$ionicViewService', [
  '$rootScope',
  '$state',
  '$compile',
  '$controller',
  '$location',
  '$window',
  '$q',
  '$timeout',
  '$ionicClickBlock',
  '$ionicConfig',
  '$animate',
function($rootScope, $state, $compile, $controller, $location, $window, $q, $timeout, $ionicClickBlock, $ionicConfig, $animate) {

  // data keys for jqLite elements
  var DATA_VIEW_IS_ACTIVE = '$ionicViewActive';
  var DATA_ELE_IDENTIFIER = '$ionicEleId';
  var DATA_VIEW_ACCESSED = '$ionicAccessed';
  var DATA_NO_CACHE = '$ionicNoCache';

  // history actions while navigating views
  var ACTION_INITIAL_VIEW = 'initialView';
  var ACTION_NEW_VIEW = 'newView';
  var ACTION_MOVE_BACK = 'moveBack';
  var ACTION_MOVE_FORWARD = 'moveForward';
  var ACTION_NO_CHANGE = 'noChange';
  var ACTION_DISABLED_BY_TAG_NAME = 'disabledByTagName';

  // direction of navigation
  var DIRECTION_BACK = 'back';
  var DIRECTION_FORWARD = 'forward';
  var DIRECTION_ENTER = 'enter';
  var DIRECTION_EXIT = 'exit';
  var DIRECTION_SWITCH = 'switch';

  var transitionCounter = 0;

  var View = function(){};
  View.prototype.initialize = function(data) {
    if(data) {
      for(var name in data) this[name] = data[name];
      return this;
    }
    return null;
  };
  View.prototype.go = function() {

    if(this.stateName) {
      return $state.go(this.stateName, this.stateParams);
    }

    if(this.url && this.url !== $location.url()) {

      if($rootScope.$viewHistory.backView === this) {
        return $window.history.go(-1);
      } else if($rootScope.$viewHistory.forwardView === this) {
        return $window.history.go(1);
      }

      $location.url(this.url);
      return;
    }

    return null;
  };
  View.prototype.destroy = function() {
    if(this.scope) {
      this.scope.$destroy && this.scope.$destroy();
      this.scope = null;
    }
  };


  function getViewById(viewId) {
    return (viewId ? $rootScope.$viewHistory.views[ viewId ] : null );
  }

  function getBackView(view) {
    return (view ? getViewById(view.backViewId) : null );
  }

  function getForwardView(view) {
    return (view ? getViewById(view.forwardViewId) : null );
  }

  function getHistoryById(historyId) {
    return (historyId ? $rootScope.$viewHistory.histories[ historyId ] : null );
  }

  function getHistory(scope) {
    var histObj = getParentHistoryObj(scope);

    if( !$rootScope.$viewHistory.histories[ histObj.historyId ] ) {
      // this history object exists in parent scope, but doesn't
      // exist in the history data yet
      $rootScope.$viewHistory.histories[ histObj.historyId ] = {
        historyId: histObj.historyId,
        parentHistoryId: getParentHistoryObj(histObj.scope.$parent).historyId,
        stack: [],
        cursor: -1
      };
    }
    return getHistoryById(histObj.historyId);
  }

  function getParentHistoryObj(scope) {
    var parentScope = scope;
    while(parentScope) {
      if(parentScope.hasOwnProperty('$historyId')) {
        // this parent scope has a historyId
        return { historyId: parentScope.$historyId, scope: parentScope };
      }
      // nothing found keep climbing up
      parentScope = parentScope.$parent;
    }
    // no history for for the parent, use the root
    return { historyId: 'root', scope: $rootScope };
  }

  function setNavViews(viewId, rsp) {
    var viewHistory = $rootScope.$viewHistory;

    viewHistory.currentView = getViewById(viewId);
    viewHistory.backView = getBackView(viewHistory.currentView);
    viewHistory.forwardView = getForwardView(viewHistory.currentView);
  }

  function createViewElement(viewLocals) {
    if(viewLocals && viewLocals.$template) {
      var div = jqLite('<div>').html(viewLocals.$template);
      var nodes = div.contents();
      for(var i = 0; i < nodes.length; i++) {
        if(nodes[i].nodeType == 1) {
          // first try to get just a child element
          return nodes.eq(i);
        }
      }
      // fallback to return the div so it has one parent element
      return div;
    }
  }

  function getViewElementIdentifier(locals, view) {
    if(locals && view) {
      if(locals.$$state.self.abstract) {
        return locals.$$state.self.name;
      }
      if(view.stateId) return view.stateId;
    }
    return ionic.Utils.nextUid();
  }

  function classToggle(ele, addClassName, removeClassName) {
    if(ele) {
      addClassName && ele.addClass(addClassName);
      removeClassName && ele.removeClass(removeClassName);
    }
  }

  return {

    register: function(parentScope, viewLocals) {

      var viewHistory = $rootScope.$viewHistory,
          currentStateId = this.getCurrentStateId(),
          hist = getHistory(parentScope),
          currentView = viewHistory.currentView,
          backView = viewHistory.backView,
          forwardView = viewHistory.forwardView,
          nextViewOptions = this.nextViewOptions(),
          rsp = {
            viewId: null,
            action: null,
            direction: null,
            historyId: hist.historyId,
            showBack: false
          };

      if(currentView &&
         currentView.stateId === currentStateId &&
         currentView.historyId === hist.historyId) {
        // do nothing if its the same stateId in the same history
        // rsp.action = ACTION_NO_CHANGE;
        // console.log('VIEW', rsp);
        // return rsp;
      }

      if(viewHistory.forcedNav) {
        // we've previously set exactly what to do
        ionic.Utils.extend(rsp, viewHistory.forcedNav);
        $rootScope.$viewHistory.forcedNav = null;

      } else if(backView && backView.stateId === currentStateId) {
        // they went back one, set the old current view as a forward view
        rsp.viewId = backView.viewId;
        rsp.historyId = backView.historyId;
        rsp.action = ACTION_MOVE_BACK;
        if(backView.historyId === currentView.historyId) {
          // went back in the same history
          rsp.direction = DIRECTION_BACK;
        }

      } else if(forwardView && forwardView.stateId === currentStateId) {
        // they went to the forward one, set the forward view to no longer a forward view
        rsp.viewId = forwardView.viewId;
        rsp.historyId = forwardView.historyId;
        rsp.action = ACTION_MOVE_FORWARD;
        if(forwardView.historyId === currentView.historyId) {
          rsp.direction = DIRECTION_FORWARD;
        }

        var parentHistory = getParentHistoryObj(parentScope);
        if(forwardView.historyId && parentHistory.scope) {
          // if a history has already been created by the forward view then make sure it stays the same
          parentHistory.scope.$historyId = forwardView.historyId;
          rsp.historyId = forwardView.historyId;
        }

      } else if(currentView && currentView.historyId !== hist.historyId &&
                hist.cursor > -1 && hist.stack.length > 0 && hist.cursor < hist.stack.length &&
                hist.stack[hist.cursor].stateId === currentStateId) {
        // they just changed to a different history and the history already has views in it
        var switchToView = hist.stack[hist.cursor];
        rsp.viewId = switchToView.viewId;
        rsp.historyId = switchToView.historyId;
        rsp.action = ACTION_MOVE_BACK;

        // if switching to a different history, and the history of the view we're switching
        // to has an existing back view from a different history than itself, then
        // it's back view would be better represented using the current view as its back view
        var switchToViewBackView = getViewById(switchToView.backViewId);
        if(switchToViewBackView && switchToView.historyId !== switchToViewBackView.historyId) {
          hist.stack[hist.cursor].backViewId = currentView.viewId;
        }

      } else {

        var alreadyExists = false;
        // if(viewLocals && viewLocals.$$state) {
        //   // check if this new view is one that already exists in another history
        //   var vwName, vw;
        //   for(vwName in viewHistory.views) {
        //     vw = viewHistory.views[ vwName ];

        //     if( hist.historyId !== vw.historyId &&
        //         vw.stateName === viewLocals.$$state.toString() ) {
        //       rsp.viewId = vw.viewId;
        //       rsp.historyId = vw.historyId;
        //       rsp.action = 'existingHistory';
        //       alreadyExists = true;
        //       break;
        //     }
        //   }
        // }

        if(!alreadyExists) {
          // does not exist yet
          rsp.ele = createViewElement(viewLocals);
          if(!rsp.ele) {
            rsp.action = 'invalidLocals';
            console.log('VIEW', rsp);
            return rsp;
          }

          // first check to see if this element can even be registered as a view
          if(!this.isTagNameRegistrable(rsp.ele)) {
            // Certain tags are only containers for views, but are not views themselves.
            // For example, the <ion-tabs> directive contains a <ion-tab> and the <ion-tab> is the
            // view, but the <ion-tabs> directive itself should not be registered as a view.
            rsp.action = ACTION_DISABLED_BY_TAG_NAME;
            rsp.tag = rsp.ele[0].tagName;
            console.log('VIEW', rsp);
            return rsp;
          }

          // set a new unique viewId
          rsp.viewId = ionic.Utils.nextUid();

          if(currentView) {
            // set the forward view if there is a current view (ie: if its not the first view)
            currentView.forwardViewId = rsp.viewId;

            // its only moving forward if its in the same history
            if(hist.historyId === currentView.historyId) {
              rsp.direction = DIRECTION_FORWARD;
            }
            rsp.action = ACTION_NEW_VIEW;

            // check if there is a new forward view within the same history
            if(forwardView && currentView.stateId !== forwardView.stateId &&
               currentView.historyId === forwardView.historyId) {
              // they navigated to a new view but the stack already has a forward view
              // since its a new view remove any forwards that existed
              var forwardsHistory = getHistoryById(forwardView.historyId);
              if(forwardsHistory) {
                // the forward has a history
                for(var x=forwardsHistory.stack.length - 1; x >= forwardView.index; x--) {
                  // starting from the end destroy all forwards in this history from this point
                  forwardsHistory.stack[x].destroy();
                  forwardsHistory.stack.splice(x);
                }
                rsp.historyId = forwardView.historyId;
              }
            }

          } else {
            // there's no current view, so this must be the initial view
            rsp.action = ACTION_INITIAL_VIEW;
          }

          // add the new view
          viewHistory.views[rsp.viewId] = this.createView({
            viewId: rsp.viewId,
            index: hist.stack.length,
            historyId: hist.historyId,
            backViewId: (currentView && currentView.viewId ? currentView.viewId : null),
            forwardViewId: null,
            stateId: currentStateId,
            stateName: this.getCurrentStateName(),
            stateParams: this.getCurrentStateParams(),
            tagName: rsp.ele[0].tagName,
            url: $location.url()
          });

          if (rsp.action == ACTION_MOVE_BACK) {
            $rootScope.$emit('$viewHistory.viewBack', currentView.viewId, rsp.viewId);
          }

          // add the new view to this history's stack
          hist.stack.push(viewHistory.views[rsp.viewId]);
        }
      }

      if(nextViewOptions) {
        if(nextViewOptions.disableAnimate) rsp.direction = null;
        if(nextViewOptions.disableBack) viewHistory.views[rsp.viewId].backViewId = null;
        this.nextViewOptions(null);
      }

      setNavViews(rsp.viewId);
      rsp.showBack = !!(viewHistory.backView && viewHistory.backView.historyId === viewHistory.currentView.historyId);

      hist.cursor = viewHistory.currentView.index;

      rsp.tagName = viewHistory.views[rsp.viewId].tagName;

      console.log('VIEW', rsp);

      return rsp;
    },

    registerHistory: function(scope) {
      scope.$historyId = ionic.Utils.nextUid();
      return scope.$historyId;
    },

    createView: function(data) {
      var newView = new View();
      return newView.initialize(data);
    },

    getCurrentView: function() {
      return $rootScope.$viewHistory.currentView;
    },

    getBackView: function() {
      return $rootScope.$viewHistory.backView;
    },

    getForwardView: function() {
      return $rootScope.$viewHistory.forwardView;
    },

    getCurrentStateName: function() {
      return ($state && $state.current ? $state.current.name : null);
    },

    isCurrentStateNavView: function(navView) {
      return ($state &&
              $state.current &&
              $state.current.views &&
              $state.current.views[navView] ? true : false);
    },

    getCurrentStateParams: function() {
      var rtn;
      if ($state && $state.params) {
        for(var key in $state.params) {
          if($state.params.hasOwnProperty(key)) {
            rtn = rtn || {};
            rtn[key] = $state.params[key];
          }
        }
      }
      return rtn;
    },

    getCurrentStateId: function() {
      var id;
      if($state && $state.current && $state.current.name) {
        id = $state.current.name;
        if($state.params) {
          for(var key in $state.params) {
            if($state.params.hasOwnProperty(key) && $state.params[key]) {
              id += "_" + key + "=" + $state.params[key];
            }
          }
        }
        return id;
      }
      // if something goes wrong make sure its got a unique stateId
      return ionic.Utils.nextUid();
    },

    goToHistoryRoot: function(historyId) {
      if(historyId) {
        var hist = getHistoryById(historyId);
        if(hist && hist.stack.length) {
          if($rootScope.$viewHistory.currentView && $rootScope.$viewHistory.currentView.viewId === hist.stack[0].viewId) {
            return;
          }
          $rootScope.$viewHistory.forcedNav = {
            viewId: hist.stack[0].viewId,
            action: ACTION_MOVE_BACK,
            direction: 'back'
          };
          hist.stack[0].go();
        }
      }
    },

    nextViewOptions: function(opts) {
      if(arguments.length) {
        this._nextOpts = opts;
      } else {
        return this._nextOpts;
      }
    },

    getTransition: function(navViewScope, navViewElement, navViewAttrs, viewLocals, registerData, enteringView) {

      var transitionId = ++transitionCounter;

      // injected registerData used for testing
      registerData = registerData || this.register(navViewScope, viewLocals);

      // injected enteringView used for testing
      enteringView = enteringView || getViewById(registerData.viewId) || {};

      // get a reference to an entering/leaving element if they exist
      // loop through to see if the view is already in the navViewElement
      var enteringEle, leavingEle;
      var viewElements = navViewElement.children();
      var enteringEleIdentifier = getViewElementIdentifier(viewLocals, enteringView);

      for(var x=0, l=viewElements.length; x<l; x++) {
        if(enteringEleIdentifier && viewElements.eq(x).data(DATA_ELE_IDENTIFIER) == enteringEleIdentifier) {
          // we found an existing element in the DOM that should be entering the view
          enteringEle = viewElements.eq(x);

        } else if(viewElements.eq(x).hasClass('view-active')) {
          // this element is currently the active one, so it will be the leaving element
          leavingEle = viewElements.eq(x);
        }
      }

      // if we got an entering element than it's already in the DOM
      var alreadyInDom = !!enteringEle;

      if(!enteringEle && registerData.ele) {
        // already created a new element within the register
        // instead of doing it twice, just use the one we got from register
        enteringEle = registerData.ele;
      }

      if(!enteringEle) {
        // still no existing element to use
        // create it using existing template/scope/locals
        enteringEle = createViewElement(viewLocals);
      }

      function cleanup() {
        if(registerData) {
          registerData.ele = null;
          registerData = null;
        }
        enteringView = null;
        enteringEle = null;
        leavingEle = null;
      }


      var trans = {

        registerData: registerData,

        init: function() {

          $ionicClickBlock.show();

          trans.render(function(){

            trans.before();

            $animate.transition('ios-slide', registerData.direction, navViewElement, enteringEle, leavingEle).then(function(transData){

              if(transitionId === transitionCounter) {
                // only run complete on the most recent transition
                trans.after(transData);

                // remove any DOM nodes according to the removal policy
                trans.runRemovalPolicy();

                // allow clicks to hapen again after the transition
                $ionicClickBlock.hide();

                navViewScope.$emit('$ionicView.navViewActive', transData);
              }

              // always clean up any references that could cause memory issues
              cleanup();
            });

          });

        },

        render: function(callback) {
          // update that this view was just accessed
          enteringEle.data(DATA_VIEW_ACCESSED, Date.now());

          if(!alreadyInDom) {
            // the entering element is not already in the DOM
            // hasn't been compiled and isn't linked up yet

            // add the DATA_NO_CACHE data
            // if the current state has cache:false
            // or the element has cache-view="false" attribute
            if( (viewLocals && viewLocals.$$state.self.cache === false) ||
                (enteringEle.attr('cache-view') == 'false') ) {
              enteringEle.data(DATA_NO_CACHE, true);
            }

            // compile the entering element and get the link function
            var link = $compile(enteringEle);

            // existing elements in the DOM are looked up by their state name and state id
            enteringEle.data(DATA_ELE_IDENTIFIER, getViewElementIdentifier(viewLocals, enteringView) );

            // append the entering element to the DOM
            enteringEle.addClass('view-entering')
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

            $timeout(function(){
              callback();
            }, 12);

          } else {
            callback();
          }

        },

        before: function() {
          var transData = {
            direction: registerData.direction
          };
          if(enteringEle) {
            var enteringScope = jqLite(enteringEle).scope();
            if(enteringScope) {
              enteringScope.$broadcast('$ionicView.beforeEnter', transData);
            }
          }

          if(leavingEle) {
            var leavingScope = jqLite(leavingEle).scope();
            console.log('viewService beforeLeave', leavingScope)
            if(leavingScope) {
              leavingScope.$broadcast('$ionicView.beforeLeave', transData);
            }
          }
        },

        after: function(transData) {

          // remove the all transition css classes
          var viewElements = navViewElement.children();
          var viewElement;
          var activeStateId = enteringEle.data(DATA_ELE_IDENTIFIER);

          // update/ensure each view element has the correct classes
          for(var x=0, l=viewElements.length; x<l; x++) {
            viewElement = viewElements.eq(x);
            viewElement.data(DATA_VIEW_IS_ACTIVE, (viewElement.data(DATA_ELE_IDENTIFIER) === activeStateId) );
          }

          if(enteringEle) {
            var enteringScope = jqLite(enteringEle).scope();
            if(enteringScope) {
              enteringScope.$broadcast('$ionicView.afterEnter', transData);
              enteringScope.$broadcast('$viewContentLoaded', transData);
            }
          }

          if(leavingEle) {
            var leavingScope = jqLite(leavingEle).scope();
            if(leavingScope) {
              leavingScope.$broadcast('$ionicView.afterLeave', transData);
            }
          }

          // the view may have an onload attribute, if so do something
          //if (navViewAttrs.onload) view.scope.$eval(navViewAttrs.onload);

        },

        runRemovalPolicy: function() {
          var removableEle;

          if( registerData.direction == DIRECTION_BACK && leavingEle ) {
            // if they just navigated back we can destroy the forward view
            removableEle = leavingEle;

          } else if( leavingEle && leavingEle.data(DATA_NO_CACHE) ) {
            // remove if the leaving element has DATA_NO_CACHE===false
            removableEle = leavingEle;

          } else {
            // check to see if we have more cached views than we should
            var viewElements = navViewElement.children();
            var viewElementsLength = viewElements.length;

            if( (viewElementsLength - 1) > $ionicConfig.maxCachedViews ) {
              // the total number of child elements has exceeded how many to keep in the DOM
              var viewElement;
              var oldestAccess = Date.now();

              for(var x=0; x<viewElementsLength; x++) {
                viewElement = viewElements.eq(x);

                if( viewElement.data(DATA_VIEW_IS_ACTIVE) ) continue;

                if( viewElement.data(DATA_VIEW_ACCESSED) < oldestAccess ) {
                  // remove the element that was the oldest to be accessed
                  oldestAccess = viewElement.data(DATA_VIEW_ACCESSED);
                  removableEle = viewElements.eq(x);
                }
              }
            }
          }

          if(removableEle) {
            // we found an element that should be removed
            // destroy its scope, then remove the element
            jqLite(removableEle).scope().$destroy();
            removableEle.remove();
          }
        },

        isValid: function() {
          return enteringEle && (registerData.direction != ACTION_NO_CHANGE);
        }

      };

      return trans;
    },

    disableRegisterByTagName: function(tagName) {
      // not every element should animate betwee transitions
      // For example, the <ion-tabs> directive should not animate when it enters,
      // but instead the <ion-tabs> directve would just show, and its children
      // <ion-tab> directives would do the animating, but <ion-tabs> itself is not a view
      $rootScope.$viewHistory.disabledRegistrableTagNames.push(tagName.toUpperCase());
    },

    isTagNameRegistrable: function(element) {
      // check if this element has a tagName (at its root, not recursively)
      // that shouldn't be animated, like <ion-tabs> or <ion-side-menu>
      var x, y, disabledTags = $rootScope.$viewHistory.disabledRegistrableTagNames;
      for(x=0; x<element.length; x++) {
        if(element[x].nodeType !== 1) continue;
        for(y=0; y<disabledTags.length; y++) {
          if(element[x].tagName === disabledTags[y]) {
            return false;
          }
        }
      }
      return true;
    },

    clearHistory: function() {
      var
      histories = $rootScope.$viewHistory.histories,
      currentView = $rootScope.$viewHistory.currentView;

      if(histories) {
        for(var historyId in histories) {

          if(histories[historyId].stack) {
            histories[historyId].stack = [];
            histories[historyId].cursor = -1;
          }

          if(currentView && currentView.historyId === historyId) {
            currentView.backViewId = null;
            currentView.forwardViewId = null;
            histories[historyId].stack.push(currentView);
          } else if(histories[historyId].destroy) {
            histories[historyId].destroy();
          }

        }
      }

      for(var viewId in $rootScope.$viewHistory.views) {
        if(viewId !== currentView.viewId) {
          delete $rootScope.$viewHistory.views[viewId];
        }
      }

      if(currentView) {
        setNavViews(currentView.viewId);
      }
    }

  };

}]);
