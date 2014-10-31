/**
 * @ngdoc directive
 * @name viewDirection
 * @module ionic
 * @restrict A
 *
 * @description
 *
 * @usage
 *
 * ```html
 * <a view-direction="forward" href="#/home">Home</a>
 * ```
 */
IonicModule
.directive('viewDirection', ['$ionicViewSwitcher', function($ionicViewSwitcher) {
  return {
    restrict: 'A',
    priority: 1000,
    link: function($scope, $element, $attr) {
      $element.bind('click', function(){
        $ionicViewSwitcher.nextDirection( $attr.viewDirection );
      });
    }
  };
}]);
