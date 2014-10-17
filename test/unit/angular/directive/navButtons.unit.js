describe('ionNavButtons directive', function() {

  beforeEach(module('ionic', function($compileProvider) {
    $compileProvider.directive('needsScroll', function() {
      return {
        //Test if the buttons are 'children of ionScroll' when compiled
        require: '^$ionicScroll',
        link: function(scope, element, attrs, ctrl) {
          element.data('scrollCtrl', ctrl);
        }
      };
    });
  }));

  function setup(side, content) {
    var el;
    inject(function($compile, $rootScope) {
      el = angular.element('<ion-nav-buttons side="'+(side)+'">'+(content||'')+'</ion-nav-buttons>');
      el.data('$ionNavBarController', {
        registerNavElement: jasmine.createSpy('registerNavElement'),
      });
      el = $compile(el)($rootScope.$new());
      $rootScope.$apply();
    });
    return el;
  }

  it('should error without a parent ionNavBar', inject(function($compile, $rootScope) {
    expect(function() {
      $compile('<ion-nav-buttons>')($rootScope);
    }).toThrow();
  }));

  it('should hide and empty its original self', function() {
    var el = setup();
    expect(el.hasClass('hide')).toBe(true);
    expect(el.html()).toBe('');
  });

  it('should add buttons to primary side by default', function() {
    var el = setup(null, '<button>');
    expect( el.controller('ionNavBar').registerNavElement ).toHaveBeenCalledWith(
      '<div class="buttons primary-buttons"><span><button></button></span></div>', 'primaryButtons'
    );
  });

  it('should add buttons to primary side when given primary side attr', function() {
    var el = setup('primary', '<button>');
    expect( el.controller('ionNavBar').registerNavElement ).toHaveBeenCalledWith(
      '<div class="buttons primary-buttons"><span><button></button></span></div>', 'primaryButtons'
    );
  });

  it('should add buttons to primary side when given left side attr', function() {
    var el = setup('left', '<button>');
    expect( el.controller('ionNavBar').registerNavElement ).toHaveBeenCalledWith(
      '<div class="buttons primary-buttons"><span><button></button></span></div>', 'primaryButtons'
    );
  });

  it('should add buttons to secondary side when given secondary side attr', function() {
    var el = setup('secondary', '<button>');
    expect( el.controller('ionNavBar').registerNavElement ).toHaveBeenCalledWith(
      '<div class="buttons secondary-buttons"><span><button></button></span></div>', 'secondaryButtons'
    );
  });

  it('should add buttons to secondary side when given right side attr', function() {
    var el = setup('right', '<button>');
    expect( el.controller('ionNavBar').registerNavElement ).toHaveBeenCalledWith(
      '<div class="buttons secondary-buttons"><span><button></button></span></div>', 'secondaryButtons'
    );
  });

});
