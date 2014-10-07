describe('$animate decorator', function() {
  var topElement;

  beforeEach(module('ionic'));

  beforeEach(function(){
    topElement = angular.element('<div class="top">')
  });


  // describe('commonParent', function(){

  //   it('should find the common parent when siblings', inject(function($animate) {

  //     var elementA = angular.element('<div class="a">');
  //     topElement.append(elementA);

  //     var elementB = angular.element('<div class="b">');
  //     topElement.append(elementB);

  //     expect( $animate.commonParent(elementA, elementB).hasClass('top') ).toEqual(true);

  //   }));

  //   it('should find the common parent when A is one level above B', inject(function($animate) {

  //     var elementA = angular.element('<div class="a">');
  //     topElement.append(elementA);

  //     var level1 = angular.element('<div class="level-1">');
  //     elementA.append(level1);

  //     var elementB = angular.element('<div class="b">');
  //     level1.append(elementB);

  //     expect( $animate.commonParent(elementA, elementB).hasClass('top') ).toEqual(true);

  //   }));

  //   it('should find the common parent when A is two levels above B', inject(function($animate) {

  //     var elementA = angular.element('<div class="a">');
  //     topElement.append(elementA);

  //     var level1 = angular.element('<div class="level-1">');
  //     elementA.append(level1);

  //     var level2 = angular.element('<div class="level-2">');
  //     level1.append(level2);

  //     var elementB = angular.element('<div class="b">');
  //     level2.append(elementB);

  //     expect( $animate.commonParent(elementA, elementB).hasClass('top') ).toEqual(true);

  //   }));

  //   it('should find the common parent when A is one level above B, but B as the first arg', inject(function($animate) {

  //     var elementA = angular.element('<div class="a">');
  //     topElement.append(elementA);

  //     var level1 = angular.element('<div class="level-1">');
  //     elementA.append(level1);

  //     var elementB = angular.element('<div class="b">');
  //     level1.append(elementB);

  //     expect( $animate.commonParent(elementB, elementA).hasClass('top') ).toEqual(true);

  //   }));

  //   it('should find the common parent when A is two levels above B, but B as the first arg', inject(function($animate) {

  //     var elementA = angular.element('<div class="a">');
  //     topElement.append(elementA);

  //     var level1 = angular.element('<div class="level-1">');
  //     elementA.append(level1);

  //     var level2 = angular.element('<div class="level-2">');
  //     level1.append(level2);

  //     var elementB = angular.element('<div class="b">');
  //     level2.append(elementB);

  //     expect( $animate.commonParent(elementB, elementA).hasClass('top') ).toEqual(true);

  //   }));

  //   it('should return parent of elementA when null or length=0 elementB', inject(function($animate) {

  //     var elementA = angular.element('<div class="a">');
  //     topElement.append(elementA);

  //     expect( $animate.commonParent(elementA, null).hasClass('top') ).toEqual(true);
  //     expect( $animate.commonParent(elementA, angular.element.find('no-element')).hasClass('top') ).toEqual(true);

  //   }));

  //   it('should return parent of elementB when null or length=0 elementA', inject(function($animate) {

  //     var elementB = angular.element('<div class="b">');
  //     topElement.append(elementB);

  //     expect( $animate.commonParent(null, elementB).hasClass('top') ).toEqual(true);
  //     expect( $animate.commonParent(angular.element.find('no-element'), elementB).hasClass('top') ).toEqual(true);

  //   }));

  // });

});
