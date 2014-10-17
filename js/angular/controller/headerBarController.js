IonicModule
.controller('$ionHeaderBar', [
  '$scope',
  '$element',
  '$attrs',
  '$ionicConfig',
function($scope, $element, $attrs, $ionicConfig) {
  var self = this;
  var titleHtml = '';
  var titleLeft = 0;
  var titleRight = 0;
  var titleCss = '';


  self.title = function(newTitleHtml) {
    if (arguments.length && newTitleHtml !== titleHtml) {
      var titleEl = getTitleEle();
      if (titleEl) {
        titleEl.innerHTML = newTitleHtml;
        titleHtml = newTitleHtml;
      }
    }
    return titleHtml;
  };


  self.alignTitle = function(align) {

    var titleEl = getTitleEle();
    if (!titleEl) return;


    ionic.requestAnimationFrame(function(){
      var x, c, childSize, bounds;
      var childNodes = $element[0].childNodes;
      var leftWidth = 0;
      var rightWidth = 0;
      var isCountingRightWidth = false;

      // Compute how wide the left children are
      // Skip all titles (there may still be two titles, one leaving the dom)
      // Once we encounter a titleEl, realize we are now counting the right-buttons, not left
      for (x = 0; x < childNodes.length; x++) {
        c = childNodes[x];

        childSize = 0;
        if (c.nodeType == 1) {
          if (c.classList.contains('hide')) {
            continue;
          }
          if (c.classList.contains('title')) {
            isCountingRightWidth = true;
            continue;
          }
          childSize = c.offsetWidth;

        } else if (c.nodeType == 3 && c.innerText.trim()) {
          bounds = ionic.DomUtil.getTextBounds(c);
          if (bounds) {
            childSize = bounds.width;
          }
        }

        if (childSize) {
          if (isCountingRightWidth) {
            rightWidth += childSize;
          } else {
            leftWidth += childSize;
          }
        }
      }

      align = align || $attrs.alignTitle || $ionicConfig.navBar.alignTitle() || 'center';

      var updateLeft = 0;
      var updateRight = 0;
      var updateCss = '';

      // Size and align the header titleEl based on the sizes of the left and
      // right children, and the desired alignment mode
      if (align == 'center') {
        var margin = Math.max(leftWidth, rightWidth) + 10;
        if (margin > 10) {
          updateLeft = updateRight = margin;
        }
        if (titleEl.offsetWidth < titleEl.scrollWidth) {
          if (rightWidth) {
            updateRight = rightWidth + 5;
          }
        }
      } else if (align == 'left') {
        updateCss = 'title-left';
        if (leftWidth) {
          updateLeft = leftWidth + 15;
        }
        updateRight = rightWidth + 15;
      } else if (align == 'right') {
        updateCss = 'title-right';
        if (rightWidth) {
          updateRight = rightWidth + 15;
        }
        updateLeft = leftWidth + 15;
      }

      if (updateLeft !== titleLeft) {
        titleEl.style.left = updateLeft ? updateLeft + 'px' : '';
        titleLeft = updateLeft;
      }
      if (updateRight !== titleRight) {
        titleEl.style.right = updateRight ? updateRight + 'px' : '';
        titleRight = updateRight;
      }
      if (updateCss !== titleCss) {
        updateCss && titleEl.classList.add(updateCss);
        titleCss && titleEl.classList.remove(titleCss);
        titleCss = updateCss;
      }
    });

  };


  var titleEle;
  function getTitleEle() {
    if (!titleEle) {
      titleEle = $element[0].querySelector('.title');
    }
    return titleEle;
  }


  $scope.$on('$destroy', function(){
    titleEle = null;
  });

}]);

