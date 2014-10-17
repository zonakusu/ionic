IonicModule
.controller('$ionNavBar', [
  '$scope',
  '$element',
  '$attrs',
  '$compile',
  '$animate',
  '$ionicHistory',
  '$ionicNavBarDelegate',
  '$ionicConfig',
function($scope, $element, $attrs, $compile, $animate, $ionicHistory, $ionicNavBarDelegate, $ionicConfig) {

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
  var navBarConfig = $ionicConfig.navBar;

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
    var headerBarEle = jqLite( '<ion-header-bar>' ).addClass(navBarClass).addClass(CSS_BACK_BUTTON_HIDE);
    var titleEle = jqLite('<div class="title">');
    var navEle = {};
    var lastViewBtnsEle = {};
    var leftButtonsEle, rightButtonsEle;

    // append title in the header, this is the rock to where buttons append
    navEle[BACK_BUTTON] = self.createBackButtonElement(headerBarEle);
    headerBarEle.append(titleEle);

    // create default button elements
    navEle[PRIMARY_BUTTONS] = createNavElement(PRIMARY_BUTTONS);
    navEle[SECONDARY_BUTTONS] = createNavElement(SECONDARY_BUTTONS);

    // append and position buttons
    positionButtons(navEle[PRIMARY_BUTTONS], PRIMARY_BUTTONS);
    positionButtons(navEle[SECONDARY_BUTTONS], SECONDARY_BUTTONS);

    // compile header and append to the DOM
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
          positionButtons(viewBtnsEle, side);

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
      render: function() {
        headerBarCtrl.alignTitle();
      },
      containerEle: function() {
        return containerEle;
      },
      headerBarEle: function() {
        return headerBarEle;
      },
      primaryButtonsEle: function() {
        return navEle[PRIMARY_BUTTONS];
      },
      secondaryButtonsEle: function() {
        return navEle[SECONDARY_BUTTONS];
      },
      backButtonEle: function() {
        return navEle[BACK_BUTTON];
      },
      destroy: function() {
        containerEle = headerBarEle = titleEle = leftButtonsEle = rightButtonsEle = navEle[PRIMARY_BUTTONS] = navEle[SECONDARY_BUTTONS] = navEle[BACK_BUTTON] = viewBtnsEle[PRIMARY_BUTTONS] = viewBtnsEle[SECONDARY_BUTTONS] = null;
      }
    };

    function positionButtons(btnsEle, buttonType) {
      if (!btnsEle) return;

      var appendToRight = (buttonType == SECONDARY_BUTTONS && navBarConfig.positionSecondaryButtons() != 'left') ||
                          (buttonType == PRIMARY_BUTTONS && navBarConfig.positionPrimaryButtons() == 'right');

      if (appendToRight) {
        // right side
        if (!rightButtonsEle) {
          rightButtonsEle = jqLite('<div class="buttons">');
          headerBarEle.append(rightButtonsEle);
        }
        if (buttonType == SECONDARY_BUTTONS) {
          rightButtonsEle.append(btnsEle);
        } else {
          rightButtonsEle.prepend(btnsEle);
        }

      } else {
        // left side
        if (!leftButtonsEle) {
          leftButtonsEle = jqLite('<div class="buttons">');
          if (navEle[BACK_BUTTON]) {
            navEle[BACK_BUTTON].after(leftButtonsEle);
          } else {
            headerBarEle.prepend(leftButtonsEle);
          }
        }
        if (buttonType == SECONDARY_BUTTONS) {
          leftButtonsEle.append(btnsEle);
        } else {
          leftButtonsEle.prepend(btnsEle);
        }
      }

    }

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
    enteringHeaderBar.render();

    // begin transition of entering and leaving header bars
    self.transition(enteringHeaderBar, getOnScreenHeaderBar(), viewData.transition, viewData.direction);

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
      var ele = createNavElement(BACK_BUTTON);
      headerBarEle.append(ele);
      if (!ele.attr('ng-click')) {
        ele.attr('ng-click', '$goBack()');
      }
      return ele;
    }
  };


  function createNavElement(type) {
    if ( navElementHtml[type] ) {
      return jqLite(navElementHtml[type]);
    }
  }


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
    $scope.$parent.$hasHeader = false;
    $element.parent().removeData(DATA_NAV_BAR_CTRL);
    for (var x=0; x<headerBars.length; x++) {
      headerBars[x].destroy();
    }
    headerBars = null;
    deregisterInstance();
  });

}]);

