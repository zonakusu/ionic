IonicModule

.controller('$ionHeaderBar', [
  '$scope',
  '$element',
  '$attrs',
  '$animate',
  '$q',
  '$ionicConfig',
  '$ionicHistory',
function($scope, $element, $attrs, $animate, $q, $ionicConfig, $ionicHistory) {
  var self = this;
  var titleText = '';
  var previousTitleText = '';
  var titleLeft = 0;
  var titleRight = 0;
  var titleCss = '';
  var isBackShown;


  self.title = function(newTitleText) {
    if (arguments.length && newTitleText !== titleText) {
      getEle('.title').innerHTML = newTitleText;
      titleText = newTitleText;
    }
    return titleText;
  };


  self.showBack = function(shouldShow) {
    if (arguments.length && shouldShow !== isBackShown) {
      var backBtnEle = getEle('.back-button');
      if (backBtnEle) {
        backBtnEle.classList[ shouldShow ? 'remove' : 'add' ]('hide');
        isBackShown = shouldShow;
      }
    }
    return isBackShown;
  };


  self.transition = function(animation) {
    if (!animation) return;

    var titleEle = getEle('.title');

    var titleStyle = getEleStyle('.title');
    var buttonsAStyle = getEleStyle('.buttons-a');
    var buttonsBStyle = getEleStyle('.buttons-b');
    var backButtonStyle = getEleStyle('.back-button');

    var backButtonTextEle = getEle('.button-text');

    titleStyle.transition = backButtonTextEle.style.transition = '0s linear';
    setTransition(titleStyle, animation.title.from);

    setTransition(buttonsAStyle, animation.buttons.from);
    setTransition(buttonsBStyle, animation.buttons.from);
    setTransition(backButtonStyle, animation.buttons.from);

    if (!titleEle.ionicTextWidth) {
      loadTextBounds(titleEle);
    }

    var titleTextX = (titleEle.parentElement.offsetWidth / 2) - (titleEle.ionicTextWidth / 2);

    if (animation.title.to.x == 'center') {
      setTransition(backButtonTextEle.style, {
        x: titleTextX
      });
    }

    return function() {
      titleStyle.transition = backButtonTextEle.style.transition = '';

      var backButtonTextX = backButtonTextEle.offsetLeft + 5;
      if (animation.title.to.x == 'left') {
        animation.title.to.x = -(titleTextX - backButtonTextX);

      } else if (animation.title.to.x == 'center') {
        setTransition(backButtonTextEle.style, {
          x: 0
        });

      }

      setTransition(titleStyle, animation.title.to);

      setTransition(buttonsAStyle, animation.buttons.to);
      setTransition(buttonsBStyle, animation.buttons.to);
      setTransition(backButtonStyle, animation.buttons.to);
    };
  };


  function setTransition(eleStyle, animationSetting) {
    if ( isDefined(animationSetting.opacity) ) {
      eleStyle.opacity = animationSetting.opacity;
    }

    if ( isDefined(animationSetting.x) ) {
      var transform;
      if (animationSetting.x == 'right') {
        transform = 'translate3d(100%,0,0)';
      } else if (animationSetting.x == 'left') {
        transform = 'translate3d(-100%,0,0)';
      } else if (animationSetting.x == 'center') {
        transform = 'translate3d(0,0,0)';
      } else {
        transform = 'translate3d(' + animationSetting.x + 'px,0,0)';
      }
      eleStyle[ionic.CSS.TRANSFORM] = transform;
    }

  }


  self.resetBackButton = function() {
    if ($ionicConfig.backButton.previousTitleText() ) {
      var previousTitleEle = getEle('.previous-title');
      if (previousTitleEle) {
        previousTitleEle.classList.remove('hide');

        var newPreviousTitleText = $ionicHistory.backTitle();

        if (newPreviousTitleText !== previousTitleText) {
          previousTitleText = previousTitleEle.innerHTML = newPreviousTitleText;
        }

      }
    }
  };


  self.alignTitle = function(align) {
    var titleEle = getEle('.title');

    align = align || $attrs.alignTitle || $ionicConfig.navBar.alignTitle();

    var widths = self.calcWidths(align, false);

    if ( isBackShown && previousTitleText && $ionicConfig.backButton.previousTitleText() ) {
      var previousTitleWidths = self.calcWidths(align, true);

      var maxButtonsWidth = $element[0].offsetWidth * 0.3;
      if (previousTitleWidths.buttonsLeft < maxButtonsWidth) {
        widths = previousTitleWidths;
      }
    }

    return self.updatePositions(titleEle, widths.titleLeft, widths.titleRight, widths.buttonsRight, widths.css, widths.showPrevTitle);
  };


  self.calcWidths = function(align, isPreviousTitle) {
    var titleEle = getEle('.title');
    var backBtnEle = getEle('.back-button');
    var x, y, z, b, c, d, childSize, bounds;
    var childNodes = $element[0].childNodes;
    var buttonsLeft = 0;
    var buttonsRight = 0;
    var isCountRightOfTitle;
    var updateTitleLeft = 0;
    var updateTitleRight = 0;
    var updateCss = '';
    var backButtonWidth = 0;

    // Compute how wide the left children are
    // Skip all titles (there may still be two titles, one leaving the dom)
    // Once we encounter a titleEle, realize we are now counting the right-buttons, not left
    for (x = 0; x < childNodes.length; x++) {
      c = childNodes[x];

      childSize = 0;
      if (c.nodeType == 1) {
        // element node
        if (c === titleEle) {
          isCountRightOfTitle = true;
          continue;
        }

        if (c.classList.contains('hide')) {
          continue;
        }

        if (isBackShown && c === backBtnEle) {

          for (y = 0; y < c.children.length; y++) {
            b = c.children[y];

            if (b.classList.contains('button-text')) {
              for (z = 0; z < b.children.length; z++) {
                d = b.children[z];

                if (isPreviousTitle) {
                  if ( d.classList.contains('default-title') ) continue;
                  backButtonWidth += b.offsetWidth;
                } else {
                  if ( d.classList.contains('previous-title') ) continue;
                  backButtonWidth += d.offsetWidth;
                }
              }

            } else {
              backButtonWidth += b.offsetWidth;
            }

          }
          childSize += backButtonWidth;

        } else {
          // not the title, not the back button, not a hidden element
          childSize = c.offsetWidth;
        }

      } else if (c.nodeType == 3 && c.nodeValue.trim()) {
        // text node
        bounds = ionic.DomUtil.getTextBounds(c);
        childSize = bounds && bounds.width || 0;
      }

      if (isCountRightOfTitle) {
        buttonsRight += childSize;
      } else {
        buttonsLeft += childSize;
      }
    }

    // Size and align the header titleEle based on the sizes of the left and
    // right children, and the desired alignment mode
    if (align == 'left') {
      updateCss = 'title-left';
      if (buttonsLeft) {
        updateTitleLeft = buttonsLeft + 15;
      }
      updateTitleRight = buttonsRight + 15;

    } else if (align == 'right') {
      updateCss = 'title-right';
      if (buttonsRight) {
        updateTitleRight = buttonsRight + 15;
      }
      updateTitleLeft = buttonsLeft + 15;

    } else {
      // center the default
      var margin = Math.max(buttonsLeft, buttonsRight) + 10;
      if (margin > 10) {
        updateTitleLeft = updateTitleRight = margin;
      }
    }

    return {
      backButtonWidth: backButtonWidth,
      buttonsLeft: buttonsLeft,
      buttonsRight: buttonsRight,
      titleLeft: updateTitleLeft,
      titleRight: updateTitleRight,
      showPrevTitle: isPreviousTitle,
      css: updateCss
    };
  };


  self.updatePositions = function(titleEle, updateTitleLeft, updateTitleRight, buttonsRight, updateCss, showPreviousTitle) {
    var deferred = $q.defer();

    // only make DOM updates when there are actual changes
    if (updateTitleLeft !== titleLeft) {
      titleEle.style.left = updateTitleLeft ? updateTitleLeft + 'px' : '';
      titleLeft = updateTitleLeft;
    }
    if (updateTitleRight !== titleRight) {
      titleEle.style.right = updateTitleRight ? updateTitleRight + 'px' : '';
      titleRight = updateTitleRight;
    }

    if (updateCss !== titleCss) {
      updateCss && titleEle.classList.add(updateCss);
      titleCss && titleEle.classList.remove(titleCss);
      titleCss = updateCss;
    }

    if ($ionicConfig.backButton.previousTitleText()) {
      getEle('.previous-title').classList[ showPreviousTitle ? 'remove' : 'add']('hide');
      getEle('.default-title').classList[ showPreviousTitle ? 'add' : 'remove']('hide');
    }

    ionic.requestAnimationFrame(function(){
      if (titleEle.offsetWidth < titleEle.scrollWidth) {
        titleRight = buttonsRight + 5;
        titleEle.style.right = titleRight ? titleRight + 'px' : '';
      }

      loadTextBounds(titleEle);

      deferred.resolve();
    });

    return deferred.promise;
  };


  var eleCache = {};
  function getEle(selector) {
    if (!eleCache[selector]) {
      eleCache[selector] = $element[0].querySelector(selector);
    }
    return eleCache[selector];
  }

  function getEleStyle(selector) {
    var ele = getEle(selector);
    return ele ? ele.style : {};
  }

  function loadTextBounds(ele) {
    var bounds = ionic.DomUtil.getTextBounds(ele);
    ele.ionicTextWidth = Math.min(bounds && bounds.width || 50, ele.offsetWidth);
  }

  self.destroy = function() {
    for(var n in eleCache) eleCache[n] = null;
  };

  $scope.$on('$destroy', self.destroy);

}]);

