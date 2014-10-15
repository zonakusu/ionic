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

  var CSS_NAV_BAR_ACTIVE = 'nav-bar-active';
  var CSS_NAV_BAR_ENTERING = 'nav-bar-entering';
  var CSS_NAV_BAR_LEAVING = 'nav-bar-leaving';
  var CSS_HIDE = 'hide';
  var DATA_NAV_BAR_CTRL = '$ionNavBarController';

  var self = this;
  var navBarContainers = [];
  var primaryBtnsHtml, secondaryBtnsHtml;
  var backBtnTemplateEle;
  var hasBackBtnText = false;
  var title, previousTitle;
  var isShown;

  $element.parent().data(DATA_NAV_BAR_CTRL, self);

  var deregisterInstance = $ionicNavBarDelegate._registerInstance(this, $attrs.delegateHandle);


  self.init = function() {
    for (var x=0; x<2; x++) {
      navBarContainers.push( self.createNavBarBlock(backBtnTemplateEle, primaryBtnsHtml, secondaryBtnsHtml) );
    }
  };


  self.registerButtons = function(btnsHtml, side) {
    if (side === 'secondary' || side === 'right') {
      secondaryBtnsHtml = btnsHtml;
    } else {
      primaryBtnsHtml = btnsHtml;
    }
  };


  self.registerBackButton = function(btnHtml) {
    btnHtml = btnHtml.replace(/ion-nav-back-button/gi, 'div');
    backBtnTemplateEle = jqLite(btnHtml);
    backBtnTemplateEle.addClass('button back-button back-button-hide');

    if (!backBtnTemplateEle.attr('ng-click')) {
      backBtnTemplateEle.attr('ng-click', '$goBack()');
    }

    hasBackBtnText = !!backBtnTemplateEle[0].querySelector('.button-text');

    return backBtnTemplateEle;
  };


  self.createNavBarBlock = function(backBtnTemplateEle, primaryBtnsHtml, secondaryBtnsHtml) {
    var containerEle = jqLite( '<div class="nav-bar-block nav-bar-cache">' );
    var titleEle = jqLite( '<div class="title">' );
    var backBtnEle, primaryBtnsEle, secondaryBtnsEle;
    var titleHtml = '';
    var isBackSown;

    var navBarEle = jqLite( '<div class="bar bar-header ' + ($attrs.class || '') + '">' );

    if (backBtnTemplateEle) {
      backBtnEle = backBtnTemplateEle.clone();
      navBarEle.append(backBtnEle);
    }

    navBarEle.append(titleEle);

    if (primaryBtnsHtml) {
      primaryBtnsEle = jqLite( '<div class="buttons primary-buttons left-buttons">' );
      primaryBtnsEle.html(primaryBtnsHtml);
      navBarEle.append(primaryBtnsEle);
    }

    if (secondaryBtnsHtml) {
      secondaryBtnsEle = jqLite( '<div class="buttons secondary-buttons right-buttons">' );
      secondaryBtnsEle.html(secondaryBtnsHtml);
      navBarEle.append(secondaryBtnsEle);
    }

    containerEle.append(navBarEle);

    $element.append( $compile(containerEle)($scope) );

    return {
      isActive: false,
      showBack: function(show) {
        if (backBtnEle) {
          if (show && !isBackSown) {
            backBtnEle.removeClass('back-button-hide');
            isBackSown = true;
          } else if (!show && isBackSown) {
            backBtnEle.addClass('back-button-hide');
            isBackSown = false;
          }
        }
      },
      title: function(val) {
        if (val !== titleHtml) {
          titleEle.html(val);
          titleHtml = val;
        }
      },
      element: function() {
        return containerEle;
      },
      destroy: function() {
        containerEle = navBarEle = backBtnEle = primaryBtnsEle = secondaryBtnsEle = titleEle = null;
      }
    };
  };


  self.beforeEnter = function(viewData) {
    if ( self.shouldUpdate(viewData) ) {
      self.enable();
      var enteringContainer = getOffScreenNavBar();
      self.title(viewData.title, enteringContainer);
      self.showBackButton(viewData.showBack, enteringContainer);
      self.transition(enteringContainer, getOnScreenNavBar(), viewData);
    }
  };


  self.shouldUpdate = function(viewData) {
    return !!viewData;
  };


  self.transition = function(enteringContainer, leavingContainer, viewData) {

    $animate.transition( 'nav-bar', viewData.transition, viewData.direction, enteringContainer.element(), leavingContainer && leavingContainer.element()).then(function(){
      for (var x=0; x<navBarContainers.length; x++) {
        navBarContainers[x].isActive = false;
      }
      enteringContainer.isActive = true;
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


  self.showBackButton = function(show, navBarContainer) {
    navBarContainer = navBarContainer || getOnScreenNavBar();
    navBarContainer && navBarContainer.showBack(show);
  };


  self.title = function(val, navBarContainer) {
    if (arguments.length) {
      previousTitle = title;
      title = val || '';
      navBarContainer = navBarContainer || getOnScreenNavBar();
      navBarContainer && navBarContainer.title(title);
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


  function getOnScreenNavBar() {
    for (var x=0; x<navBarContainers.length; x++) {
      if (navBarContainers[x].isActive) return navBarContainers[x];
    }
  }


  function getOffScreenNavBar() {
    for (var x=0; x<navBarContainers.length; x++) {
      if (!navBarContainers[x].isActive) return navBarContainers[x];
    }
    return navBarContainers[0];
  }


  $scope.$goBack = self.back = function() {
    var backView = $ionicHistory.backView();
    backView && backView.go();
  };


  $scope.$on('$destroy', function(){
    $element.parent().removeData(DATA_NAV_BAR_CTRL);
    for (var x=0; x<navBarContainers.length; x++) {
      navBarContainers[x].destroy();
    }
    navBarContainers = null;
    deregisterInstance();
  });

}]);

