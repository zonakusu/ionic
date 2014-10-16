describe('$ionNavBar controller', function() {
  beforeEach(module('ionic'));
  var scope;

  function makeNavBarCtrl(css) {
    var ctrl;
    inject(function($rootScope, $controller, $ionicHistory, $ionicViewSwitcher) {
      scope = $rootScope.$new();
      ctrl = $controller('$ionNavBar', {
        $scope: scope,
        $element: angular.element('<div>'),
        $attrs: { class: css },
        $ionicHistory: $ionicHistory,
        $ionicViewSwitcher: $ionicViewSwitcher
      });
    });
    return ctrl;
  }

  it('should createBackButtonElement when no registerBackButton', function() {
    var ctrl = makeNavBarCtrl();
    var headerBarEle = angular.element('<div>');

    var ele = ctrl.createBackButtonElement(headerBarEle);
    expect(ele).toBeUndefined();
  });

  it('should registerBackButton and createBackButtonElement', function() {
    var ctrl = makeNavBarCtrl();
    var headerBarEle = angular.element('<div>');
    ctrl.registerNavElement('<button>', 'backButton');
    var ele = ctrl.createBackButtonElement(headerBarEle);
    expect(ele).toBeDefined();
  });

  it('should registerBackButton, createBackButtonElement and add ng-click if one wasnt provided', function() {
    var ctrl = makeNavBarCtrl();
    var headerBarEle = angular.element('<div>');
    ctrl.registerNavElement('<button>', 'backButton');
    var ele = ctrl.createBackButtonElement(headerBarEle);
    expect(ele.attr('ng-click')).toBe('$goBack()');
  });

  it('should registerBackButton, createBackButtonElement and not add ng-click if one was provided', function() {
    var ctrl = makeNavBarCtrl();
    var headerBarEle = angular.element('<div>');
    ctrl.registerNavElement('<button ng-click="myClick()">Back</button>', 'backButton');
    var ele = ctrl.createBackButtonElement(headerBarEle);
    expect(ele.attr('ng-click')).toBe('myClick()');
  });

  it('should createHeaderBar instance', function() {
    var ctrl = makeNavBarCtrl();
    var headerBar = ctrl.createHeaderBar('bar-royal');
    expect(headerBar).toBeDefined();
    expect(headerBar.isActive).toBe(false);
    expect(headerBar.containerEle()).toBeDefined();
    expect(headerBar.containerEle().hasClass('nav-bar-block')).toBe(true);
    expect(headerBar.containerEle().hasClass('nav-bar-cache')).toBe(true);
    expect(headerBar.headerBarEle().hasClass('bar-royal')).toBe(true);
    expect(headerBar.headerBarEle().hasClass('nav-bar')).toBe(true);
    expect(headerBar.headerBarEle().children().eq(0).hasClass('title')).toBe(true);
  });

  it('should createHeaderBar and add back button', function() {
    var ctrl = makeNavBarCtrl();

    ctrl.registerNavElement('<button>Back</button>', 'backButton');

    var headerBar = ctrl.createHeaderBar();
    var backBtnEle = headerBar.headerBarEle().find('button');
    expect(headerBar.headerBarEle().children().eq(0).text()).toBe('Back');
    expect(headerBar.headerBarEle().children().eq(1).hasClass('title')).toBe(true);
  });

  it('should createHeaderBar and add primary buttons', function() {
    var ctrl = makeNavBarCtrl();

    ctrl.registerNavElement('<div class="buttons">', 'primaryButtons');

    var headerBar = ctrl.createHeaderBar();
    expect(headerBar.headerBarEle().children().eq(0).hasClass('buttons')).toBe(true);
    expect(headerBar.headerBarEle().children().eq(1).hasClass('title')).toBe(true);
  });

  it('should createHeaderBar, back button and primary buttons', function() {
    var ctrl = makeNavBarCtrl();

    ctrl.registerNavElement('<button>Back</button>', 'backButton');
    ctrl.registerNavElement('<div class="buttons">', 'primaryButtons');

    var headerBar = ctrl.createHeaderBar();
    expect(headerBar.headerBarEle().children().eq(0).text()).toBe('Back');
    expect(headerBar.headerBarEle().children().eq(1).hasClass('buttons')).toBe(true);
    expect(headerBar.headerBarEle().children().eq(2).hasClass('title')).toBe(true);
  });

  it('should createHeaderBar and add secondary buttons', function() {
    var ctrl = makeNavBarCtrl();

    ctrl.registerNavElement('<div class="buttons">', 'secondaryButtons');

    var headerBar = ctrl.createHeaderBar();
    expect(headerBar.headerBarEle().children().eq(0).hasClass('title')).toBe(true);
    expect(headerBar.headerBarEle().children().eq(1).hasClass('buttons')).toBe(true);
  });

  it('should createHeaderBar, back button add secondary buttons', function() {
    var ctrl = makeNavBarCtrl();

    ctrl.registerNavElement('<button>Back</button>', 'backButton');
    ctrl.registerNavElement('<div class="buttons">', 'secondaryButtons');

    var headerBar = ctrl.createHeaderBar();
    expect(headerBar.headerBarEle().children().eq(0).text()).toBe('Back');
    expect(headerBar.headerBarEle().children().eq(1).hasClass('title')).toBe(true);
    expect(headerBar.headerBarEle().children().eq(2).hasClass('buttons')).toBe(true);
  });

  it('should createHeaderBar, back button, primary buttons, and secondary buttons', function() {
    var ctrl = makeNavBarCtrl();

    ctrl.registerNavElement('<button>Back</button>', 'backButton');
    ctrl.registerNavElement('<div class="primary-buttons">', 'primaryButtons');
    ctrl.registerNavElement('<div class="secondary-buttons">', 'secondaryButtons');

    var headerBar = ctrl.createHeaderBar();
    expect(headerBar.headerBarEle().children().eq(0).text()).toBe('Back');
    expect(headerBar.headerBarEle().children().eq(1).hasClass('primary-buttons')).toBe(true);
    expect(headerBar.headerBarEle().children().eq(2).hasClass('title')).toBe(true);
    expect(headerBar.headerBarEle().children().eq(3).hasClass('secondary-buttons')).toBe(true);
  });

  it('should createHeaderBar and apply scope to new header bar', function() {
    var ctrl = makeNavBarCtrl();

    scope.buttonText = 'My Button';
    ctrl.registerNavElement('<button>{{ buttonText }}</button>', 'backButton');

    var headerBar = ctrl.createHeaderBar();
    scope.$digest();
    expect(headerBar.headerBarEle().children().eq(0).text()).toBe(scope.buttonText);
  });

});
