/**
 * @ngdoc directive
 * @name ionNavButtons
 * @module ionic
 * @restrict E
 * @parent ionNavView
 *
 * @description
 * Use ionNavButtons to set the buttons on your {@link ionic.directive:ionNavBar}
 * from within an {@link ionic.directive:ionView}.
 *
 * Any buttons you declare will be placed onto the navbar's corresponding side. Primary
 * buttons generally map to the left side of the header, and secondary buttons are
 * generally on the right side. However, their exact locations are platform specific.
 * For example, in iOS the primary buttons are on the far left of the header, and
 * secondary buttons are on the far right, with the header title centered between them.
 * For Android however, both groups of buttons are on the far right of the header,
 * with the header title aligned left.
 *
 * @usage
 * ```html
 * <ion-nav-bar>
 * </ion-nav-bar>
 * <ion-nav-view>
 *   <ion-view>
 *     <ion-nav-buttons side="primary">
 *       <button class="button" ng-click="doSomething()">
 *         I'm a button on the primary of the navbar!
 *       </button>
 *     </ion-nav-buttons>
 *     <ion-content>
 *       Some super content here!
 *     </ion-content>
 *   </ion-view>
 * </ion-nav-view>
 * ```
 *
 * @param {string} side The side to place the buttons on in the parent
 * {@link ionic.directive:ionNavBar}. Available: 'primary' or 'secondary'.
 */
IonicModule
.directive('ionNavButtons', function() {
  return {
    require: '^ionNavBar',
    restrict: 'E',
    compile: function(tElement, tAttrs) {
      var spanEle = jqLite('<span>');
      var navElementType;

      if (tAttrs.side == 'secondary' || tAttrs.side == 'right') {
        spanEle.addClass('secondary-buttons');
        navElementType = 'secondaryButtons';
      } else {
        spanEle.addClass('primary-buttons');
        navElementType = 'primaryButtons';
      }

      spanEle.html( tElement.html() );

      tElement.attr('class', 'hide');
      tElement.empty();

      return {
        pre: function($scope, $element, $attrs, navBarCtrl) {

          // if the parent is an ion-view, then these are ion-nav-buttons for JUST this ion-view
          var parentViewCtrl = $element.parent().data('$ionViewController');
          if (parentViewCtrl) {
            parentViewCtrl.registerNavElement(spanEle[0].outerHTML, navElementType);
            return;
          }

          // these are buttons for all views that do not have their own ion-nav-buttons
          navBarCtrl.registerNavElement(spanEle[0].outerHTML, navElementType);
        }
      };
    }
  };
});
