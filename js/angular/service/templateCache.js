(function() {
  var templatesToCache = [];

/**
 * @ngdoc service
 * @name $ionicTemplateCache
 * @module ionic
 * @description An angular service that caches template files to reduce flicker and boost performance.
 */
IonicModule
.factory('$ionicTemplateCache', [
'$http',
'$templateCache',
'$timeout',
'$ionicConfig',
function($http, $templateCache, $timeout, $ionicConfig) {
  var toCache = templatesToCache,
      hasRun = false;

  function $ionicTemplateCache(templates){
    if(toCache.length > 500) return false;
    if(typeof templates === 'undefined')return run();
    if(isString(templates))templates = [templates];
    forEach(templates, function(template){
      toCache.push(template);
    });
    // is this is being called after the initial IonicModule.run()
    if(hasRun) run();
  }

  // run through methods
  var run = function(){
    console.log($ionicConfig.prefetchTemplates);
    console.log('prefetching', toCache);
    // ignore if race condition already zeroed out array
    if(toCache.length === 0)return;
    //console.log(toCache);
    var i = 0;
    while ( i < 5 && (template = toCache.pop()) ) {
      if (isString(template)) $http.get(template, { cache: $templateCache });
      i++;
    }
    hasRun = true;
    // only preload 5 templates a second
    if(toCache.length)$timeout(function(){run()}, 1000);
  };

  // default method
  return $ionicTemplateCache;
}])


.config([
'$stateProvider',
function($stateProvider) {
  var stateProviderState = $stateProvider.state;
  $stateProvider.state = function(stateName, definition) {
    var enabled = definition.prefetchTemplate != false;
    if(enabled && isString(definition.templateUrl))templatesToCache.push(definition.templateUrl);
    if(angular.isObject(definition.views)){
      for (var key in definition.views){
        enabled = definition.views[key].prefetchTemplate != false;
        if(enabled && isString(definition.views[key].templateUrl)) templatesToCache.push(definition.views[key].templateUrl);
      }
    }
    return stateProviderState.call($stateProvider, stateName, definition);
  };
}])

.run(function($ionicTemplateCache) {
    $ionicTemplateCache();
});

})();
