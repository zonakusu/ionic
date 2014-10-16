IonicModule
.controller('$ionNavBar', [
  '$scope',
  '$element',
  '$attrs',
  '$compile',
  '$animate',
  '$ionicHistory',
  '$ionicNavBarDelegate',
function($scope, $element, $attrs, $compile, $animate, $ionicHistory, $ionicNavBarDelegate) {

  var CSS_HIDE = 'hide';
  var CSS_BACK_BUTTON_HIDE = 'back-button-hide';
  var DATA_NAV_BAR_CTRL = '$ionNavBarController';
  var PRIMARY_BUTTONS = 'primaryButtons';
  var SECONDARY_BUTTONS = 'secondaryButtons';
  var BACK_BUTTON = 'backButton';

  var self = this;
  var headerBars = [];
  var navElementHtml = {};
  var title, previousTitle;
  var isShown;

  $element.parent().data(DATA_NAV_BAR_CTRL, self);

  var deregisterInstance = $ionicNavBarDelegate._registerInstance(this, $attrs.delegateHandle);


  self.init = function() {
    // create two nav bar blocks which will trade out which one is shown
    for (var x=0; x<2; x++) {
      headerBars.push( self.createHeaderBar( $attrs.class ) );
    }
  };


  self.createHeaderBar = function(navBarClass) {
    var isBackShown;
    var containerEle = jqLite( '<div class="nav-bar-block nav-bar-cache">' );
    var headerBarEle = jqLite( '<ion-header-bar class="nav-bar">' ).addClass(navBarClass).addClass(CSS_BACK_BUTTON_HIDE);
    var titleEle = jqLite('<div class="title">');
    var navEle = {};
    var lastViewBtnsEle = {};

    navEle[BACK_BUTTON] = self.createBackButtonElement(headerBarEle);
    navEle[PRIMARY_BUTTONS] = self.createNavElement(headerBarEle, PRIMARY_BUTTONS);
    headerBarEle.append(titleEle);
    navEle[SECONDARY_BUTTONS] = self.createNavElement(headerBarEle, SECONDARY_BUTTONS);

    containerEle.append(headerBarEle);

    $element.append( $compile(containerEle)($scope) );

    var headerBarCtrl = headerBarEle.data('$ionHeaderBarController');

    var headerBarInstance = {
      isActive: false,
      showBack: function(shouldShow) {
        if(shouldShow && !isBackShown) {
          headerBarEle.removeClass(CSS_BACK_BUTTON_HIDE);
        } else if (!shouldShow && isBackShown) {
          headerBarEle.addClass(CSS_BACK_BUTTON_HIDE);
        }
        isBackShown = shouldShow;
      },
      title: function(newTitle) {
        headerBarCtrl.title(newTitle);
      },
      setViewButtons: function(viewBtnsEle, side) {
        // first make sure any exiting view buttons have been removed
        headerBarInstance.removeViewButtons(side);

        if (viewBtnsEle) {
          // there's a view button for this side
          if (side == SECONDARY_BUTTONS) {
            // secondary buttons go immediate after the title element
            titleEle.after(viewBtnsEle);

          } else if (navEle[BACK_BUTTON]) {
            // primary buttons should go after the back button
            navEle[BACK_BUTTON].after(viewBtnsEle);

          } else {
            // primary buttons should be the first child element if no back button
            headerBarEle.prepend(viewBtnsEle);
          }

          // make sure the default button on this side is hidden
          if (navEle[side]) {
            navEle[side].addClass(CSS_HIDE);
          }
          lastViewBtnsEle[side] = viewBtnsEle;

        } else if (navEle[side]) {
          // there's a default button for this side and no view button
          navEle[side].removeClass(CSS_HIDE);
        }
      },
      removeViewButtons: function(side) {
        if (lastViewBtnsEle[side]) {
          lastViewBtnsEle[side].remove();
          lastViewBtnsEle[side] = null;
        }
      },
      render: function(callback) {
        ionic.requestAnimationFrame(function(){
          callback && callback();
        });
      },
      containerEle: function() {
        return containerEle;
      },
      headerBarEle: function() {
        return headerBarEle;
      },
      destroy: function() {
        containerEle = headerBarEle = titleEle = navEle[PRIMARY_BUTTONS] = navEle[SECONDARY_BUTTONS] = navEle[BACK_BUTTON] = viewBtnsEle[PRIMARY_BUTTONS] = viewBtnsEle[SECONDARY_BUTTONS] = null;
      }
    };
    return headerBarInstance;
  };


  self.registerNavElement = function(html, type) {
    navElementHtml[type] = html;
  };


  self.updateNavBar = function(viewData) {
    self.enable();
    var enteringHeaderBar = getOffScreenHeaderBar();

    // update the entering header bar's title
    self.title(viewData.title, enteringHeaderBar);

    // update if the entering header should show the back button or not
    self.showBackButton(viewData.showBack, enteringHeaderBar);

    // update the buttons, depending if the view has their own or not
    enteringHeaderBar.setViewButtons(viewData.primaryButtons, PRIMARY_BUTTONS);
    enteringHeaderBar.setViewButtons(viewData.secondaryButtons, SECONDARY_BUTTONS);

    // render/place the elements in the correct locations
    enteringHeaderBar.render(function(){

      // begin transition of entering and leaving header bars
      self.transition(enteringHeaderBar, getOnScreenHeaderBar(), viewData.transition, viewData.direction);

    });

  };


  self.transition = function(enteringHeaderBar, leavingHeaderBar, transition, direction) {

    // start transitioning the entering/leaving header-bars
    $animate.transition( 'nav-bar', transition, direction, enteringHeaderBar.containerEle(), leavingHeaderBar && leavingHeaderBar.containerEle()).then(function(){

      // transition done, reset header-bar is the active one
      for (var x=0; x<headerBars.length; x++) {
        headerBars[x].isActive = false;
      }
      enteringHeaderBar.isActive = true;

      if (leavingHeaderBar) {
        // the header bar that left no longer needs to have it's view buttons
        ionic.requestAnimationFrame(function(){
          leavingHeaderBar.removeViewButtons(PRIMARY_BUTTONS);
          leavingHeaderBar.removeViewButtons(SECONDARY_BUTTONS);
        });
      }

    });

  };


  self.showBar = function(show) {
    if (show && !isShown) {
      $element.removeClass(CSS_HIDE);
    } else if (!show && isShown) {
      $element.addClass(CSS_HIDE);
    }
    $scope.$parent.$hasHeader = !!show;
    isShown = show;
  };


  self.showBackButton = function(show, headerBar) {
    headerBar = headerBar || getOnScreenHeaderBar();
    headerBar && headerBar.showBack(show);
  };


  self.title = function(val, headerBar) {
    if (arguments.length) {
      previousTitle = title;
      title = val || '';
      headerBar = headerBar || getOnScreenHeaderBar();
      headerBar && headerBar.title(title);
    }
    return title;
  };


  self.getPreviousTitle = function() {
    return previousTitle;
  };


  self.enable = function() {
    // set primary to show first
    self.showBar(true);

    // set non primary to hide second
    for (var x=0; x<$ionicNavBarDelegate._instances.length; x++) {
      if ($ionicNavBarDelegate._instances[x] !== self) $ionicNavBarDelegate._instances[x].showBar(false);
    }
  };


  self.createBackButtonElement = function(headerBarEle) {
    if ( navElementHtml[BACK_BUTTON] ) {
      var ele = self.createNavElement(headerBarEle, BACK_BUTTON);
      if (!ele.attr('ng-click')) {
        ele.attr('ng-click', '$goBack()');
      }
      return ele;
    }
  };


  self.createNavElement = function(headerBarEle, type) {
    if ( navElementHtml[type] ) {
      var ele = jqLite(navElementHtml[type]);
      headerBarEle.append(ele);
      return ele;
    }
  };


  function getOnScreenHeaderBar() {
    for (var x=0; x<headerBars.length; x++) {
      if (headerBars[x].isActive) return headerBars[x];
    }
  }


  function getOffScreenHeaderBar() {
    for (var x=0; x<headerBars.length; x++) {
      if (!headerBars[x].isActive) return headerBars[x];
    }
    return headerBars[0];
  }


  $scope.$goBack = self.back = function() {
    var backView = $ionicHistory.backView();
    backView && backView.go();
  };


  $scope.$on('$destroy', function(){
    $element.parent().removeData(DATA_NAV_BAR_CTRL);
    for (var x=0; x<headerBars.length; x++) {
      headerBars[x].destroy();
    }
    headerBars = null;
    deregisterInstance();
  });

}]);

