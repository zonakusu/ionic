describe('$ionicConfigProvider', function() {

  it('should give default true', function() {
    module('ionic', function($ionicConfigProvider) {
      expect($ionicConfigProvider.templates.prefetch()).toBe(true);
    });
    inject(function($ionicConfig) {
      expect($ionicConfig.templates.prefetch()).toBe(true);
    });
  });

  it('should allow setting', function() {
    module('ionic', function($ionicConfigProvider) {
      $ionicConfigProvider.templates.prefetch(false);
      expect($ionicConfigProvider.templates.prefetch()).toBe(false);
    });
    inject(function($ionicConfig) {
      expect($ionicConfig.templates.prefetch()).toBe(false);
    });
  });

  it('should get/set exact value for all platforms', function() {
    module('ionic', function($ionicConfigProvider) {
      $ionicConfigProvider.views.transition('my-transition');
      expect($ionicConfigProvider.views.transition()).toBe('my-transition');
    });
    inject(function($ionicConfig) {
      expect($ionicConfig.views.transition()).toBe('my-transition');
    });
  });

  it('should get default value for unknown platform', function() {
    module('ionic', function($ionicConfigProvider) {});
    inject(function($ionicConfig) {
      ionic.Platform.setPlatform('whatever');
      expect($ionicConfig.views.transition()).toBe('ios-transition');
    });
  });

  it('should get default value for ios platform', function() {
    module('ionic', function($ionicConfigProvider) {});
    inject(function($ionicConfig) {
      ionic.Platform.setPlatform('ios');
      expect($ionicConfig.views.transition()).toBe('ios-transition');
    });
  });

  it('should get default value for android platform', function() {
    module('ionic', function($ionicConfigProvider) {});
    inject(function($ionicConfig) {
      ionic.Platform.setPlatform('android');
      expect($ionicConfig.views.transition()).toBe('android-transition');
    });
  });

  it('should set default platform value for android platform', function() {
    module('ionic', function($ionicConfigProvider) {});
    inject(function($ionicConfig) {
      ionic.Platform.setPlatform('android');
      expect($ionicConfig.views.transition()).toBe('android-transition');

      $ionicConfig.platform.android.views.transition('android-whatnot');

      ionic.Platform.setPlatform('ios');
      expect($ionicConfig.views.transition()).toBe('ios-transition');

      ionic.Platform.setPlatform('android');
      expect($ionicConfig.views.transition()).toBe('android-whatnot');
    });
  });

  it('should set default platform value for ios platform', function() {
    module('ionic', function($ionicConfigProvider) {
      $ionicConfigProvider.platform.android.menus.transition('android-menu');
    });
    inject(function($ionicConfig) {
      ionic.Platform.setPlatform('ios');
      expect($ionicConfig.menus.transition()).toBe('push-menu');

      $ionicConfig.platform.ios.menus.transition('ios-whatnot');

      ionic.Platform.setPlatform('android');
      expect($ionicConfig.menus.transition()).toBe('android-menu');

      ionic.Platform.setPlatform('ios');
      expect($ionicConfig.menus.transition()).toBe('ios-whatnot');
    });
  });

  it('should set a new platform', function() {
    module('ionic', function($ionicConfigProvider) {
      $ionicConfigProvider.setPlatformConfig('win32', {
        views: {
          transition: 'win32-transition'
        },
        navBar: {
          alignTitle: 'right',
          positionPrimaryButtons: 'left',
          positionSecondaryButtons: 'left',
          backButtonIcon: 'ion-win32-arrow-back',
          transition: 'win32-nav-bar'
        },
        menus: {
          transition: 'win32-menu'
        }
      });
    });
    inject(function($ionicConfig) {
      expect($ionicConfig.views.transition()).toBe('ios-transition');
      expect($ionicConfig.navBar.alignTitle()).toBe('center');

      ionic.Platform.setPlatform('win32');
      expect($ionicConfig.views.transition()).toBe('win32-transition');
      expect($ionicConfig.navBar.alignTitle()).toBe('right');
      expect($ionicConfig.navBar.positionPrimaryButtons()).toBe('left');
      expect($ionicConfig.navBar.positionSecondaryButtons()).toBe('left');
      expect($ionicConfig.navBar.backButtonIcon()).toBe('ion-win32-arrow-back');

      $ionicConfig.platform.win32.views.transition('winwin-transition');
      expect($ionicConfig.views.transition()).toBe('winwin-transition');
    });
  });

  it('should set a new default in the default platform', function() {
    module('ionic', function($ionicConfigProvider) {
      $ionicConfigProvider.platform.default.menus.transition('new-default');
      $ionicConfigProvider.platform.ios.menus.transition('new-ios');
      $ionicConfigProvider.platform.android.menus.transition('new-android');
    });
    inject(function($ionicConfig) {
      expect($ionicConfig.menus.transition()).toBe('new-default');

      ionic.Platform.setPlatform('ios');
      expect($ionicConfig.menus.transition()).toBe('new-ios');

      ionic.Platform.setPlatform('android');
      expect($ionicConfig.menus.transition()).toBe('new-android');
    });
  });

});
