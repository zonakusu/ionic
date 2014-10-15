describe('$ionNavBar controller', function() {
  beforeEach(module('ionic'));

  function makeCtrl(css) {
    var ctrl;
    inject(function($rootScope, $controller, $ionicHistory, $ionicViewSwitcher) {
      ctrl = $controller('$ionNavBar', {
        $scope: $rootScope.$new(),
        $element: angular.element('<div>'),
        $attrs: { class: css },
        $ionicHistory: $ionicHistory,
        $ionicViewSwitcher: $ionicViewSwitcher
      });
    });
    return ctrl;
  }

  it('should registerBackButton and create element to clone', function() {
    var ctrl = makeCtrl();
    var ele = ctrl.registerBackButton('\
      <ion-nav-back-button class="button-clear">\
        <i class="ion-arrow-left-c"></i> Back\
      </ion-nav-back-button>');
    expect(ele).toBeDefined();
    expect(ele[0].tagName).toBe('DIV');
    expect(ele.hasClass('button')).toBe(true);
    expect(ele.hasClass('back-button')).toBe(true);
    expect(ele.hasClass('back-button-hide')).toBe(true);
  });

  it('should registerBackButton and ng-click if one wasnt provided', function() {
    var ctrl = makeCtrl();
    var ele = ctrl.registerBackButton('<ion-nav-back-button></ion-nav-back-button>');
    expect(ele.attr('ng-click')).toBe('$goBack()');
  });

  it('should registerBackButton and not ng-click if one was provided', function() {
    var ctrl = makeCtrl();
    var ele = ctrl.registerBackButton('<ion-nav-back-button ng-click="customGoBack()"></ion-nav-back-button>');
    expect(ele.attr('ng-click')).toBe('customGoBack()');
  });

  it('should createNavBarBlock w/ correct classnames', function() {
    var ctrl = makeCtrl('bar-positive');
    var ele = ctrl.createNavBarBlock().element();
    expect(ele.hasClass('nav-bar-block')).toBe(true);
    expect(ele.hasClass('nav-bar-cache')).toBe(true);

    expect(ele.children().eq(0).hasClass('bar')).toBe(true);
    expect(ele.children().eq(0).hasClass('bar-header')).toBe(true);
    expect(ele.children().eq(0).hasClass('bar-positive')).toBe(true);
  });

  it('should createNavBarBlock w/ correct classnames', function() {
    var ctrl = makeCtrl('bar-positive');
    var ele = ctrl.createNavBarBlock().element();
    expect(ele.hasClass('nav-bar-block')).toBe(true);
    expect(ele.hasClass('nav-bar-cache')).toBe(true);

    expect(ele.children().eq(0).hasClass('bar')).toBe(true);
    expect(ele.children().eq(0).hasClass('bar-header')).toBe(true);
    expect(ele.children().eq(0).hasClass('bar-positive')).toBe(true);
  });

  it('should createNavBarBlock, add add back button', function() {
    var ctrl = makeCtrl();

    var backBtnTemplateEle = angular.element('<div class="test-back-button">');
    var navBar = ctrl.createNavBarBlock(backBtnTemplateEle);
    expect(navBar.element()[0].querySelector('.test-back-button').innerHTML).toBeDefined();
  });

  it('should createNavBarBlock, add title element and update titles', function() {
    var ctrl = makeCtrl();
    var navBar = ctrl.createNavBarBlock();
    navBar.title('My Title')
    expect(navBar.element()[0].querySelector('.title').innerHTML).toBe('My Title');
    navBar.title('My Other Title')
    expect(navBar.element()[0].querySelector('.title').innerHTML).toBe('My Other Title');
  });

});
