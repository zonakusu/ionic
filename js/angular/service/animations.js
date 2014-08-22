/**
  Push:
  In
  Out

  Pop:
  Out (reverse of push in)
  In (reverse of push out)
*/
IonicModule.animation('.ios-transition', function() {

  return {
    enter: function(element, done) {
      var inAnimator = collide.animation({
        easing: 'cubic-bezier(0.4, 0.6, 0.2, 1)',
        duration: 400
      });
      inAnimator.on('step', function(v) {
        element[0].style.webkitTransform = element[0].style.transform = 'translate3d(' + (100 - (v*100)) + '%, 0, 0)';
      }).on('complete', function() {
        element[0].style.webkitTransform = element[0].style.transform = '';
        done();
      });

      if(element.hasClass('reverse')) {
        inAnimator.reverse(true);
        inAnimator.percent(0);
        inAnimator.start();
      } else {
        inAnimator.reverse(false);
        inAnimator.percent(0);
        inAnimator.start();
      }
    },
    leave: function(element, done) {
      var outAnimator = collide.animation({
        easing: 'cubic-bezier(0.4, 0.6, 0.2, 1)',
        duration: 400
      });
      outAnimator.on('step', function(v) {
        element[0].style.webkitTransform = element[0].style.transform = 'translate3d(' + (100 + (v*100)) + '%, 0, 0)';
      }).on('complete', function() {
        element[0].style.webkitTransform = element[0].style.transform = '';
        done();
      });

      if(element.hasClass('reverse')) {
        outAnimator.reverse(true);
        outAnimator.percent(0);
        outAnimator.start();
      } else {
        outAnimator.reverse(false);
        outAnimator.percent(0);
        outAnimator.start();
      }
    },
    step: function(element, percent, done) {
    }
  }
});
