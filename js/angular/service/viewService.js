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
function($rootScope, $state, $compile, $controller, $location, $window, $q, $timeout, $ionicClickBlock, $ionicConfig) {

  // data keys for jqLite elements
  var DATA_VIEW_IS_ACTIVE = '$ionViewIsActive';
  var DATA_ELE_IDENTIFIER = '$ionEleId';
  var DATA_VIEW_ACCESSED = '$ionAccessed';
  var DATA_CACHE_VIEW = '$ionCacheView';

  // css class names used
  var CSS_HIDE = 'hide';
  var CSS_VIEW_ENTERING = 'view-entering';
  var CSS_VIEW_LEAVING = 'view-leaving';
  var CSS_TRANSITIONING = 'transitioning';
  var CSS_NAV_FORWARD = 'nav-forward';
  var CSS_NAV_BACK = 'nav-back';
  var CSS_VIEW_ACTIVE = 'view-active';

  // history actions while navigating views
  var ACTION_INITIAL_VIEW = 'initialView';
  var ACTION_NEW_VIEW = 'newView';
  var ACTION_MOVE_BACK = 'moveBack';
  var ACTION_MOVE_FORWARD = 'moveForward';
  var ACTION_NO_CHANGE = 'noChange';
  var ACTION_DISABLED_BY_TAG_NAME = 'disabledByTagName';

  // physical direction of navigation
  var DIRECTION_BACK = 'back';
  var DIRECTION_FORWARD = 'forward';

  // event types to listen for when a transition has ended
  var EVENT_ANIMATIONEND = 'webkitAnimationEnd animationend';

  // transitionTotal is used to know which is the most recent
  var transitionTotal = 0;

  // keep a list of all the transition styles that were used
  // so its easy to remove them
  var usedTransitionStyles = [];

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
        rsp.action = ACTION_NO_CHANGE;
        console.log('VIEW', rsp);
        return rsp;
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
        if(viewLocals && viewLocals.$$state) {
          // check if this new view is one that already exists in another history
          var vwName, vw;
          for(vwName in viewHistory.views) {
            vw = viewHistory.views[ vwName ];

            if( hist.historyId !== vw.historyId &&
                vw.stateName === viewLocals.$$state.toString() ) {
              rsp.viewId = vw.viewId;
              rsp.historyId = vw.historyId;
              rsp.action = 'existingHistory';
              alreadyExists = true;
              break;
            }
          }
        }

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
      // each transition is given an ID, later used to make
      // sure complete() is only ran on the most recent transition
      transitionTotal = transitionTotal > 999 ? 0 : transitionTotal + 1;
      var transitionId = transitionTotal;

      // injected registerData used for testing
      registerData = registerData || this.register(navViewScope, viewLocals);

      var direction = registerData.direction;
      var doAnimation, transitionStyle;

      // injected enteringView used for testing
      enteringView = enteringView || getViewById(registerData.viewId) || {};

      var enteringDeferred = $q.defer();
      var leavingDeferred = $q.defer();

      // get a reference to an entering/leaving element if they exist
      // loop through to see if the view is already in the navViewElement
      var enteringEle, leavingEle;
      var x, viewElements = navViewElement.children();
      var enteringEleIdentifier = getViewElementIdentifier(viewLocals, enteringView);
      for(x=0, l=viewElements.length; x<l; x++) {
        if(enteringEleIdentifier && viewElements.eq(x).data(DATA_ELE_IDENTIFIER) == enteringEleIdentifier) {
          // we found an existing element in the DOM that should be entering the view
          enteringEle = viewElements.eq(x);

        } else if(viewElements.eq(x).data(DATA_VIEW_IS_ACTIVE)) {
          // this element is currently the active one, so it will be the leaving element
          leavingEle = viewElements.eq(x);
        }
      }

      // if we got an entering element than it's already in the DOM
      var alreadyInDom = !!enteringEle;

      if(!enteringEle && registerData.ele) {
        // already created a new element within the register
        // instead of doing it twice, just use the one we go from register
        enteringEle = registerData.ele;
      }

      if(!enteringEle) {
        // still no existing element to use
        // create it using existing template/scope/locals
        enteringEle = createViewElement(viewLocals);
      }

      function validComplete(ev, complete) {
        // only listen for <ion-view> transition ends
        if(ev && ev.target.tagName !== 'ION-VIEW') return;

        // only the most recent transitionend event should do something
        if(!doAnimation || transitionId === transitionTotal) {
          // the most recent transitionend just happend
          ev && ev.stopPropagation();
          complete();

        } else {
          // this isn't the most recent transitionend
          // clean it up, but don't fire the callback
          enteringDeferred.reject();
          leavingDeferred.reject();
          cleanup();
        }
      }

      function onEnteringComplete(ev) {
        validComplete(ev, function(){
          enteringDeferred.resolve();
        });
      }

      function onLeavingComplete(ev) {
        validComplete(ev, function(){
          leavingDeferred.resolve();
        });
      }

      enteringDeferred.promise.finally(function(){
        if(enteringEle) {
          enteringEle.off(EVENT_ANIMATIONEND, onEnteringComplete);

          var enteringScope = jqLite(enteringEle).scope();
          if(enteringScope) {
            var enteringData = {
              action: registerData.action,
              direction: direction,
              showBack: registerData.showBack
            };
            enteringScope.$broadcast('$ionicView.afterEnter', enteringData);
            enteringScope.$broadcast('$viewContentLoaded', enteringData);
          }
        }
      });

      leavingDeferred.promise.finally(function(){
        if(leavingEle) {
          leavingEle.off(EVENT_ANIMATIONEND, onLeavingComplete);

          var leavingScope = jqLite(leavingEle).scope();
          if(leavingScope) {
            leavingScope.$broadcast('$ionicView.afterLeave', {
              direction: registerData.direction
            });
          }
        }
      });

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
          trans.setStyle();

          trans.stage()
            .then(function(){
              return trans.compileAndLink();
            })
            .then(function(){
              return trans.start();
            })
            .then(function(){
              trans.complete();
            });
        },

        setStyle: function() {
          // Priorities of which transition style to use
          // 1) From the entering view elements's "transition-style" attribute
          // 2) $stateProvider.state views transitionStyle
          // 3) $ionicConfig.viewTransition global setting
          // 4) if none of the above, default to 'platform'

          // first get the global view transition type
          var viewTransition = $ionicConfig.viewTransition || 'platform';

          // next see if this specific view has a transition type
          if(viewLocals && viewLocals.views) {
            for(var n in viewLocals.views) {
              if(viewLocals.views[n].transition) {
                viewTransition = viewLocals.views[n].transition;
              }
            }
          }

          // next see if the enteringEle itself has an attribute
          var elementTransitionStyle = enteringEle && enteringEle.attr('transition-style');
          if(elementTransitionStyle) {
            viewTransition = elementTransitionStyle;
          }

          // set if this transition should animate or not
          // the direction needs to be going either forward or back
          // AND there can't be a transition type of 'none'
          doAnimation = (direction == DIRECTION_BACK || direction == DIRECTION_FORWARD) && (viewTransition !== 'none');

          // figure out which transition style to use
          if(viewTransition == 'platform') {
            // if this is a platform transition, then we need to figure out which platform this is first
            transitionStyle = ionic.Platform.platform() + '-slide';

          } else {
            // use the given transition config
            transitionStyle = viewTransition;
          }
          transitionStyle += '-transition';
          transitionStyle = 'slide-transition';

          // if we've never see this style before add it so it's easy to remove them all later
          var isNewTransitionStyle = true;
          for(var x=0; x<usedTransitionStyles.length; x++) {
            if(usedTransitionStyles[x]==transitionStyle) {
              isNewTransitionStyle = false;
              break;
            }
          }
          if(isNewTransitionStyle) {
            usedTransitionStyles.push(transitionStyle);
          }

          // returns data for testing
          return {
            animation: doAnimation,
            style: transitionStyle
          };
        },

        stage: function() {
          // stage where the will be BEFORE the transition starts
          var deferred = $q.defer();

          $ionicClickBlock.show();

          if(doAnimation) {
            // an animated transition should happen

            // add which transition style will be used
            classToggle(navViewElement, transitionStyle);

            // remove any transition styles that shouldn't
            // be there, but have been used in the past
            for(var x=0; x<usedTransitionStyles.length; x++) {
              if(usedTransitionStyles[x] !== transitionStyle) {
                classToggle(navViewElement, 0, usedTransitionStyles[x]);
              }
            }

            // set which navigation direction is happening
            if(direction == DIRECTION_BACK) {
              // add nav-back and remove nav-forward
              classToggle(navViewElement, CSS_NAV_BACK, CSS_NAV_FORWARD);

            } else {
              // add nav-forward and remove nav-back
              classToggle(navViewElement, CSS_NAV_FORWARD, CSS_NAV_BACK);
            }

            // set that the entering element, is um, entering
            // and remove the leaving css class if its there
            classToggle(enteringEle, CSS_VIEW_ENTERING, CSS_VIEW_LEAVING);

            // set the leaving class on the leaving element
            classToggle(leavingEle, CSS_VIEW_LEAVING, CSS_VIEW_ENTERING);

            $timeout(function(){
              // attempt to make sure it all gets reflected in the DOM
              deferred.resolve();
            });

          } else {
            // no animation
            deferred.resolve();
          }

          return deferred.promise;
        },

        compileAndLink: function() {
          var deferred = $q.defer();

          if(!alreadyInDom) {
            // the entering element is not already in the DOM
            // hasn't been compiled and isn't linked up yet

            if(doAnimation) {
              // have the entering ele display:none when it hits the DOM
              // in hopes to reduce reflows while it links
              classToggle(enteringEle, CSS_HIDE);
            }

            // add the DATA_CACHE_VIEW data
            // if the current state has cache:false
            // or the element has cache-view="false" attribute
            if( (viewLocals && viewLocals.$$state.self.cache === false) ||
                (enteringEle.attr('cache-view') == 'false') ) {
              enteringEle.data(DATA_CACHE_VIEW, false);
            }

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

          if( !enteringEle.data(DATA_ELE_IDENTIFIER) ) {
            // existing elements in the DOM are looked up by their state name and state id
            enteringEle.data(DATA_ELE_IDENTIFIER, getViewElementIdentifier(viewLocals, enteringView) );
          }

          if(doAnimation) {
            // add the event listeners for the transitionend event
            // so we know when both transitions have completed
            enteringEle.on(EVENT_ANIMATIONEND, onEnteringComplete);

            if(leavingEle) {
              // add the transitionend event listener to
              // the leaving element if it exists
              leavingEle.on(EVENT_ANIMATIONEND, onLeavingComplete);

            } else {
              // there was no leaving element, auto resolve the transition has ended
              onLeavingComplete();
            }

            // give it a $timeout in hopes to not continue until after digest
            $timeout(function(){
              deferred.resolve();
            }, 10);

          } else {
            deferred.resolve();
          }

          return deferred.promise;
        },

        start: function() {
          // transitions all the views together
          // remove the "hide" class from the entering element
          classToggle(enteringEle, 0, CSS_HIDE);

          if(doAnimation) {
            // start transitioning the two views

            // give it a $timeout to make sure the DOM has been updated
            // after the "hide" class has been removed from the entering element
            $timeout(function(){
              classToggle(navViewElement, CSS_TRANSITIONING);
            }, 20);

          } else {
            // add "hide" class to the leaving element
            classToggle(leavingEle, CSS_HIDE);

            // there was no asnyc transition, just auto resolve them
            onEnteringComplete();
            onLeavingComplete();
          }

          jqLite(enteringEle).scope().$broadcast('$ionicView.beforeEnter', {
            direction: registerData.direction,
            showBack: registerData.showBack
          });

          if(leavingEle) {
            jqLite(leavingEle).scope().$broadcast('$ionicView.beforeLeave', {
              direction: registerData.direction
            });
          }

          return $q.all([ enteringDeferred.promise, leavingDeferred.promise ]);
        },

        complete: function() {
          // remove the transitions css
          navViewElement.removeClass(CSS_TRANSITIONING)
                        .removeClass(transitionStyle)
                        .removeClass(CSS_NAV_FORWARD)
                        .removeClass(CSS_NAV_BACK);

          // remove the all transition css classes
          var viewElements = navViewElement.children();
          var viewElement;
          var activeStateId = enteringEle.data(DATA_ELE_IDENTIFIER);

          // update/ensure each view element has the correct classes
          for(var x=0, l=viewElements.length; x<l; x++) {
            viewElement = viewElements.eq(x);

            // all child views should have these classes removed
            viewElement.removeClass(CSS_VIEW_LEAVING)
                       .removeClass(CSS_VIEW_ENTERING);

            if(activeStateId && viewElement.data(DATA_ELE_IDENTIFIER) == activeStateId) {
              // ONLY the active view
              viewElement.removeClass(CSS_HIDE)
                         .addClass(CSS_VIEW_ACTIVE)
                         .data(DATA_VIEW_IS_ACTIVE, true);

            } else {
              // all EXCEPT the active view
              viewElement.addClass(CSS_HIDE)
                         .removeClass(CSS_VIEW_ACTIVE)
                         .data(DATA_VIEW_IS_ACTIVE, false);
            }
          }

          // the view may have an onload attribute, if so do something
          //if (navViewAttrs.onload) view.scope.$eval(navViewAttrs.onload);

          // remove any DOM nodes according to the removal policy
          trans.runRemovalPolicy();

          // clean up any references that could cause memory issues
          cleanup();

          // allow clicks to hapen again after the transition
          $ionicClickBlock.hide();
        },

        runRemovalPolicy: function() {
          var removableEle;

          if( direction == DIRECTION_BACK && leavingEle ) {
            // if they just navigated back we can destroy the forward view
            removableEle = leavingEle;

          } else if( leavingEle && leavingEle.data(DATA_CACHE_VIEW) === false ) {
            // remove if the leaving element has DATA_CACHE_VIEW===false
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
          return enteringEle && (direction != ACTION_NO_CHANGE);
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
