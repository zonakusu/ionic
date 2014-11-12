/**
 * @ngdoc directive
 * @name ionView
 * @module ionic
 * @restrict E
 * @parent ionNavView
 *
 * @description
 * A container for content, used to tell a parent {@link ionic.directive:ionNavBar}
 * about the current view.
 *
 * @usage
 * Below is an example where our page will load with a navbar containing "My Page" as the title.
 *
 * ```html
 * <ion-nav-bar></ion-nav-bar>
 * <ion-nav-view class="slide-left-right">
 *   <ion-view view-title="My Page">
 *     <ion-content>
 *       Hello!
 *     </ion-content>
 *   </ion-view>
 * </ion-nav-view>
 * ```
 *
 * @param {string=} view-title The title to display on the parent {@link ionic.directive:ionNavBar}.
 * @param {boolean=} hide-back-button Whether to hide the back button on the parent
 * {@link ionic.directive:ionNavBar} by default.
 * @param {boolean=} hide-nav-bar Whether to hide the parent
 * {@link ionic.directive:ionNavBar} by default.
 */
IonicModule
.directive('ionView', function() {
  return {
    restrict: 'EA',
    priority: 1000,
    controller: '$ionicView',
    compile: function(tElement) {
      tElement.addClass('pane');
      tElement[0].removeAttribute('title');
      return function link($scope, $element, $attrs, viewCtrl) {
        viewCtrl.init();
      };
    }
  };
});
