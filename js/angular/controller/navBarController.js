IonicModule
.controller('$ionicNavBar', [
  '$scope',
  '$element',
  '$attrs',
  '$ionicHistory',
  '$animate',
  '$compile',
  '$ionicNavBarDelegate',
function($scope, $element, $attrs, $ionicHistory, $animate, $compile, $ionicNavBarDelegate) {
  //Let the parent know about our controller too so that children of
  //sibling content elements can know about us
  var CSS_NAV_BAR_ACTIVE = 'nav-bar-active';
  var CSS_NAV_BAR_ENTERING = 'nav-bar-entering';
  var CSS_NAV_BAR_LEAVING = 'nav-bar-leaving';
  var CSS_HIDE = 'hide';
  var DATA_IS_ACTIVE = '$isActive';
  var DATA_IS_USED = '$isUsed';
  var DATA_TITLE = '$title';

  $element.parent().data('$ionNavBarController', this);

  var deregisterInstance = $ionicNavBarDelegate._registerInstance(this, $attrs.delegateHandle);

  $scope.$on('$destroy', function(){
    $element.parent().removeData('$ionNavBarController');
    this._rightButtons = null;
    this._leftButtons = null;
    deregisterInstance();
  });

  this.beforeEnter = function(viewData) {
    this.enable();

    var navBarElements = getNavBarElements();
    var enteringEle;
    var leavingEle;
    var x, l = navBarElements.length;

    // find the active element that should leave
    for (x=0; x<l; x++) {
      if ( navBarElements.eq(x).data(DATA_IS_ACTIVE) ) {
        leavingEle = navBarElements.eq(x);
        leavingEle.data(DATA_IS_USED, true);
        leavingEle.data(DATA_IS_ACTIVE, false);
      }
    }

    // find an available element that's not being used
    for (x=0; x<l; x++) {
      if ( !navBarElements.eq(x).data(DATA_IS_USED) ) {
        enteringEle = navBarElements.eq(x);
        enteringEle.data(DATA_IS_USED, true);
        break;
      }
    }

    if (enteringEle) {
      this.renderActive(enteringEle, viewData);
    }

    this.transition(enteringEle, leavingEle, viewData);
  };

  this.renderActive = function(navBarEle, viewData) {
    setTitleElement(viewData.title, navBarEle);

    var backButtonEle = getBackButtonElement();
    if (backButtonEle) {
      if (viewData.showBack) {
        backButtonEle.removeClass('hide');
      } else {
        backButtonEle.addClass('hide');
      }
    }

    if (this._leftButtons) {
      setButtonsElement(this._leftButtons, 'left', navBarEle);
    }

    if (this._rightButtons) {
      setButtonsElement(this._rightButtons, 'right', navBarEle);
    }

  };

  this.transition = function(enteringEle, leavingEle, viewData) {
    if (enteringEle) {
      enteringEle.data(DATA_IS_ACTIVE, true);
      enteringEle.removeClass(CSS_HIDE);
    }

    var navBarElements = getNavBarElements();
    var ele;
    for (var x=0, l=navBarElements.length; x<l; x++) {
      ele = navBarElements.eq(x);
      ele.data(DATA_IS_USED, false);
      if ( !ele.data(DATA_IS_ACTIVE) ) {
        ele.addClass(CSS_HIDE);
      }
    }

  };

  this._enableBar = function(enable) {
    $scope.isInvisible = !enable;
    if (enable) {
      $element.removeClass('hide');
    } else {
      $element.addClass('hide')
    }
  };

  this.enable = function() {
    for (var x=0; x<$ionicNavBarDelegate._instances.length; x++) {
      //console.log('enable', this.myId(), $ionicNavBarDelegate._instances[x].myId(), $ionicNavBarDelegate._instances[x].myId() === this.myId())
      $ionicNavBarDelegate._instances[x]._enableBar( $ionicNavBarDelegate._instances[x] === this );
    }
  };

  this.showBar = function(show) {
    if (arguments.length) {
      $scope.isInvisible = !show;
      $scope.$parent.$hasHeader = !!show;
    }
    return !$scope.isInvisible;
  };

  function getNavBarElements() {
    return jqLite( $element[0].querySelectorAll('.nav-bar-container') );
  }

  function getBackButtonElement() {
    var ele = $element[0].querySelector('.back-button');
    if (ele) {
      return jqLite(ele);
    }
  }

  function getActiveElement() {
    var navBarElements = getNavBarElements();
    var x, l=navBarElements.length;
    for (x=0; x<l; x++) {
      if (navBarElements.eq(x).data(DATA_IS_ACTIVE)) {
        return navBarElements.eq(x);
      }
    }
    if (l) {
      navBarElements.eq(x).data(DATA_IS_ACTIVE, true);
      return navBarElements.eq(0);
    }
  }

  function setTitleElement(title, navBarEle) {
    $scope.oldTitle = $scope.title;
    $scope.title = title = title || '';

    if (navBarEle) {
      var titleEle = navBarEle[0].querySelector('.title');
      if (titleEle) {
        titleEle = jqLite(titleEle);
        if (titleEle.data(DATA_TITLE) !== title) {
          // only make an update if there is a title change
          titleEle.html(title);
          titleEle.data(DATA_TITLE, title);
        }
      }
    }
  }

  function setButtonsElement(buttons, side, navBarEle) {
    if (navBarEle) {
      var navBarButtonEle = navBarEle[0].querySelector('.' + side + '-buttons');
      if (navBarButtonEle) {
        jqLite(navBarButtonEle).append( buttons );
      }
    }
  }

  this.setTitle = function(title) {
    setTitleElement(title, getActiveElement());
  };

  this.getTitle = function() {
    return $scope.title || '';
  };

  this.getPreviousTitle = function() {
    return $scope.oldTitle || '';
  };

  this.showBackButton = function(show) {
    if (arguments.length) {
      $scope.backButtonShown = !!show;
    }
    return !!($scope.hasBackButton && $scope.backButtonShown);
  };

  this.back = function() {
    var backView = $ionicHistory.backView();
    backView && backView.go();
    return false;
  };

  this.registerButtons = function(buttons, side) {
    if (side === 'right') {
      this._rightButtons = buttons;
    } else {
      this._leftButtons = buttons;
    }
  };

}]);

