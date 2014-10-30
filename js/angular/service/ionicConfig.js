/**
 * @ngdoc provider
 * @name $ionicConfigProvider
 * @module ionic
 * @description $ionicConfigProvider can be used during the configuration phase of your app
 * to change how Ionic works.
 *
 * @usage
 * ```js
 * var myApp = angular.module('reallyCoolApp', ['ionic']);
 *
 * myApp.config(function($ionicConfigProvider) {
 *   $ionicConfigProvider.templates.prefetch(false);
 * });
 * ```
 */

/**
 * @ngdoc method
 * @name $ionicConfigProvider#views.transition
 * @description Animation style when transitioning between views. Default `platform`.
 *
 * @param {string} transition Which style of view transitioning to use.
 *
 * * `platform`: Dynamically choose the correct transition style depending on
 *               the platform the app is running from. If the platform is
 *               not `ios` or `android` then it will default to `ios-transition`.
 * * `ios-transition`: iOS style transition.
 * * `android-transition`: Android style transition.
 * * `none`: Do not preform animated transitions.
 *
 * @returns {string} View animation.
 */

/**
 * @ngdoc method
 * @name $ionicConfigProvider#views.maxCache
 * @description Maximum number of view elements to cache in the DOM. When the max number is
 * exceeded, the `viewRemovePolicy` determines which view to remove. Views which stay in the
 * DOM essentially caches the view's scope, current state and scroll position. When the
 * maximum cached is `0`, then after each view transition, the view's element will
 * be removed from the DOM, and the next time the same view is shown it will have to
 * re-compile, attach to the DOM, and link the element again.
 * @param {number} maxNumber Maximum number of views to retain. Default `10`.
 * @returns {number} How many views Ionic will hold onto until the a view is removed.
 */

/**
 * @ngdoc method
 * @name $ionicConfigProvider#views.forwardCache
 * @description When navigating between views, by default, views that were recently visited
 * are cached, and the same data and DOM elements are referenced when navigating back. However,
 * when navigating back in the history, the "forward" view is removed so its not cached. If
 * you navigate forward to the same view again it'll create a new DOM element, re-compiled and
 * linked. Basically any forward views are reset each time. Set this config to `true` to have
 * forward views are cached and not reset on each load.
 * @param {boolean} value `false`.
 * @returns {boolean}
 */

/**
 * @ngdoc method
 * @name $ionicConfigProvider#templates.prefetch
 * @description Set whether Ionic should prefetch all templateUrls defined in
 * $stateProvider.state. If set to false, the user will have to wait
 * for a template to be fetched the first time when navigating to a new page. Default `true`.
 * @param {boolean} shouldPrefetch Whether Ionic should prefetch templateUrls defined in
 * `$stateProvider.state()`.
 * @returns {boolean} Whether Ionic will prefetch templateUrls defined in $stateProvider.state.
 */

IonicModule
.provider('$ionicConfig', function() {

  var provider = this;
  provider.platform = {};
  var PLATFORM = 'platform';

  var configProperties = {
    views: {
      transition: PLATFORM,
      maxCache: PLATFORM,
      forwardCache: PLATFORM
    },
    navBar: {
      alignTitle: PLATFORM,
      positionPrimaryButtons: PLATFORM,
      positionSecondaryButtons: PLATFORM,
      transition: PLATFORM,
      transitionFn: PLATFORM
    },
    backButton: {
      enabled: PLATFORM,
      icon: PLATFORM,
      text: PLATFORM,
      previousTitleText: PLATFORM
    },
    tabs: {
      position: PLATFORM,
      type: PLATFORM
    },
    templates: {
      prefetch: PLATFORM
    },
    platform: {}
  };
  createConfig(configProperties, provider, '');



  // Default
  // -------------------------
  setPlatformConfig('default', {
    views: {
      transition: 'ios-transition',
      maxCache: 10,
      forwardCache: false
    },
    navBar: {
      alignTitle: 'center',
      positionPrimaryButtons: 'left',
      positionSecondaryButtons: 'right',
      transition: 'ios-nav-bar',

      transitionFn: function(enteringCtrl, leavingCtrl) {

        function setStyles(ctrl, opacity, titleX, backTextX) {
          var css = { opacity: opacity };

          ctrl.setCss('buttons-a', css);
          ctrl.setCss('buttons-b', css);
          ctrl.setCss('back-button', css);

          css[ionic.CSS.TRANSFORM] = 'translate3d(' + titleX + 'px,0,0)';
          ctrl.setCss('title', css);

          css[ionic.CSS.TRANSFORM] = 'translate3d(' + backTextX + 'px,0,0)';
          ctrl.setCss('back-text', css);
        }

        function enter(ctrlA, ctrlB, value) {
          if (!ctrlA) return;
          var titleX = (ctrlA.titleTextX() + ctrlA.titleWidth()) * (1 - value);
          var backTextX = (ctrlB.titleTextX() - ctrlA.backButtonTextLeft()) * (1 - value);
          setStyles(ctrlA, value, titleX, backTextX);
        }

        function leave(ctrlA, ctrlB, value) {
          if (!ctrlA) return;
          var titleX = (-(ctrlA.titleTextX() - ctrlB.backButtonTextLeft()) - (ctrlA.titleLeftRight())) * value;
          setStyles(ctrlA, 1 - value, titleX, 0);
        }

        return {
          forward: {
            enter: function(value) {
              enter(enteringCtrl, leavingCtrl, value);
            },
            leave: function(value) {
              leave(leavingCtrl, enteringCtrl, value);
            }
          },
          back: {
            enter: function(value) {
              leave(enteringCtrl, leavingCtrl, 1-value);
            },
            leave: function(value) {
              enter(leavingCtrl, enteringCtrl, 1-value);
            }
          }
        };
      }

    },
    backButton: {
      icon: 'ion-ios7-arrow-back',
      text: 'Back',
      previousTitleText: true
    },
    tabs: {
      position: '',
      type: ''
    },
    templates: {
      prefetch: true
    }
  });



  // iOS
  // -------------------------
  setPlatformConfig('ios', {
    backButton: {
      icon: 'ion-ios7-arrow-back'
    }
  });



  // Android
  // -------------------------
  setPlatformConfig('android', {
    views: {
      transition: 'android-transition'
    },
    navBar: {
      alignTitle: 'left',
      positionPrimaryButtons: 'right',
      positionSecondaryButtons: 'right',
      transition: 'android-transition',
      transitionFn: 'none'
    },
    backButton: {
      icon: 'ion-android-arrow-back',
      text: '',
      previousTitleText: false
    },
    tabs: {
      type: 'tabs-striped'
    }
  });




  function setPlatformConfig(platformName, platformConfigs) {
    configProperties.platform[platformName] = platformConfigs;
    provider.platform[platformName] = {};

    addConfig(configProperties, configProperties.platform[platformName]);

    createConfig(configProperties.platform[platformName], provider.platform[platformName], '');
  }

  function addConfig(configObj, platformObj) {
    for (var n in configObj) {
      if (n != PLATFORM && configObj.hasOwnProperty(n)) {
        if ( angular.isObject(configObj[n]) ) {
          if (!isDefined(platformObj[n])) {
            platformObj[n] = {};
          }
          addConfig(configObj[n], platformObj[n]);

        } else if( !isDefined(platformObj[n]) ) {
          platformObj[n] = null;
        }
      }
    }
  }


  // private: create methods for each config to get/set
  function createConfig(configObj, providerObj, platformPath) {
    forEach(configObj, function(value, namespace){

      if (angular.isObject(configObj[namespace])) {
        // recursively drill down the config object so we can create a method for each one
        providerObj[namespace] = {};
        createConfig(configObj[namespace], providerObj[namespace], platformPath + '.' + namespace);

      } else {
        // create a method for both the provider and config methods that will be exposed
        providerObj[namespace] = function(newValue) {
          if (arguments.length) {
            configObj[namespace] = newValue;
          }
          if (configObj[namespace] == PLATFORM) {
            // if the config is set to 'platform', then get this config's platform value
            var platformConfig = stringObj(configProperties.platform, ionic.Platform.platform() + platformPath + '.' + namespace);
            if (platformConfig) {
              return platformConfig;
            }
            // didnt find a specific platform config, now try the default
            return stringObj(configProperties.platform, 'default' + platformPath + '.' + namespace);
          }
          return configObj[namespace];
        };
      }

    });
  }

  function stringObj(obj, str) {
    str = str.split(".");
    for (var i = 0; i < str.length; i++) {
      if ( obj && isDefined(obj[str[i]]) ) {
        obj = obj[str[i]];
      } else {
        return null;
      }
    }
    return obj;
  }

  provider.setPlatformConfig = setPlatformConfig;


  // private: Service definition for internal Ionic use
  /**
   * @ngdoc service
   * @name $ionicConfig
   * @module ionic
   * @private
   */
  provider.$get = function() {
    return provider;
  };
});
