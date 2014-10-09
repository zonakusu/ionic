describe('Ionic History', function() {
  var ionicViewRenderer

  beforeEach(module('ionic'));

  beforeEach(inject(function($ionicConfig){
    $ionicConfig.viewTransition = 'platform';
  }));

  it('should get fallback transition', inject(function($ionicViewRenderer) {
    var d = $ionicViewRenderer.getTransitionData();
    expect(d.transition).toEqual('ios-transition');
  }));

  it('should get transition from $ionicConfig.viewTransition', inject(function($ionicViewRenderer, $ionicConfig) {
    $ionicConfig.viewTransition = 'mambo-5';
    var d = $ionicViewRenderer.getTransitionData();
    expect(d.transition).toEqual('mambo-5');
  }));

  it('should get transition from $state', inject(function($ionicViewRenderer) {
    var viewLocals = {
      $$state: {
        self: {
          viewTransition: 'who-let-the-dogs-out'
        }
      }
    };

    var d = $ionicViewRenderer.getTransitionData(viewLocals);
    expect(d.transition).toEqual('who-let-the-dogs-out');
  }));

  it('should get transition from entering element attribute', inject(function($ionicViewRenderer) {
    var enteringEle = angular.element('<div view-transition="hey-yo">')
    var d = $ionicViewRenderer.getTransitionData(null, enteringEle);
    expect(d.transition).toEqual('hey-yo');
  }));

  it('should get transition from $ionicViewRenderer.nextTransition()', inject(function($ionicViewRenderer) {
    $ionicViewRenderer.nextTransition('first-you-drag-and-then-you-drop')
    var d = $ionicViewRenderer.getTransitionData();
    expect(d.transition).toEqual('first-you-drag-and-then-you-drop');
  }));


  it('should get fallback direction', inject(function($ionicViewRenderer) {
    var d = $ionicViewRenderer.getTransitionData();
    expect(d.direction).toEqual('none');
  }));

  it('should get direction from direction', inject(function($ionicViewRenderer) {
    var d = $ionicViewRenderer.getTransitionData(null, null, 'back');
    expect(d.direction).toEqual('back');
  }));

  it('should get direction from $state', inject(function($ionicViewRenderer) {
    var viewLocals = {
      $$state: {
        self: {
          viewDirection: 'exit'
        }
      }
    };

    var d = $ionicViewRenderer.getTransitionData(viewLocals);
    expect(d.direction).toEqual('exit');
  }));

  it('should get direction from entering element attribute', inject(function($ionicViewRenderer) {
    var enteringEle = angular.element('<div view-direction="back">')
    var d = $ionicViewRenderer.getTransitionData(null, enteringEle);
    expect(d.direction).toEqual('back');
  }));

  it('should get direction from $ionicViewRenderer.nextDirection()', inject(function($ionicViewRenderer) {
    $ionicViewRenderer.nextDirection('forward')
    var d = $ionicViewRenderer.getTransitionData();
    expect(d.direction).toEqual('forward');
  }));

});
