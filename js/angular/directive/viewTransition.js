/**
 * @ngdoc directive
 * @name viewTransition
 * @module ionic
 * @restrict A
 *
 * @description
 *
 * @usage
 *
 * ```html
 * <a view-transition="none" href="#/home">Home</a>
 * ```
 */
IonicModule
.directive('viewTransition', ['$ionicViewSwitcher', function($ionicViewSwitcher) {
  return {
    restrict: 'A',
    priority: 1000,
    link: function($scope, $element, $attr) {
      $element.bind('click', function(){
        $ionicViewSwitcher.nextTransition( $attr.viewTransition );
      });
    }
  };
}]);
