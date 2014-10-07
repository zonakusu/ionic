/**
 * @ngdoc directive
 * @name navAnimation
 * @module ionic
 * @restrict A
 *
 * @description
 *
 * @usage
 *
 * ```html
 * <a nav-animation="none" href="#/home">Home</a>
 * ```
 */
IonicModule
.directive('navAnimation', ['$ionicViewService', function($ionicViewService) {
  return {
    restrict: 'A',
    priority: 1000,
    link: function($scope, $element, $attr) {
      $element.bind('click', function(){
        $ionicViewService.nextAnimation( $attr.navAnimation );
      });
    }
  };
}]);
