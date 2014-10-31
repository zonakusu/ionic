IonicModule
.controller('$ionView', [
  '$scope',
  '$element',
  '$attrs',
  '$compile',
  '$ionicHistory',
function($scope, $element, $attrs, $compile, $ionicHistory) {
  var self = this;
  var navElementHtml = {};
  var navViewCtrl;
  var navBarDelegateHandle;
  var hasViewHeaderBar;

  var deregIonNavBarInit = $scope.$on('ionNavBar.init', function(ev, delegateHandle){
    // this view has its own ion-nav-bar, remember the navBarDelegateHandle for this view
    ev.stopPropagation();
    navBarDelegateHandle = delegateHandle;
  });

  var deregIonHeaderBarInit = $scope.$on('ionHeaderBar.init', function(ev){
    // this view has its own ion-header-bar, remember it should trump other nav bars
    ev.stopPropagation();
    hasViewHeaderBar = true;
  });


  self.init = function() {
    deregIonNavBarInit();
    deregIonHeaderBarInit();

    var modalCtrl = $element.inheritedData('$ionModalController');
    navViewCtrl = $element.inheritedData('$ionNavViewController');

    // don't bother if inside a modal or there's no parent navView
    if (!navViewCtrl || modalCtrl) return;

    // add listeners for when this view changes
    $scope.$on('$ionicView.beforeEnter', self.beforeEnter);
    $scope.$on('$ionicView.afterEnter', self.afterEnter);

    // watch to see if the hideNavBar attribute changes
    var hideNavAttr = isDefined($attrs.hideNavBar) ? $attrs.hideNavBar : 'false';
    $scope.$watch(hideNavAttr, function(value) {
      navViewCtrl.showBar(!value);
    });
  };

  self.beforeEnter = function(ev, transitionData) {
    // this event was emitted, starting at intial ion-view, then bubbles up
    // only the first ion-view should do something with it, parent ion-views should ignore
    if (!transitionData.viewNotified) {
      transitionData.viewNotified = true;

      $ionicHistory.currentTitle( $attrs.title );

      navViewCtrl.beforeEnter({
        title: $attrs.title,
        direction: transitionData.direction,
        transition: transitionData.transition,
        showBack: transitionData.showBack && !$attrs.hideBackButton,
        primaryButtons: generateButton(navElementHtml.primaryButtons),
        secondaryButtons: generateButton(navElementHtml.secondaryButtons),
        navBarDelegate: navBarDelegateHandle,
        hasHeaderBar: hasViewHeaderBar
      });
    }
  };


  function generateButton(html) {
    if (html) {
      // every time a view enters we need to recreate its view buttons if they exist
      return $compile(html)($scope.$new());
    }
  }


  self.afterEnter = function() {
    $element.removeClass('nav-view-cache');
  };


  self.navElement = function(type, html) {
    navElementHtml[type] = html;
  };

}]);

