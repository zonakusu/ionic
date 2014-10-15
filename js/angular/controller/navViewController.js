IonicModule
.controller('$ionNavView', [
  '$scope',
  '$element',
  '$attrs',
  '$ionicHistory',
  '$ionicViewSwitcher',
function($scope, $element, $attrs, $ionicHistory, $ionicViewSwitcher) {
  var self = this;
  var direction;
  var isPrimary = true;
  var navViewName;

  self.init = function() {
    navViewName = $attrs.name || '';

    // Find the details of the parent view directive (if any) and use it
    // to derive our own qualified view name, then hang our own details
    // off the DOM so child directives can find it.
    var parent = $element.parent().inheritedData('$uiView');
    var parentViewName = ((parent && parent.state) ? parent.state.name : '');
    if (navViewName.indexOf('@') < 0) navViewName  = navViewName + '@' + parentViewName;

    var viewData = { name: navViewName, state: null };
    $element.data('$uiView', viewData);

    return viewData;
  };


  self.register = function(viewLocals) {
    var registerData = $ionicHistory.register($scope, viewLocals);

    self.update(registerData);

    // begin rendering
    self.render(registerData.viewId, viewLocals, registerData);
  };


  self.update = function(registerData) {
    // always reset that this is the primary navView
    isPrimary = true;

    // remember what direction this navView should use
    // this may get updated later by a child navView
    direction = registerData.direction;

    var parentNavViewCtrl = $element.parent().inheritedData('$ionNavViewController');
    if (parentNavViewCtrl) {
      // this navView is nested inside another one
      // update the parent to use this direction and not
      // the another it originally was set to

      // inform the parent navView that it is not the primary navView
      parentNavViewCtrl.isPrimary(false);

      if (direction === 'enter' || direction === 'exit') {
        // they're entering/exiting a history
        // find parent navViewController
        parentNavViewCtrl.direction(direction);

        if (direction === 'enter') {
          // reset the direction so this navView doesn't animate
          // because it's parent will
          direction = 'none';
        }

      }

    }

  };


  self.beforeEnter = function(transData) {
    if (isPrimary) {
      var associatedNavBarCtrl = getAssociatedNavBarCtrl();
      associatedNavBarCtrl && associatedNavBarCtrl.beforeEnter(transData);
    }
  };


  self.showBar = function(val) {
    var associatedNavBarCtrl = getAssociatedNavBarCtrl();
    associatedNavBarCtrl && associatedNavBarCtrl.showBar(val);
  };


  self.showBackButton = function(val) {
    var associatedNavBarCtrl = getAssociatedNavBarCtrl();
    associatedNavBarCtrl && associatedNavBarCtrl.showBackButton(val);
  };


  self.isPrimary = function(val) {
    if (arguments.length) {
      isPrimary = val;
    }
    return isPrimary;
  };


  self.direction = function(val) {
    if (arguments.length) {
      direction = val;
    }
    return direction;
  };


  self.hasNestedNavView = function(val) {
    if (arguments.length) {
      hasNestedNavView = val;
    }
    return hasNestedNavView;
  };


  self.render = function(viewId, viewLocals, registerData) {
    var enteringView = $ionicHistory.getViewById(viewId) || {};

    // register the view and figure out where it lives in the various
    // histories and nav stacks along with how views should enter/leave
    var switcher = $ionicViewSwitcher.create($scope, $element, viewLocals, enteringView);

    // init the rendering of views for this navView directive
    switcher.init(function(){
      // compiled, in the dom and linked, now animate
      switcher.transition( self.direction(), registerData.showBack );
    });

  };


  function getAssociatedNavBarCtrl() {
    return $element.inheritedData('$ionNavBarController');
  }

}]);
