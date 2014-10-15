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
 *
 * Displaying the previous title on the back button, again using
 * {@link ionic.service:$ionicNavBarDelegate}.
 *
 * ```html
 * <ion-nav-bar ng-controller="MyCtrl">
 *   <ion-nav-back-button class="button-icon">
 *     <i class="icon ion-arrow-left-c"></i>{% raw %}{{getPreviousTitle() || 'Back'}}{% endraw %}
 *   </ion-nav-back-button>
 * </ion-nav-bar>
 * ```
 * ```js
 * function MyCtrl($scope, $ionicNavBarDelegate) {
 *   $scope.getPreviousTitle = function() {
 *     return $ionicNavBarDelegate.getPreviousTitle();
 *   };
 * }
 * ```
 */
IonicModule
.directive('ionNavBackButton', function($ionicNgClick) {
  return {
    restrict: 'E',
    require: '^ionNavBar',
    compile: function(tElement, tAttrs) {
      var btnHtml = tElement[0].outerHTML;
      tElement.remove();
      return {
        pre: function($scope, $element, $attr, navBarCtrl) {
          navBarCtrl.registerBackButton(btnHtml);
        }
      };
    }
  };
});
