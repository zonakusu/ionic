IonicModule
.controller('$ionHeaderBar', [
  '$scope',
  '$element',
  '$attrs',
function($scope, $element, $attrs) {
  var self = this;
  var title = '';


  self.title = function(newTitle) {
    if (arguments.length && newTitle !== title) {
      var titleEl = getTitleEle();
      if (titleEl) {
        titleEl.innerHTML = newTitle;
        title = newTitle;
      }
    }
    return title;
  };


  self.alignTitle = function(align) {

    align || (align = $attrs.alignTitle);

    // Find the titleEl element
    var titleEl = getTitleEle();
    if (!titleEl) {
      return;
    }

    //We have to rAF here so all of the elements have time to initialize
    ionic.requestAnimationFrame(function() {
      var i, c, childSize;
      var childNodes = $element[0].childNodes;
      var leftWidth = 0;
      var rightWidth = 0;
      var isCountingRightWidth = false;

      // Compute how wide the left children are
      // Skip all titles (there may still be two titles, one leaving the dom)
      // Once we encounter a titleEl, realize we are now counting the right-buttons, not left
      for (i = 0; i < childNodes.length; i++) {
        c = childNodes[i];
        if (c.classList && c.classList.contains('title')) {
          isCountingRightWidth = true;
          continue;
        }

        childSize = null;
        if (c.nodeType == 3) {
          var bounds = ionic.DomUtil.getTextBounds(c);
          if (bounds) {
            childSize = bounds.width;
          }
        } else if (c.nodeType == 1) {
          childSize = c.offsetWidth;
        }
        if (childSize) {
          if (isCountingRightWidth) {
            rightWidth += childSize;
          } else {
            leftWidth += childSize;
          }
        }
      }

      var margin = Math.max(leftWidth, rightWidth) + 10;

      //Reset left and right before setting again
      titleEl.style.left = titleEl.style.right = '';

      // Size and align the header titleEl based on the sizes of the left and
      // right children, and the desired alignment mode
      if (align == 'center') {
        if (margin > 10) {
          titleEl.style.left = margin + 'px';
          titleEl.style.right = margin + 'px';
        }
        if (titleEl.offsetWidth < titleEl.scrollWidth) {
          if (rightWidth > 0) {
            titleEl.style.right = (rightWidth + 5) + 'px';
          }
        }
      } else if (align == 'left') {
        titleEl.classList.add('title-left');
        if (leftWidth > 0) {
          titleEl.style.left = (leftWidth + 15) + 'px';
        }
      } else if (align == 'right') {
        titleEl.classList.add('title-right');
        if (rightWidth > 0) {
          titleEl.style.right = (rightWidth + 15) + 'px';
        }
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

