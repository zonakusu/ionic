/**
  Push:
  In
  Out

  Pop:
  Out (reverse of push in)
  In (reverse of push out)
*/
IonicModule.animation('.ios-transition', function() {
  var inAnimator = collide.animation({
    easing: 'cubic-bezier(0.4, 0.6, 0.2, 1)',
    duration: 400
  });

  var outAnimator = collide.animation({
    easing: 'cubic-bezier(0.4, 0.6, 0.2, 1)',
    duration: 400
  });

  return {
    enter: function(element, done) {
      var isReverse = element.hasClass('reverse');

      inAnimator
      .on('start', function(v) {
        if(isReverse) {
          element[0].zIndex = 0;
        } else {
          element[0].zIndex = 1;
        }
      })
      .on('step', function(v) {
        if(isReverse) {
          // Slide in from -20% to 0
          element[0].style.webkitTransform = element[0].style.transform = 'translate3d(' + Math.max(0, (-20 + (v*100))) + '%, 0, 0)';
        } else {
          // Slide in from 100% to 0
          element[0].style.webkitTransform = element[0].style.transform = 'translate3d(' + (100 - (v*100)) + '%, 0, 0)';
        }
      })
      .on('complete', function() {
        element[0].style.webkitTransform = element[0].style.transform = '';
        element[0].style.zIndex = '';
        done();
      });

      /*
      if(isReverse) {
        inAnimator.reverse(true);
        inAnimator.percent(0);
        inAnimator.start();
      } else {
        inAnimator.reverse(false);
        inAnimator.percent(0);
        inAnimator.start();
      }
      */
      inAnimator.percent(0);
      inAnimator.start();
    },
    leave: function(element, done) {
      var isReverse = element.hasClass('reverse');

      outAnimator
      .on('start', function(v) {
        if(isReverse) {
          element[0].zIndex = 1;
        } else {
          element[0].zIndex = 0;
        }
      })
      .on('step', function(v) {
        if(isReverse) {
          // Slide from 0 to 100% (off screen)
          element[0].style.webkitTransform = element[0].style.transform = 'translate3d(' + v*100 + '%, 0, 0)';
        } else {
          // Slide from 0 to -20%
          element[0].style.webkitTransform = element[0].style.transform = 'translate3d(' + Math.max(-20, -v*100) + '%, 0, 0)';
        }
      })
      .on('complete', function() {
        element[0].style.webkitTransform = element[0].style.transform = '';
        done();
      });

      /*
      if(element.hasClass('reverse')) {
        outAnimator.reverse(true);
        outAnimator.percent(0);
        outAnimator.start();
      } else {
        outAnimator.reverse(false);
        outAnimator.percent(0);
        outAnimator.start();
      }
      */
      outAnimator.percent(0);
      outAnimator.start();
    },
    step: function(element, percent, done) {
    }
  }
});
