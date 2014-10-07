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
 *   $ionicConfigProvider.prefetchTemplates(false);
 * });
 * ```
 */
IonicModule
.provider('$ionicConfig', function() {

  // container of all ionic configs
  // The angular world should use $ionicConfig
  var config = ionic.config = {};


  /**
   * @ngdoc method
   * @name $ionicConfigProvider#maxCachedViews
   * @description Maximum number of view elements to cache in the DOM. When the max number is
   * exceeded, the `viewRemovePolicy` determines which view to remove. Views which stay in the
   * DOM essentially caches the view's scope, current state and scroll position. When the
   * maximum cached is `0`, then after each view transition, the view's element will
   * be removed from the DOM, and the next time the same view is shown it will have to
   * re-compile, attach to the DOM, and link the element again.
   * @param {number} maxNumber Maximum number of views to retain. Default `10`.
   * @returns {number} How many views Ionic will hold onto until the a view is removed.
   */
  config.maxCachedViews = 10;


  /**
   * @ngdoc method
   * @name $ionicConfigProvider#cacheForwardViews
   * @description When navigating between views, by default, views that were recently visited
   * are cached, and the same data and DOM elements are referenced when navigating back. However,
   * when navigating back in the history, the "forward" view is removed so its not cached. If
   * you navigate forward to the same view again it'll create a new DOM element, re-compiled and
   * linked. Basically any forward views are reset each time. Set this config to `true` to have
   * forward views are cached and not reset on each load.
   * @param {boolean} value `false`.
   * @returns {boolean}
   */
  config.cacheForwardViews = false;

  /**
   * @ngdoc method
   * @name $ionicConfigProvider#viewAnimation
   * @description Animation style when transitioning between views. Default `platform`.
   *
   * @param {string} animation Which style of view transitioning to use.
   *
   * * `platform`: Dynamically choose the correct animation style depending on
   *               the platform the app is running from. If the platform is
   *               not `ios` or `android` then it will default to `ios-transition`.
   * * `ios-transition`: iOS style transition.
   * * `android-transition`: Android style transition.
   * * `none`: Do not preform animated transitions.
   *
   * @returns {string} View animation.
   */
  config.viewAnimation = 'platform';
  config.iosViewAnimation = 'ios-transition';
  config.androidViewAnimation = 'android-transition';

  /**
   * @ngdoc method
   * @name $ionicConfigProvider#prefetchTemplates
   * @description Set whether Ionic should prefetch all templateUrls defined in
   * $stateProvider.state. If set to false, the user will have to wait
   * for a template to be fetched the first time when navigating to a new page. Default `true`.
   * @param {boolean} shouldPrefetch Whether Ionic should prefetch templateUrls defined in
   * `$stateProvider.state()`.
   * @returns {boolean} Whether Ionic will prefetch templateUrls defined in $stateProvider.state.
   */
  config.prefetchTemplates = true;



  // private: create methods for each config to get/set
  var provider = this;
  forEach(config, function(defaultValue, configMethod) {
    provider[configMethod] = function(newValue) {
      if (arguments.length) {
        config[configMethod] = newValue;
      }
      return config[configMethod];
    };
  });

  // private: Service definition for internal Ionic use
  /**
   * @ngdoc service
   * @name $ionicConfig
   * @module ionic
   * @private
   */
  this.$get = function() {
    return config;
  };
});
