IonicModule
.controller('$ionicNavBar', [
  '$scope',
  '$element',
  '$attrs',
  '$ionicViewService',
  '$animate',
  '$compile',
  '$ionicNavBarDelegate',
function($scope, $element, $attrs, $ionicViewService, $animate, $compile, $ionicNavBarDelegate) {
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

  $scope.$on('$destroy', deregisterInstance);

  this.navBarEnter = function(viewData) {
    var navBarElements = getNavBarElements();
    var enteringEle;
    var leavingEle;
    var x, l = navBarElements.length;

    // find the active element that should leave
    for(x=0; x<l; x++) {
      if( navBarElements.eq(x).data(DATA_IS_ACTIVE) ) {
        leavingEle = navBarElements.eq(x);
        leavingEle.data(DATA_IS_USED, true);
        leavingEle.data(DATA_IS_ACTIVE, false);
      }
    }

    // find an available element that's not being used
    for(x=0; x<l; x++) {
      if( !navBarElements.eq(x).data(DATA_IS_USED) ) {
        enteringEle = navBarElements.eq(x);
        enteringEle.data(DATA_IS_USED, true);
        break;
      }
    }

    if(enteringEle) {
      this.renderActive(enteringEle, viewData);
    }

    this.transition(enteringEle, leavingEle, viewData);
  };

  this.renderActive = function(ele, viewData) {
    setElementTitle(viewData.title, ele);

    var backButtonEle = getBackButtonElement();
    if(backButtonEle) {
      if(viewData.showBack) {
        backButtonEle.removeClass('hide');
      } else {
        backButtonEle.addClass('hide');
      }
    }

  };

  this.transition = function(enteringEle, leavingEle, viewData) {
    if(enteringEle) {
      enteringEle.data(DATA_IS_ACTIVE, true);
      enteringEle.removeClass(CSS_HIDE);
    }

    var navBarElements = getNavBarElements();
    var ele;
    for(var x=0, l=navBarElements.length; x<l; x++) {
      ele = navBarElements.eq(x);
      ele.data(DATA_IS_USED, false);
      if( !ele.data(DATA_IS_ACTIVE) ) {
        ele.addClass(CSS_HIDE);
      }
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
    if(ele) {
      return jqLite(ele);
    }
  }

  function getActiveElement() {
    var navBarElements = getNavBarElements();
    for(var x=0, l=navBarElements.length; x<l; x++) {
      if(navBarElements(x).data(DATA_IS_ACTIVE)) {
        return navBarElements(x);
      }
    }
  }

  function setElementTitle(title, ele) {
    $scope.oldTitle = $scope.title;
    $scope.title = title = title || '';

    if(ele) {
      var titleEle = ele[0].querySelector('.title');
      if(titleEle) {
        titleEle = jqLite(titleEle);
        if(titleEle.data(DATA_TITLE) !== title) {
          // only make an update if there is a title change
          titleEle.html(title);
          titleEle.data(DATA_TITLE, title);
        }
      }
    }
  }

  this.setTitle = function(title) {
    setElementTitle(title, getActiveElement());
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
    var backView = $ionicViewService.getBackView();
    backView && backView.go();
    return false;
  };


  // var self = this;

  // this.leftButtonsElement = jqLite(
  //   $element[0].querySelector('.buttons.left-buttons')
  // );
  // this.rightButtonsElement = jqLite(
  //   $element[0].querySelector('.buttons.right-buttons')
  // );

  // this.align = function(direction) {
  //   this._headerBarView.align(direction);
  // };

}]);

