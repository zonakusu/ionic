/**
 * @ngdoc directive
 * @name ionNavBackButton
 * @module ionic
 * @restrict E
 * @parent ionNavBar
 * @description
 * Creates a back button inside an {@link ionic.directive:ionNavBar}.
 *
 * Will show up when the user is able to go back in the current navigation stack.
 *
 * By default, will go back when clicked.  If you wish for more advanced behavior, see the
 * examples below.
 *
 * @usage
 *
 * With default click action:
 *
 * ```html
 * <ion-nav-bar>
 *   <ion-nav-back-button class="button-clear">
 *     <i class="ion-arrow-left-c"></i> Back
 *   </ion-nav-back-button>
 * </ion-nav-bar>
 * ```
 *
 * With custom click action, using {@link ionic.service:$ionicNavBarDelegate}:
 *
 * ```html
 * <ion-nav-bar ng-controller="MyCtrl">
 *   <ion-nav-back-button class="button-clear"
 *     ng-click="goBack()">
 *     <i class="ion-arrow-left-c"></i> Back
 *   </ion-nav-back-button>
 * </ion-nav-bar>
 * ```
 * ```js
 * function MyCtrl($scope, $ionicNavBarDelegate) {
 *   $scope.goBack = function() {
 *     $ionicNavBarDelegate.back();
 *   };
 * }
 * ```
 */
IonicModule
.directive('ionNavBackButton', ['$ionicConfig', function($ionicConfig) {
  return {
    restrict: 'E',
    require: '^ionNavBar',
    compile: function(tElement, tAttrs) {

      // clone the back button, but as a <div>
      var divEle = jqLite( '<button>' );
      for (var n in tAttrs) {
        if (isString(tAttrs[n])) {
          divEle.attr(n, tAttrs[n]);
        }
      }
      divEle.addClass('button back-button');
      var btnContent = tElement.html() || '';
      tElement.attr('class', 'hide');
      tElement.empty();

      divEle.html( btnContent );

      if (!/class=.*?ion-|class=.*?icon/.test( btnContent )) {
        var defaultIcon = $ionicConfig.navBar.backButtonIcon();
        if (defaultIcon && defaultIcon !== 'none') {
          divEle.prepend('<i class="icon ' + defaultIcon + '"></i> ');
          divEle.addClass('button-clear');
        }
      }

      return {
        pre: function($scope, $element, $attr, navBarCtrl) {
          navBarCtrl.registerNavElement(divEle[0].outerHTML, 'backButton');
        }
      };
    }
  };
}]);
