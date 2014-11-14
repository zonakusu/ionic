/**
 * @ngdoc directive
 * @name ionInfiniteScroll
 * @module ionic
 * @parent ionic.directive:ionContent, ionic.directive:ionScroll
 * @restrict E
 *
 * @description
 * The ionInfiniteScroll directive allows you to call a function whenever
 * the user gets to the bottom of the page or near the bottom of the page.
 *
 * The expression you pass in for `on-infinite` is called when the user scrolls
 * greater than `distance` away from the bottom of the content.  Once `on-infinite`
 * is done loading new data, it should broadcast the `scroll.infiniteScrollComplete`
 * event from your controller (see below example).
 *
 * @param {expression} on-infinite What to call when the scroller reaches the
 * bottom.
 * @param {string=} distance The distance from the bottom that the scroll must
 * reach to trigger the on-infinite expression. Default: 1%.
 * @param {string=} icon The icon to show while loading. Default: 'ion-loading-d'.
 *
 * @usage
 * ```html
 * <ion-content ng-controller="MyController">
 *   <ion-list>
 *   ....
 *   ....
 *   </ion-list>
 *
 *   <ion-infinite-scroll
 *     on-infinite="loadMore()"
 *     distance="1%">
 *   </ion-infinite-scroll>
 * </ion-content>
 * ```
 * ```js
 * function MyController($scope, $http) {
 *   $scope.items = [];
 *   $scope.loadMore = function() {
 *     $http.get('/more-items').success(function(items) {
 *       useItems(items);
 *       $scope.$broadcast('scroll.infiniteScrollComplete');
 *     });
 *   };
 *
 *   $scope.$on('$stateChangeSuccess', function() {
 *     $scope.loadMore();
 *   });
 * }
 * ```
 *
 * An easy to way to stop infinite scroll once there is no more data to load
 * is to use angular's `ng-if` directive:
 *
 * ```html
 * <ion-infinite-scroll
 *   ng-if="moreDataCanBeLoaded()"
 *   icon="ion-loading-c"
 *   on-infinite="loadMoreData()">
 * </ion-infinite-scroll>
 * ```
 */
IonicModule
.directive('ionInfiniteScroll', ['$timeout', function($timeout) {
  function calculateMaxValue(distance, maximum, isPercent) {
    return isPercent ?
      maximum * (1 - parseFloat(distance) / 100) :
      maximum - parseFloat(distance);
  }
  return {
    restrict: 'E',
    require: ['?^$ionicScroll', 'ionInfiniteScroll'],
    template: '<i class="icon {{icon()}} icon-refreshing"></i>',
    scope: true,
    controller: ['$scope', '$attrs', function($scope, $attrs) {
      var self = this;
      self.isLoading = false;
      self.scrollView = null; //given by link function
      self.getMaxScroll = function() {
        var distance = ($attrs.distance || '2.5%').trim();
        var isPercent = distance.indexOf('%') !== -1;
        var maxValues = {};
        if (self.jsScrolling) {
          maxValues = self.scrollView.getScrollMax();
          return {
            left: self.scrollView.options.scrollingX ?
              calculateMaxValue(distance, maxValues.left, isPercent) :
              -1,
            top: self.scrollView.options.scrollingY ?
              calculateMaxValue(distance, maxValues.top, isPercent) :
              -1
          };
        }

        // native scrolling
        maxValues = {
          left: self.scrollEl.scrollWidth,
          top:  self.scrollEl.scrollHeight
        };
        var computedStyle = window.getComputedStyle(self.scrollEl) || {};

        return {
          left: computedStyle['overflowX'] == 'scroll' ||
                computedStyle['overflowX'] == 'auto' ||
                self.scrollEl.style['overflow-x'] == 'scroll' ? // for unit tests
            calculateMaxValue(distance, maxValues.left, isPercent) :
            -1,
          top: computedStyle['overflowY'] == 'scroll' ||
               computedStyle['overflowY'] == 'auto' ||
               self.scrollEl.style['overflow-y'] == 'scroll' ? // for unit tests
            calculateMaxValue(distance, maxValues.top, isPercent) :
            -1
        };
      };
    }],
    link: function($scope, $element, $attrs, ctrls) {
      var scrollCtrl = ctrls[0];
      var infiniteScrollCtrl = ctrls[1];
      var jsScrolling = infiniteScrollCtrl.jsScrolling = !!scrollCtrl;
      if (jsScrolling) {
        var scrollView = infiniteScrollCtrl.scrollView = scrollCtrl.scrollView;
      } else {
        var scrollEl = ionic.DomUtil.getParentOrSelfWithClass($element[0].parentNode,'overflow-scroll');
        infiniteScrollCtrl.scrollEl = scrollEl;
        if (!scrollEl) {
          throw 'Infinite scroll must be used inside a scrollable div';
        }
      }

      $scope.icon = function() {
        return angular.isDefined($attrs.icon) ? $attrs.icon : 'ion-loading-d';
      };

      var onInfinite = function() {
        $element[0].classList.add('active');
        infiniteScrollCtrl.isLoading = true;
        $scope.$parent && $scope.$parent.$apply($attrs.onInfinite || '');
      };

      var finishInfiniteScroll = function() {
        $element[0].classList.remove('active');
        $timeout(function() {
          if (jsScrolling) scrollView.resize();
          checkBounds();
        }, 0, false);
        infiniteScrollCtrl.isLoading = false;
      };

      $scope.$on('scroll.infiniteScrollComplete', function() {
        finishInfiniteScroll();
      });

      $scope.$on('$destroy', function() {
        if (scrollCtrl && scrollCtrl.$element) scrollCtrl.$element.off('scroll', checkBounds);
        if (scrollEl && scrollEl.removeEventListener) scrollEl.removeEventListener('scroll', checkBounds);
      });
      var checkBounds = ionic.animationFrameThrottle(checkInfiniteBounds);

      //Check bounds on start, after scrollView is fully rendered
      setTimeout(checkBounds);
      if (jsScrolling) {
        scrollCtrl.$element.on('scroll', checkBounds);
      } else {
        infiniteScrollCtrl.scrollEl.addEventListener('scroll', checkBounds);
      }

      function checkInfiniteBounds() {
        if (infiniteScrollCtrl.isLoading) return;
        var maxScroll = infiniteScrollCtrl.getMaxScroll();

        if (jsScrolling) {
          var scrollValues = scrollView.getValues();
          if ((maxScroll.left !== -1 && scrollValues.left >= maxScroll.left) ||
            (maxScroll.top !== -1 && scrollValues.top >= maxScroll.top)) {
            onInfinite();
          }
        } else {
          if ((maxScroll.left !== -1 && infiniteScrollCtrl.scrollEl.scrollLeft >= maxScroll.left - infiniteScrollCtrl.scrollEl.clientWidth) ||
            (maxScroll.top !== -1 && infiniteScrollCtrl.scrollEl.scrollTop >= maxScroll.top - infiniteScrollCtrl.scrollEl.clientHeight)) {
            onInfinite();
          }
        }
      }
      // For testing
      infiniteScrollCtrl._checkBounds = checkBounds;
    }
  };
}]);
