describe('$animate decorator', function() {
  var parentElement, enteringElement, leavingElement;

  beforeEach(module('ionic'));

  function setupStage() {
    parentElement = angular.element('<div class="test-parent">');
    enteringElement = angular.element('<div class="test-entering">');
    leavingElement = angular.element('<div class="test-leaving">');
    parentElement.append(enteringElement).append(leavingElement);
  }

  it('should end transition and add/remove correct classnames from the entering element', inject(function($animate) {
    setupStage();

    enteringElement.addClass('view-cache').addClass('view-entering').addClass('view-leaving');

    $animate.end('ios-transition', parentElement, enteringElement, leavingElement);
    expect( enteringElement.attr('class') ).toEqual('test-entering view-active nav-view');
  }));

  it('should end transition and add/remove correct classnames from the leaving element', inject(function($animate) {
    setupStage();

    leavingElement.addClass('view-active').addClass('view-entering').addClass('view-leaving');

    $animate.end('ios-transition', parentElement, enteringElement, leavingElement);
    expect( leavingElement.attr('class') ).toEqual('test-leaving view-cache');
  }));

  it('should stage transition and add/remove correct classnames to the entering element', inject(function($animate) {
    setupStage();

    enteringElement.removeClass('view-entering').addClass('view-cache').addClass('nav-view');

    $animate.stage(true, 'ios-transition', 'forward', parentElement, enteringElement, leavingElement);
    expect( enteringElement.attr('class') ).toEqual('test-entering view-entering');
  }));

  it('should stage transition and add/remove correct classnames to the leaving element', inject(function($animate) {
    setupStage();

    leavingElement.addClass('view-cache').addClass('nav-view').removeClass('view-leaving');

    $animate.stage(true, 'ios-transition', 'forward', parentElement, enteringElement, leavingElement);
    expect( leavingElement.attr('class') ).toEqual('test-leaving nav-view view-leaving ng-animate');
  }));

  it('should stage transition and not freak without a leaving element', inject(function($animate) {
    parentElement = angular.element('<div class="test-parent">');
    enteringElement = angular.element('<div class="test-entering">');
    leavingElement = null;

    $animate.stage(true, 'ios-transition', 'forward', parentElement, enteringElement, leavingElement);
    expect( parentElement.hasClass('ios-transition') ).toEqual(true);
  }));

  it('should stage transition and add correct animate class and remove the others', inject(function($animate) {
    setupStage();

    $animate.stage(true, 'larry-transition', 'forward', parentElement, enteringElement, leavingElement);
    expect( parentElement.attr('class') ).toEqual('test-parent larry-transition nav-forward');

    $animate.stage(true, 'curly-transition', 'forward', parentElement, enteringElement, leavingElement);
    expect( parentElement.attr('class') ).toEqual('test-parent curly-transition nav-forward');

    $animate.stage(true, 'moe-transition', 'back', parentElement, enteringElement, leavingElement);
    expect( parentElement.attr('class') ).toEqual('test-parent moe-transition nav-back');

    $animate.stage(true, 'shemp-transition', 'exit', parentElement, enteringElement, leavingElement);
    expect( parentElement.attr('class') ).toEqual('test-parent shemp-transition nav-exit');
  }));

  it('should stage transition and remove all directions except for the one being used on the parent', inject(function($animate) {
    setupStage();

    parentElement.addClass('nav-enter').addClass('nav-exit').addClass('nav-forward').addClass('nav-swap');
    $animate.stage(true, 'ios-transition', 'back', parentElement, enteringElement, leavingElement);
    expect( parentElement.attr('class') ).toEqual('test-parent ios-transition nav-back');

    parentElement.addClass('nav-enter').addClass('nav-exit').addClass('nav-back').addClass('nav-swap');
    $animate.stage(true, 'ios-transition', 'forward', parentElement, enteringElement, leavingElement);
    expect( parentElement.attr('class') ).toEqual('test-parent ios-transition nav-forward');

    parentElement.addClass('nav-enter').addClass('nav-exit').addClass('nav-back').addClass('nav-forward');
    $animate.stage(true, 'ios-transition', 'swap', parentElement, enteringElement, leavingElement);
    expect( parentElement.attr('class') ).toEqual('test-parent ios-transition nav-swap');
  }));

  it('should custom $$ngAnimateKey on parent', inject(function($animate) {
    setupStage();
    $animate.stage(true, 'ios-transition', 'forward', parentElement, enteringElement, leavingElement);
    expect( parentElement.data('$$ngAnimateKey') ).toEqual('test-parent ios-transition nav-forward');
  }));

  it('should shouldAnimate', inject(function($animate) {
    expect( $animate.shouldAnimate('ios-transition', 'forward') ).toEqual(true);
    expect( $animate.shouldAnimate('ios-transition', 'back') ).toEqual(true);
    expect( $animate.shouldAnimate('ios-transition', 'exit') ).toEqual(true);
    $animate.useAnimation(true);
    expect( $animate.shouldAnimate('ios-transition', 'exit') ).toEqual(true);
  }));

  it('should not shouldAnimate', inject(function($animate) {
    expect( $animate.shouldAnimate('', 'forward') ).toEqual(false);
    expect( $animate.shouldAnimate('none', 'forward') ).toEqual(false);
    expect( $animate.shouldAnimate(null, 'forward') ).toEqual(false);
    expect( $animate.shouldAnimate(undefined, 'forward') ).toEqual(false);

    expect( $animate.shouldAnimate('android-transition', '') ).toEqual(false);
    expect( $animate.shouldAnimate('android-transition', 'none') ).toEqual(false);
    expect( $animate.shouldAnimate('android-transition', null) ).toEqual(false);
    expect( $animate.shouldAnimate('android-transition', undefined) ).toEqual(false);

    $animate.useAnimation(false);
    expect( $animate.shouldAnimate('ios-transition', 'exit') ).toEqual(false);
  }));

});
