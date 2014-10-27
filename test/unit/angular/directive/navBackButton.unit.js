xdescribe('ionNavBackButton directive', function() {
  beforeEach(module('ionic'));
  var navBackButtonEle, buttonIconEle;

  function setup(attr, content) {
    inject(function($compile, $rootScope) {
      navBackButtonEle = angular.element('<ion-nav-back-button '+(attr||'')+'>'+(content||'')+'</ion-nav-back-button>');
      navBackButtonEle.data('$ionNavBarController', {
        navElement: jasmine.createSpy('navElement'),
      });
      navBackButtonEle = $compile(navBackButtonEle)($rootScope.$new());
      $rootScope.$apply();
      buttonIconEle = navBackButtonEle.find('i');
    });
  }

  it('should error without a parent ionNavBar', inject(function($compile, $rootScope) {
    expect(function() {
      $compile('<ion-nav-back-button>')($rootScope);
    }).toThrow();
  }));

  it('should hide and empty its original self', function() {
    setup();
    expect(navBackButtonEle.hasClass('hide')).toBe(true);
    expect(navBackButtonEle.html()).toBe('');
  });

  it('should navElement', inject(function($compile, $rootScope, $ionicConfig) {
    $ionicConfig.backButton.icon('none');
    setup();
    expect( navBackButtonEle.controller('ionNavBar').navElement ).toHaveBeenCalledWith(
      '<button class="button back-button"></button>', 'backButton'
    );
  }));

  it('should navElement with attributes', inject(function($compile, $rootScope, $ionicConfig) {
    $ionicConfig.backButton.icon('none');
    setup('ng-click="myClick()" class="my-class" id="yup"');
    expect( navBackButtonEle.controller('ionNavBar').navElement ).toHaveBeenCalledWith(
      '<button ngclick="myClick()" class="my-class button back-button" id="yup"></button>', 'backButton'
    );
  }));

  it('should navElement with content', inject(function($compile, $rootScope, $ionicConfig) {
    $ionicConfig.backButton.icon('none');
    setup('', 'Back');
    expect( navBackButtonEle.controller('ionNavBar').navElement ).toHaveBeenCalledWith(
      '<button class="button back-button">Back</button>', 'backButton'
    );
  }));

  it('should not set a default nested back button icon if ion- classname exists', inject(function($ionicConfig) {
    $ionicConfig.backButton.icon('none');
    setup('class="ion-navicon"');
    expect(buttonIconEle.length).toBe(0);
  }));

  it('should not set default nested back button icon if "ion-" child exists', inject(function($ionicConfig) {
    setup('', '<i class="ion-superstar"></i>');
    expect( navBackButtonEle.controller('ionNavBar').navElement ).toHaveBeenCalledWith(
      '<button class="button back-button"><i class="ion-superstar"></i></button>', 'backButton'
    );
  }));

  it('should not set default nested back button icon if "icon" child exists', inject(function($ionicConfig) {
    setup('', '<i class="icon"></i>');
    expect( navBackButtonEle.controller('ionNavBar').navElement ).toHaveBeenCalledWith(
      '<button class="button back-button"><i class="icon"></i></button>', 'backButton'
    );
  }));

  it('should set default back button icon from $ionicConfig, but no inner text', inject(function($ionicConfig) {
    $ionicConfig.backButton.icon('ion-ios7-arrow-back');
    setup();
    expect( navBackButtonEle.controller('ionNavBar').navElement ).toHaveBeenCalledWith(
      '<button class="button back-button button-clear"><i class="icon ion-ios7-arrow-back"></i> </button>', 'backButton'
    );
  }));

  it('should set default back button icon from $ionicConfig, but with inner text', inject(function($ionicConfig) {
    $ionicConfig.backButton.icon('ion-ios7-arrow-back');
    setup('', 'Back');
    expect( navBackButtonEle.controller('ionNavBar').navElement ).toHaveBeenCalledWith(
      '<button ng-click="$goBack()" class="button back-button hide buttons button-clear"><i class="icon ion-ios7-arrow-back"></i> Back<span class="button-text">Back</span><span class="previous-title"></span></button>', 'backButton'
    );
  }));

});
