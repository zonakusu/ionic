IonicModule.animation('.ios-transition', function() {
  var animator = collide.animation({
    easing: 'cubic-bezier(0.4, 0.6, 0.2, 1)',
      duration: 400
  })

  return {
    enter: function(element, done) {
      animator.percent(0);
      animator.on('step', function(v) {
        element[0].style.webkitTransform = element[0].style.transform = 'translate3d(' + (-100 + (v*100)) + '%, 0, 0)';
      }).on('complete', function() {
        element[0].style.webkitTransform = element[0].style.transform = '';
        done();
      });
    },
    leave: function(element, done) {
      animator.percent(0);
      animator.on('step', function(v) {
        element[0].style.webkitTransform = element[0].style.transform = 'translate3d(' + (100 + (v*100)) + '%, 0, 0)';
      }).on('complete', function() {
        element[0].style.webkitTransform = element[0].style.transform = '';
        done();
      });
    },
    step: function(element, percent, done) {
    }
  }
});
