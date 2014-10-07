/**
 * @ngdoc directive
 * @name menuClose
 * @module ionic
 * @restrict AC
 *
 * @description
 * Closes a side menu which is currently opened. By default, navigation
 * transitions will not animate between views when the menu is open and
 * this directive is used to close the menu.
 *
 * @usage
 * Below is an example of a link within a side menu. Tapping this link would
 * automatically close the currently opened menu.
 *
 * ```html
 * <a menu-close href="#/home" class="item">Home</a>
 * ```
 */
IonicModule
.directive('menuClose', ['$ionicViewService', function($ionicViewService) {
  return {
    restrict: 'AC',
    require: '^ionSideMenus',
    link: function($scope, $element, $attr, sideMenuCtrl) {
      $element.bind('click', function(){
        // lower priority than navAnimation which allows navAnimation
        // to override this directives nextAnimation() call
        $ionicViewService.nextAnimation('none');
        sideMenuCtrl.close();
      });
    }
  };
}]);
