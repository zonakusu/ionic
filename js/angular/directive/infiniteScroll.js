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
  // determine pixel refresh distance based on % or value
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
    controller: ['$scope', '$attrs', '$element', function($scope, $attrs,  $element) {
      var self = this;
      self.isLoading = false;

      $scope.icon = function() {
        return angular.isDefined($attrs.icon) ? $attrs.icon : 'ion-loading-d';
      };

      $scope.$on('scroll.infiniteScrollComplete', function() {
        finishInfiniteScroll();
      });

      $scope.$on('$destroy', function() {
        if (self.scrollCtrl && self.scrollCtrl.$element) self.scrollCtrl.$element.off('scroll', self.checkBounds);
        if (self.scrollEl && self.scrollEl.removeEventListener) self.scrollEl.removeEventListener('scroll', self.checkBounds);
      });

      // debounce checking infinite scroll events per animation frame
      self.checkBounds = ionic.animationFrameThrottle(checkInfiniteBounds);

      var onInfinite = function() {
        ionic.requestAnimationFrame(function() {
          $element[0].classList.add('active');
        });
        self.isLoading = true;
        $scope.$parent && $scope.$parent.$apply($attrs.onInfinite || '');
      };

      var finishInfiniteScroll = function() {
        ionic.requestAnimationFrame(function() {
          $element[0].classList.remove('active');
        });
        $timeout(function() {
          if (self.jsScrolling) self.scrollView.resize();
          self.checkBounds();
        }, 0, false);
        self.isLoading = false;
      };

      // check if we've scrolled far enough to trigger an infinite scroll
      function checkInfiniteBounds() {
        if (self.isLoading) return;
        var maxScroll = self.getMaxScroll();

        if (self.jsScrolling) {
          var scrollValues = self.scrollView.getValues();
          if ((maxScroll.left !== -1 && scrollValues.left >= maxScroll.left) ||
            (maxScroll.top !== -1 && scrollValues.top >= maxScroll.top)) {
            onInfinite();
          }
        } else {
          if ((
            maxScroll.left !== -1 &&
            self.scrollEl.scrollLeft >= maxScroll.left - self.scrollEl.clientWidth
            ) || (
            maxScroll.top !== -1 &&
            self.scrollEl.scrollTop >= maxScroll.top - self.scrollEl.clientHeight
            )) {
            onInfinite();
          }
        }
      }


      // determine the threshold at which we should fire an infinite scroll
      // note: this gets processed every scroll event, can it be cached?
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

        // otherwise, native scrolling
        maxValues = {
          left: self.scrollEl.scrollWidth,
          top:  self.scrollEl.scrollHeight
        };
        var computedStyle = window.getComputedStyle(self.scrollEl) || {};

        return {
          left: computedStyle.overflowX === 'scroll' ||
                computedStyle.overflowX === 'auto' ||
                self.scrollEl.style['overflow-x'] === 'scroll' ? // for unit tests
            calculateMaxValue(distance, maxValues.left, isPercent) : -1,
          top: computedStyle.overflowY === 'scroll' ||
               computedStyle.overflowY === 'auto' ||
               self.scrollEl.style['overflow-y'] === 'scroll' ? // for unit tests
            calculateMaxValue(distance, maxValues.top, isPercent) : -1
        };
      };


    }],
    link: function($scope, $element, $attrs, ctrls) {
      var infiniteScrollCtrl = ctrls[1];
      var scrollCtrl = infiniteScrollCtrl.scrollCtrl = ctrls[0];
      var jsScrolling = infiniteScrollCtrl.jsScrolling = !!scrollCtrl;
      // if this view is not beneath a scrollCtrl, it can't be injected, proceed w/ native scrolling
      if (jsScrolling) {
        infiniteScrollCtrl.scrollView = scrollCtrl.scrollView;
      } else {
        // grabbing the scrollable element, to determine dimensions, and current scroll pos
        var scrollEl = ionic.DomUtil.getParentOrSelfWithClass($element[0].parentNode,'overflow-scroll');
        infiniteScrollCtrl.scrollEl = scrollEl;
        // if there's no scroll controller, and no overflow scroll div, infinite scroll wont work
        if (!scrollEl) {
          throw 'Infinite scroll must be used inside a scrollable div';
        }
      }
      //bind to appropriate scroll event
      if (jsScrolling) {
        scrollCtrl.$element.on('scroll', infiniteScrollCtrl.checkBounds);
      } else {
        infiniteScrollCtrl.scrollEl.addEventListener('scroll', infiniteScrollCtrl.checkBounds);
      }
      //Check bounds on start, after scrollView is fully rendered
      setTimeout(infiniteScrollCtrl.checkBounds);
    }
  };
}]);
