describe('Ionic View Service', function() {
  var viewService, viewLocals, rootScope, stateProvider, window;

  beforeEach(module('ionic', function ($stateProvider, $provide) {
    stateProvider = $stateProvider;

    $stateProvider
      .state('home', { url: "/" })
      .state('home.item', { url: "front/:id" })

      .state('about', { url: "/about" })
      .state('about.person', { url: "/person" })
      .state('about.person.item', { url: "/id" })

      .state('about.sidebar', {})
      .state('about.sidebar.item', {})

      .state('contact', { url: "/contact" })

      .state('info', { url: "/info" })

      .state('tabs', { abstract: true })
      .state('tabs.tab1view1', {})
      .state('tabs.tab1view2', {})
      .state('tabs.tab1view3', {})

      .state('tabs.tab2view1', {})
      .state('tabs.tab2view2', {})
      .state('tabs.tab2view3', {})

      .state('tabs.tab3view1', {})
      .state('tabs.tab3view2', {})
      .state('tabs.tab3view3', {});

  }));

  beforeEach(inject(function($ionicViewService, $rootScope, $window, $location) {
    viewService = $ionicViewService;
    rootScope = $rootScope;
    window = $window;
    window.history.go = function(val) { return val; };
    viewLocals = {
      $template: '<ion-nav-view></ion-nav-view>'
    };
  }));

  it('should do nothing if the viewLocals are invalid', inject(function($state) {
    var uiViewScope = {};
    $state.go('home');
    rootScope.$apply();
    registerData = viewService.register(uiViewScope, null);

    expect(registerData.action).toEqual('invalidLocals');
  }));

  it('should create a new view', inject(function($location, $state) {
    $location.url('/home');
    var view1Scope = {};
    var rsp = viewService.register(view1Scope, viewLocals);
    expect(rsp.action).toEqual('initialView');
    expect(rsp.historyId).toEqual('root');

    var currentView = viewService.getCurrentView();
    expect(currentView.viewId).toBeDefined();
    expect(currentView.index).toEqual(0);
    expect(currentView.historyId).toBeDefined();
    expect(currentView.backViewId).toEqual(null);
    expect(currentView.forwardViewId).toEqual(null);
    expect(currentView.url).toEqual('/home');

    var hist = viewService.viewHistory().histories.root;
    expect(hist.cursor).toEqual(0);
    expect(hist.stack.length).toEqual(1);
  }));

  it('should register two sequential views', inject(function($state) {
    $state.go('home');
    rootScope.$apply();
    expect(viewService.getCurrentStateName()).toEqual('home');
    var view1Scope = {};
    var rsp = viewService.register(view1Scope, viewLocals);
    expect(viewService.viewHistory().currentView.stateName).toEqual('home');

    expect(rsp.viewId).not.toBeUndefined();
    expect(viewService.viewHistory().views[rsp.viewId].viewId).toEqual(rsp.viewId);
    expect(viewService.getBackView()).toEqual(null);
    expect(viewService.getForwardView()).toEqual(null);

    expect(viewService.viewHistory().currentView.stateName).toEqual('home');
    var currentView = viewService.getCurrentView();
    expect(currentView.index).toEqual(0);

    $state.go('about');
    rootScope.$apply();
    expect(viewService.getCurrentStateName()).toEqual('about');
    rsp = viewService.register({}, viewLocals);
    expect(rsp.action).toEqual('newView');
    expect(viewService.getCurrentView().stateName).toEqual('about');
    expect(viewService.getBackView().stateName).toEqual('home');
    expect(viewService.getForwardView()).toEqual(null);

    var hist = viewService.viewHistory().histories.root;
    expect(hist.cursor).toEqual(1);
    expect(hist.stack.length).toEqual(2);
  }));

  it('should register views and go back to start', inject(function($state) {
    $state.go('home');
    rootScope.$apply();
    var registerData = viewService.register({}, viewLocals);
    expect(viewService.getCurrentView().stateName).toEqual('home');
    expect(viewService.getBackView()).toEqual(null);
    expect(viewService.getForwardView()).toEqual(null);
    expect(registerData.direction).toEqual('none');
    expect(registerData.action).toEqual('initialView');
    var currentView = viewService.getCurrentView();

    $state.go('about');
    rootScope.$apply();
    registerData = viewService.register({}, viewLocals);
    currentView = viewService.getCurrentView();
    var backView = viewService.getBackView();
    var forwardView = viewService.getForwardView();
    expect(currentView.stateName).toEqual('about');
    expect(currentView.backViewId).toEqual(backView.viewId);
    expect(backView.stateName).toEqual('home');
    expect(forwardView).toEqual(null);
    expect(registerData.direction).toEqual('forward');
    expect(registerData.action).toEqual('newView');

    expect(viewService.viewHistory().histories.root.cursor).toEqual(1);
    expect(viewService.viewHistory().histories.root.stack.length).toEqual(2);

    $state.go('contact');
    rootScope.$apply();
    registerData = viewService.register({}, viewLocals);
    currentView = viewService.getCurrentView();
    //Set test value for remembered scroll
    backView = viewService.getBackView();
    forwardView = viewService.getForwardView();
    expect(backView.stateName).toEqual('about');
    expect(currentView.backViewId).toEqual(backView.viewId);
    expect(viewService.getForwardView()).toEqual(null);
    expect(registerData.direction).toEqual('forward');
    expect(registerData.action).toEqual('newView');

    expect(viewService.viewHistory().histories.root.cursor).toEqual(2);
    expect(viewService.viewHistory().histories.root.stack.length).toEqual(3);

    $state.go('about');
    rootScope.$apply();
    registerData = viewService.register({}, viewLocals);
    currentView = viewService.getCurrentView();
    backView = viewService.getBackView();
    forwardView = viewService.getForwardView();
    expect(currentView.backViewId).toEqual(backView.viewId);
    expect(currentView.forwardViewId).toEqual(forwardView.viewId);
    expect(backView.stateName).toEqual('home');
    expect(forwardView.stateName).toEqual('contact');
    expect(registerData.direction).toEqual('back');
    expect(registerData.action).toEqual('moveBack');

    expect(viewService.viewHistory().histories.root.cursor).toEqual(1);
    expect(viewService.viewHistory().histories.root.stack.length).toEqual(3);

    $state.go('home');
    rootScope.$apply();
    registerData = viewService.register({}, viewLocals);
    currentView = viewService.getCurrentView();
    backView = viewService.getBackView();
    forwardView = viewService.getForwardView();
    expect(currentView.stateName).toEqual('home');
    expect(currentView.forwardViewId).toEqual(forwardView.viewId);
    expect(backView).toEqual(null);
    expect(forwardView.stateName).toEqual('about');
    expect(registerData.direction).toEqual('back');
    expect(registerData.action).toEqual('moveBack');

    expect(viewService.viewHistory().histories.root.cursor).toEqual(0);
    expect(viewService.viewHistory().histories.root.stack.length).toEqual(3);
  }));

  it('should register four views, and not go back to the first', inject(function($state) {
    var homeViewScope = {};
    $state.go('home');
    rootScope.$apply();
    var homeReg = viewService.register(homeViewScope, viewLocals);
    expect(homeReg.action).toEqual('initialView');
    expect(viewService.getCurrentStateName()).toEqual('home');
    expect(viewService.getCurrentView().stateName).toEqual('home');
    expect(viewService.getBackView()).toEqual(null);
    expect(viewService.getForwardView()).toEqual(null);
    expect(viewService.viewHistory().histories.root.cursor).toEqual(0);
    expect(viewService.viewHistory().histories.root.stack.length).toEqual(1);

    var aboutViewScope = {};
    $state.go('about');
    rootScope.$apply();
    var aboutReg = viewService.register(aboutViewScope, viewLocals);
    var currentView = viewService.getCurrentView();
    var backView = viewService.getBackView();
    var forwardView = viewService.getForwardView();
    expect(aboutReg.action).toEqual('newView');
    expect(currentView.viewId).toEqual(aboutReg.viewId);
    expect(currentView.backViewId).toEqual(homeReg.viewId);
    expect(currentView.forwardViewId).toEqual(null);
    expect(backView.viewId).toEqual(homeReg.viewId);
    expect(backView.forwardViewId).toEqual(currentView.viewId);
    expect(viewService.viewHistory().histories.root.cursor).toEqual(1);
    expect(viewService.viewHistory().histories.root.stack.length).toEqual(2);

    var tab1Scope = {};
    viewService.registerHistory(tab1Scope);
    var tab1view1Scope = { $parent: tab1Scope };

    $state.go('tabs.tab1view1');
    rootScope.$apply();
    var tab1view1Reg = viewService.register(tab1view1Scope, viewLocals);
    expect(tab1view1Reg.action).toEqual('newView');

    expect(viewService.viewHistory().histories[tab1Scope.$historyId].historyId).toEqual(tab1Scope.$historyId);
    expect(viewService.viewHistory().histories[tab1Scope.$historyId].stack[0].viewId).toEqual(tab1view1Reg.viewId);
    expect(viewService.viewHistory().histories[tab1Scope.$historyId].cursor).toEqual(0);
    expect(viewService.viewHistory().histories[tab1Scope.$historyId].stack.length).toEqual(1);
    expect(viewService.viewHistory().histories.root.cursor).toEqual(1);
    expect(viewService.viewHistory().histories.root.stack.length).toEqual(2);

    currentView = viewService.getCurrentView();
    backView = viewService.getBackView();
    forwardView = viewService.getForwardView();
    expect(currentView.viewId).toEqual(tab1view1Reg.viewId);
    expect(currentView.historyId).toEqual(tab1Scope.$historyId);
    expect(currentView.historyId).toEqual(tab1view1Reg.historyId);
    expect(currentView.backViewId).toEqual(aboutReg.viewId);
    expect(currentView.forwardViewId).toEqual(null);
    expect(backView.viewId).toEqual(aboutReg.viewId);
    expect(backView.forwardViewId).toEqual(currentView.viewId);

    $state.go('home');
    rootScope.$apply();
    var home2reg = viewService.register({}, viewLocals);
    expect(home2reg.action).toEqual('newView');
    currentView = viewService.getCurrentView();
    backView = viewService.getBackView();
    forwardView = viewService.getForwardView();
    expect(currentView.backViewId).toEqual(tab1view1Reg.viewId);
    expect(currentView.forwardViewId).toEqual(null);
    expect(backView.viewId).toEqual(tab1view1Reg.viewId);
    expect(backView.forwardViewId).toEqual(currentView.viewId);

    expect(viewService.viewHistory().histories.root.cursor).toEqual(2);
    expect(viewService.viewHistory().histories.root.stack.length).toEqual(3);
    expect(viewService.viewHistory().histories[tab1Scope.$historyId].cursor).toEqual(0);
    expect(viewService.viewHistory().histories[tab1Scope.$historyId].stack.length).toEqual(1);
  }));

  it('should register views in the same history, go back, then overwrite the forward views', inject(function($state) {
    var homeViewScope = {};
    $state.go('home');
    rootScope.$apply();
    var homeReg = viewService.register(homeViewScope, viewLocals);
    currentView = viewService.getCurrentView();
    backView = viewService.getBackView();
    forwardView = viewService.getForwardView();
    expect(currentView.viewId).toEqual(homeReg.viewId);
    expect(currentView.backViewId).toEqual(null);
    expect(currentView.forwardViewId).toEqual(null);
    expect(viewService.viewHistory().histories.root.cursor).toEqual(0);
    expect(viewService.viewHistory().histories.root.stack.length).toEqual(1);
    expect(homeReg.action).toEqual('initialView');
    expect(homeReg.direction).toEqual('none');

    var aboutScope = {};
    $state.go('about');
    rootScope.$apply();
    var aboutReg = viewService.register(aboutScope, viewLocals);
    currentView = viewService.getCurrentView();
    backView = viewService.getBackView();
    forwardView = viewService.getForwardView();
    expect(currentView.viewId).toEqual(aboutReg.viewId);
    expect(currentView.backViewId).toEqual(homeReg.viewId);
    expect(currentView.forwardViewId).toEqual(null);
    expect(backView.viewId).toEqual(homeReg.viewId);
    expect(backView.forwardViewId).toEqual(currentView.viewId);
    expect(viewService.viewHistory().histories.root.cursor).toEqual(1);
    expect(viewService.viewHistory().histories.root.stack.length).toEqual(2);
    expect(aboutReg.action).toEqual('newView');
    expect(aboutReg.direction).toEqual('forward');

    homeViewScope = {};
    $state.go('home');
    rootScope.$apply();
    var homeReg2 = viewService.register(homeViewScope, viewLocals);
    currentView = viewService.getCurrentView();
    backView = viewService.getBackView();
    forwardView = viewService.getForwardView();
    expect(currentView.viewId).toEqual(homeReg.viewId);
    expect(currentView.backViewId).toEqual(null);
    expect(currentView.forwardViewId).toEqual(aboutReg.viewId);
    expect(forwardView.viewId).toEqual(aboutReg.viewId);
    expect(forwardView.backViewId).toEqual(currentView.viewId);
    expect(viewService.viewHistory().histories.root.cursor).toEqual(0);
    expect(viewService.viewHistory().histories.root.stack.length).toEqual(2);
    expect(homeReg2.action).toEqual('moveBack');
    expect(homeReg2.direction).toEqual('back');

    // this should overwrite that we went to the "about" view
    contactScope = {};
    $state.go('contact');
    rootScope.$apply();
    var contactReg = viewService.register(contactScope, viewLocals);
    currentView = viewService.getCurrentView();
    backView = viewService.getBackView();
    forwardView = viewService.getForwardView();
    expect(currentView.backViewId).toEqual(homeReg.viewId);
    expect(currentView.forwardViewId).toEqual(null);
    expect(forwardView).toEqual(null);
    expect(backView.viewId).toEqual(homeReg.viewId);
    expect(backView.forwardViewId).toEqual(currentView.viewId);
    expect(viewService.viewHistory().histories.root.cursor).toEqual(1);
    expect(viewService.viewHistory().histories.root.stack.length).toEqual(2);
    expect(contactReg.action).toEqual('newView');
    expect(contactReg.direction).toEqual('forward');
  }));

  it('should start at root, go in to tabs, come out to root, go in to tabs, come out, and history should be at the root', inject(function($state) {
    var rootViewContainer = {};
    $state.go('home');
    rootScope.$apply();
    var registerData = viewService.register(rootViewContainer, viewLocals);
    expect(registerData.action).toEqual('initialView');
    expect(registerData.direction).toEqual('none');
    expect(registerData.historyId).toEqual('root');

    // register the tabs container
    var tabsContainer = { $parent: tabsContainer };
    var tabsHistoryId = viewService.registerHistory(tabsContainer);

    // put a view inside of the tabs container
    var tabView1 = { $parent: tabsContainer };

    // nav to the tab view
    $state.go('tabs.tab1view1');
    rootScope.$apply();
    registerData = viewService.register(tabView1, viewLocals);
    var currentView = viewService.getCurrentView();
    expect(registerData.action).toEqual('newView');
    expect(registerData.direction).toEqual('enter');
    expect(currentView.historyId).toEqual(tabsHistoryId);

    // nav back to the root
    $state.go('home');
    rootScope.$apply();
    registerData = viewService.register(rootViewContainer, viewLocals);
    currentView = viewService.getCurrentView();
    expect(registerData.action).toEqual('moveBack');
    expect(registerData.direction).toEqual('exit');
    expect(currentView.historyId).toEqual('root');

    // nav back to the tabs
    $state.go('tabs.tab1view1');
    rootScope.$apply();
    registerData = viewService.register(tabView1, viewLocals);
    currentView = viewService.getCurrentView();
    expect(registerData.action).toEqual('moveForward');
    expect(registerData.direction).toEqual('enter');
    expect(currentView.historyId).toEqual(tabsHistoryId);

    // nav back to the root
    $state.go('home');
    rootScope.$apply();
    registerData = viewService.register(rootViewContainer, viewLocals);
    currentView = viewService.getCurrentView();
    expect(registerData.action).toEqual('moveBack');
    expect(registerData.direction).toEqual('exit');
    expect(currentView.historyId).toEqual('root');
  }));

  it('should go to a new history, come back out, go to same history and come back out', inject(function($state) {
    var rootViewContainer = {};
    $state.go('home');
    rootScope.$apply();
    var homeReg = viewService.register(rootViewContainer, viewLocals);
    var currentView = viewService.getCurrentView();
    expect(currentView.historyId).toEqual('root');
    expect(viewService.viewHistory().histories.root.cursor).toEqual(0);
    expect(homeReg.action).toEqual('initialView');
    expect(homeReg.historyId).toEqual('root');

    // each tab gets its own history in the tabs directive
    // create a new tab and its history
    var tabs1Container = { $parent: rootViewContainer };
    viewService.registerHistory(tabs1Container);
    expect(tabs1Container.$historyId).toBeDefined();
    expect(rootViewContainer.$historyId).not.toEqual(tabs1Container.$historyId);
    var originalTab1ViewId = tabs1Container.$historyId;

    // the actual view within the tab renders
    // nav to tab1 which has its own history
    var tab1View = { $parent: tabs1Container };
    $state.go('tabs.tab1view1');
    rootScope.$apply();
    var tab1view1Reg = viewService.register(tab1View, viewLocals);
    currentView = viewService.getCurrentView();
    expect(currentView.historyId).toEqual(tabs1Container.$historyId);
    expect(viewService.viewHistory().histories[tabs1Container.$historyId].parentHistoryId).toEqual('root');
    expect(viewService.viewHistory().histories[tabs1Container.$historyId].cursor).toEqual(0);
    expect(viewService.viewHistory().histories[tabs1Container.$historyId].stack.length).toEqual(1);
    expect(tab1view1Reg.historyId).not.toEqual(homeReg.historyId);
    expect(tab1view1Reg.action).toEqual('newView');
    expect(tab1view1Reg.direction).toEqual('enter');

    currentView = viewService.getCurrentView();
    backView = viewService.getBackView();
    forwardView = viewService.getForwardView();

    expect(currentView.stateName).toEqual('tabs.tab1view1');
    expect(currentView.viewId).toEqual(tab1view1Reg.viewId);
    expect(currentView.backViewId).toEqual(homeReg.viewId);
    expect(currentView.forwardViewId).toEqual(null);

    expect(backView.stateName).toEqual('home');
    expect(backView.backViewId).toEqual(null);
    expect(backView.forwardViewId).toEqual(currentView.viewId);

    expect(forwardView).toEqual(null);

    // nav back to the home in the root history
    homeViewScope = {};
    $state.go('home');
    rootScope.$apply();
    homeReg = viewService.register(homeViewScope, viewLocals);
    expect(viewService.viewHistory().histories.root.cursor).toEqual(0);
    expect(viewService.viewHistory().histories.root.stack.length).toEqual(1);
    expect(homeReg.historyId).toEqual('root');
    expect(homeReg.action).toEqual('moveBack');
    expect(homeReg.direction).toEqual('exit');

    currentView = viewService.getCurrentView();
    backView = viewService.getBackView();
    forwardView = viewService.getForwardView();

    expect(currentView.stateName).toEqual('home');
    expect(currentView.backViewId).toEqual(null);
    expect(currentView.forwardViewId).toEqual(tab1view1Reg.viewId);

    expect(forwardView.stateName).toEqual('tabs.tab1view1');
    expect(forwardView.viewId).toEqual(tab1view1Reg.viewId);
    expect(forwardView.backViewId).toEqual(currentView.viewId);
    expect(forwardView.forwardViewId).toEqual(null);
    expect(viewService.viewHistory().histories.root.cursor).toEqual(0);
    expect(viewService.viewHistory().histories.root.stack.length).toEqual(1);

    // create a new tab and its history
    tabs1Container = { $parent: rootViewContainer };
    viewService.registerHistory(tabs1Container);
    expect(originalTab1ViewId).not.toEqual(tabs1Container.$historyId);

    tab1View = { $parent: tabs1Container };
    $state.go('tabs.tab1view1');
    rootScope.$apply();
    tab1view1Reg = viewService.register(tab1View);
    expect(tab1view1Reg.action).toEqual('moveForward');
    expect(tab1view1Reg.direction).toEqual('enter');
    expect(tab1view1Reg.historyId).toEqual(originalTab1ViewId);
    expect(originalTab1ViewId).toEqual(tabs1Container.$historyId);
    expect(tab1view1Reg.historyId).not.toEqual('root');
    expect(viewService.viewHistory().histories[tab1view1Reg.historyId].cursor).toEqual(0);
    expect(viewService.viewHistory().histories[tab1view1Reg.historyId].stack.length).toEqual(1);

    currentView = viewService.getCurrentView();
    expect(currentView.historyId).toEqual(tabs1Container.$historyId);
    expect(viewService.viewHistory().histories[tabs1Container.$historyId].cursor).toEqual(0);

    currentView = viewService.getCurrentView();
    backView = viewService.getBackView();
    forwardView = viewService.getForwardView();

    expect(currentView.stateName).toEqual('tabs.tab1view1');
    expect(currentView.viewId).toEqual(tab1view1Reg.viewId);
    expect(currentView.backViewId).toEqual(homeReg.viewId);
    expect(currentView.forwardViewId).toEqual(null);

    expect(backView.viewId).toEqual(homeReg.viewId);
    expect(backView.stateName).toEqual('home');
    expect(backView.backViewId).toEqual(null);
    expect(backView.forwardViewId).toEqual(currentView.viewId);

    expect(forwardView).toEqual(null);
    expect(viewService.viewHistory().histories.root.cursor).toEqual(0);
  }));

  it('should nav to a history, move around in it, and come back', inject(function($state) {
    // go to the first page
    $state.go('home');
    rootScope.$apply();
    var homeReg = viewService.register({}, viewLocals);

    // each tab gets its own history in the tabs directive
    var tab1Scope = { };
    var tab2Scope = { };
    var tab3Scope = { };
    viewService.registerHistory(tab1Scope);
    viewService.registerHistory(tab2Scope);
    viewService.registerHistory(tab3Scope);

    // the actual view renders
    var tab1view1Scope = { $parent: tab1Scope };
    $state.go('tabs.tab1view1');
    rootScope.$apply();
    var tab1view1ScopeReg = viewService.register(tab1view1Scope, viewLocals);
    expect(viewService.getCurrentStateName()).toEqual('tabs.tab1view1');
    expect(viewService.getBackView().stateName).toEqual('home');
    expect(viewService.getForwardView()).toEqual(null);
    var lastView = viewService.getCurrentView();
    expect(lastView.index).toEqual(0);
    expect(tab1view1ScopeReg.viewId).toEqual(lastView.viewId);
    expect(tab1view1ScopeReg.action).toEqual('newView');
    expect(tab1view1ScopeReg.direction).toEqual('enter');
    expect(viewService.viewHistory().histories[tab1view1ScopeReg.historyId].cursor).toEqual(0);
    expect(viewService.viewHistory().histories[tab1view1ScopeReg.historyId].stack.length).toEqual(1);

    // inside first tab, go to another list inside the same tab
    var tab1view2Scope = { $parent: tab1Scope };
    $state.go('tabs.tab1view2');
    rootScope.$apply();
    var tab1view2ScopeReg = viewService.register(tab1view2Scope, viewLocals);
    expect(viewService.getCurrentStateName()).toEqual('tabs.tab1view2');
    expect(viewService.getBackView().stateName).toEqual('tabs.tab1view1');
    expect(viewService.getForwardView()).toEqual(null);
    lastView = viewService.getCurrentView();
    expect(lastView.index).toEqual(1);
    expect(tab1view2ScopeReg.viewId).toEqual(lastView.viewId);
    expect(tab1view2ScopeReg.action).toEqual('newView');
    expect(tab1view2ScopeReg.direction).toEqual('forward');
    expect(viewService.viewHistory().histories[tab1view2ScopeReg.historyId].cursor).toEqual(1);
    expect(viewService.viewHistory().histories[tab1view2ScopeReg.historyId].stack.length).toEqual(2);

    // go back one within the tab
    $state.go('tabs.tab1view1');
    rootScope.$apply();
    var tab1view1Scope2Reg = viewService.register(tab1view1Scope, viewLocals);
    expect(viewService.getCurrentStateName()).toEqual('tabs.tab1view1');
    expect(viewService.getBackView().stateName).toEqual('home');
    expect(viewService.getForwardView().stateName).toEqual('tabs.tab1view2');
    lastView = viewService.getCurrentView();
    expect(lastView.index).toEqual(0);
    expect(tab1view1Scope2Reg.action).toEqual('moveBack');
    expect(tab1view1Scope2Reg.direction).toEqual('back');
    expect(viewService.viewHistory().histories[tab1view1Scope2Reg.historyId].cursor).toEqual(0);
    expect(viewService.viewHistory().histories[tab1view1Scope2Reg.historyId].stack.length).toEqual(2);

    // go back again, and should break out of the tab's history
    $state.go('home');
    rootScope.$apply();
    var homeReg2 = viewService.register({}, viewLocals);
    expect(viewService.getCurrentStateName()).toEqual('home');
    expect(homeReg2.historyId).toEqual('root');
    expect(homeReg2.action).toEqual('moveBack');
    expect(homeReg2.direction).toEqual('exit');
    expect(viewService.viewHistory().histories[homeReg2.historyId].cursor).toEqual(0);
    expect(viewService.viewHistory().histories[homeReg2.historyId].stack.length).toEqual(1);

    $state.go('about');
    rootScope.$apply();
    var aboutReg = viewService.register({}, viewLocals);
    expect(viewService.getCurrentStateName()).toEqual('about');
    expect(aboutReg.historyId).toEqual('root');
    expect(aboutReg.action).toEqual('newView');
    expect(aboutReg.direction).toEqual('forward');
    expect(viewService.viewHistory().histories[aboutReg.historyId].cursor).toEqual(1);
    expect(viewService.viewHistory().histories[aboutReg.historyId].stack.length).toEqual(2);
  }));

  it('should init a view that has tabs in it, two registers, but one page load', inject(function($location, $state) {
    $state.go('tabs.tab1view1');
    rootScope.$apply();

    var rootViewScope = {};
    var rootReg = viewService.register(rootViewScope, viewLocals);
    expect(rootReg.action).toEqual('initialView');
    expect(rootReg.direction).toEqual('none');

    var tab1Scope = {};
    viewService.registerHistory(tab1Scope);
    var tab1view1Scope = { $parent: tab1Scope };

    var registerData = viewService.register(tab1view1Scope, viewLocals);
    expect(registerData.action).toEqual('newView');
    expect(registerData.direction).toEqual('none');
  }));

  it('should change to history that already exists, and go to its last current view', inject(function($location, $state) {
    // register tabs
    var tab1Scope = {};
    var tab2Scope = {};
    viewService.registerHistory(tab1Scope);
    viewService.registerHistory(tab2Scope);
    var orgTab1HistoryId = tab1Scope.$historyId;

    // render first view in tab1
    var tab1view1Scope = { $parent: tab1Scope };
    $state.go('tabs.tab1view1');
    rootScope.$apply();
    var registerData = viewService.register(tab1view1Scope, viewLocals);
    expect(viewService.getCurrentStateName()).toEqual('tabs.tab1view1');
    expect(viewService.viewHistory().histories[tab1Scope.$historyId].cursor).toEqual(0);
    expect(viewService.viewHistory().histories[tab1Scope.$historyId].stack.length).toEqual(1);
    expect(registerData.action).toEqual('initialView');
    expect(registerData.direction).toEqual('none');

    // render second view in tab1
    var tab1view2Scope = { $parent: tab1Scope };
    $state.go('tabs.tab1view2');
    rootScope.$apply();
    registerData = viewService.register(tab1view2Scope, viewLocals);
    expect(viewService.getCurrentStateName()).toEqual('tabs.tab1view2');
    expect(viewService.viewHistory().histories[tab1Scope.$historyId].cursor).toEqual(1);
    expect(viewService.viewHistory().histories[tab1Scope.$historyId].stack.length).toEqual(2);
    expect(registerData.action).toEqual('newView');
    expect(registerData.direction).toEqual('forward');
    currentView = viewService.getCurrentView();
    expect(currentView.viewId).toEqual(registerData.viewId);

    // go back to the first view again in tab 1
    tab1view1Scope = { $parent: tab1Scope };
    $state.go('tabs.tab1view1');
    rootScope.$apply();
    registerData = viewService.register(tab1view1Scope, viewLocals);
    expect(viewService.getCurrentStateName()).toEqual('tabs.tab1view1');
    currentView = viewService.getCurrentView();
    expect(currentView.viewId).toEqual(registerData.viewId);
    forwardView = viewService.getForwardView();
    expect(currentView.forwardViewId).toEqual(viewService.viewHistory().histories[tab1Scope.$historyId].stack[1].viewId);
    expect(forwardView.backViewId).toEqual(currentView.viewId);
    expect(viewService.viewHistory().histories[tab1Scope.$historyId].cursor).toEqual(0);
    expect(viewService.viewHistory().histories[tab1Scope.$historyId].stack.length).toEqual(2);
    expect(registerData.action).toEqual('moveBack');
    expect(registerData.direction).toEqual('back');

    // render first view in tab2
    var tab2view1Scope = { $parent: tab2Scope };
    $state.go('tabs.tab2view1');
    rootScope.$apply();
    registerData = viewService.register(tab2view1Scope, viewLocals);
    expect(viewService.getCurrentStateName()).toEqual('tabs.tab2view1');
    expect(viewService.viewHistory().histories[tab2Scope.$historyId].cursor).toEqual(0);
    expect(viewService.viewHistory().histories[tab2Scope.$historyId].stack.length).toEqual(1);
    expect(registerData.action).toEqual('newView');
    expect(registerData.direction).toEqual('switch');
    var tab2view1ViewId = registerData.viewId;

    // tab1's forward history should be destroyed
    expect(viewService.viewHistory().histories[tab1Scope.$historyId].stack.length).toEqual(1);
    expect(viewService.viewHistory().histories[tab1Scope.$historyId].stack[0].forwardViewId).toEqual(registerData.viewId);

    // go back to tab1, and it should load the first view of tab1
    expect(tab1Scope.$historyId).toEqual(orgTab1HistoryId);
    rootScope.$broadcast("viewState.changeHistory", { historyId: tab1Scope.$historyId, enableUrlChange: false });
    rootScope.$apply();
    expect(viewService.getCurrentStateName()).toEqual('tabs.tab1view1');
    registerData = viewService.register(tab1view1Scope, viewLocals);
    var tab1view1ViewId = registerData.viewId;
    expect(registerData.action).toEqual('moveBack');
    expect(registerData.direction).toEqual('switch');

    currentView = viewService.getCurrentView();
    expect(currentView.viewId).toEqual(registerData.viewId);
    expect(currentView.historyId).toEqual(orgTab1HistoryId);
    expect(currentView.forwardViewId).toEqual(tab2view1ViewId);

    expect(viewService.viewHistory().histories[tab1Scope.$historyId].cursor).toEqual(0);
    expect(viewService.viewHistory().histories[tab1Scope.$historyId].stack.length).toEqual(1);

    currentView = viewService.getCurrentView();
    expect(currentView.stateName).toEqual('tabs.tab1view1');
    expect(currentView.historyId).toEqual(tab1Scope.$historyId);

    // go to view 2 in tab 1
    tab1view2Scope = { $parent: tab1Scope };
    $state.go('tabs.tab1view2');
    rootScope.$apply();
    registerData = viewService.register(tab1view2Scope, viewLocals);
    expect(registerData.historyId).toEqual(orgTab1HistoryId);
    var tab1view2ViewId = registerData.viewId;
    expect(viewService.getCurrentStateName()).toEqual('tabs.tab1view2');
    expect(viewService.viewHistory().histories[tab1Scope.$historyId].stack.length).toEqual(2);
    expect(viewService.viewHistory().histories[tab1Scope.$historyId].cursor).toEqual(1);
    expect(registerData.action).toEqual('newView');
    expect(registerData.direction).toEqual('forward');
    expect(viewService.viewHistory().views[tab1view2ViewId].backViewId).toEqual(tab1view1ViewId);

    // go to view 1 in tab 2
    tab2view1Scope = { $parent: tab2Scope };
    $state.go('tabs.tab2view1');
    rootScope.$apply();
    registerData = viewService.register(tab2view1Scope, viewLocals);
    expect(viewService.getCurrentStateName()).toEqual('tabs.tab2view1');
    expect(viewService.viewHistory().histories[tab2Scope.$historyId].cursor).toEqual(0);
    expect(registerData.action).toEqual('moveBack');
    expect(registerData.direction).toEqual('switch');
    currentView = viewService.getCurrentView();
    expect(currentView.backViewId).toEqual(tab1view2ViewId);
    expect(currentView.forwardViewId).toEqual(null);

    // should be remembered at the tab 1 view 2
    rootScope.$broadcast("viewState.changeHistory", { historyId: tab1Scope.$historyId });
    rootScope.$apply();
    expect(viewService.getCurrentStateName()).toEqual('tabs.tab1view2');
    expect(viewService.viewHistory().histories[tab1Scope.$historyId].cursor).toEqual(1);
  }));

  it('should go one level in tab1, vist tab2 and tab3, come back to tab1 and still be at spot', inject(function($location, $state) {
    var tab1Container = {};
    var tab2Container = {};
    var tab3Container = {};
    viewService.registerHistory(tab1Container);
    viewService.registerHistory(tab2Container);
    viewService.registerHistory(tab3Container);

    // register tab1, view1
    $state.go('tabs.tab1view1');
    rootScope.$apply();
    var tab1view1Reg = viewService.register(tab1Container, viewLocals);
    expect(viewService.viewHistory().histories[tab1Container.$historyId].cursor).toEqual(0);

    // register tab1, view2
    $state.go('tabs.tab1view2');
    rootScope.$apply();
    var tab1view2Reg = viewService.register(tab1Container, viewLocals);
    expect(viewService.viewHistory().histories[tab1Container.$historyId].cursor).toEqual(1);
    currentView = viewService.getCurrentView();
    expect(currentView.backViewId).toEqual(tab1view1Reg.viewId);

    // register tab2, view1
    $state.go('tabs.tab2view1');
    rootScope.$apply();
    var tab2view1Reg = viewService.register(tab2Container, viewLocals);

    // register tab3, view1
    $state.go('tabs.tab3view1');
    rootScope.$apply();
    var tab3view1Reg = viewService.register(tab3Container, viewLocals);

    // register tab 1, view 2 again
    $state.go('tabs.tab1view2');
    rootScope.$apply();
    var tab1view2Reg2 = viewService.register(tab1Container, viewLocals);
    expect(tab1view2Reg2.action).toEqual('moveBack');
    expect(tab1view2Reg2.viewId).toEqual(tab1view2Reg.viewId);


    var currentViewId = tab1view2Reg.viewId;
    expect(viewService.viewHistory().histories[tab1view2Reg.historyId].stack.length).toEqual(2);
    backView = viewService.getBackView();
    expect(backView).toBeDefined();
    expect( Object.keys(viewService.viewHistory().views).length ).toEqual(4);
    viewService.clearHistory();
    expect( Object.keys(viewService.viewHistory().views).length ).toEqual(1);
    expect(viewService.viewHistory().histories[tab1view2Reg.historyId].stack.length).toEqual(1);
    backView = viewService.getBackView();
    expect(backView).toEqual(null);
    currentView = viewService.getCurrentView();
    expect(currentView.viewId).toEqual(currentViewId);
  }));

  it('should go one level in tab1, visit tab2, go to tab2 page2, visit, tab1, tab3, history still page 2 tab2', inject(function($location, $state) {
    var tab1Container = {};
    var tab2Container = {};
    var tab3Container = {};
    viewService.registerHistory(tab1Container);
    viewService.registerHistory(tab2Container);
    viewService.registerHistory(tab3Container);

    // register tab1, view1
    $state.go('tabs.tab1view1');
    rootScope.$apply();
    var tab1view1Reg = viewService.register(tab1Container, viewLocals);
    expect(tab1view1Reg.action).toEqual('initialView');
    expect(tab1view1Reg.direction).toEqual('none');
    expect(viewService.viewHistory().histories[tab1Container.$historyId].cursor).toEqual(0);

    // register tab2, view1
    $state.go('tabs.tab2view1');
    rootScope.$apply();
    var tab2view1Reg = viewService.register(tab2Container, viewLocals);
    expect(tab2view1Reg.action).toEqual('newView');
    expect(tab2view1Reg.direction).toEqual('switch');
    expect(viewService.viewHistory().histories[tab1Container.$historyId].stack[0].forwardViewId).toEqual(tab2view1Reg.viewId);
    expect(viewService.viewHistory().histories[tab2Container.$historyId].cursor).toEqual(0);

    // register tab2, view2
    $state.go('tabs.tab2view2');
    rootScope.$apply();
    var tab2view2Reg = viewService.register(tab2Container, viewLocals);
    expect(tab2view2Reg.action).toEqual('newView');
    expect(tab2view2Reg.direction).toEqual('forward');
    expect(viewService.viewHistory().histories[tab2Container.$historyId].cursor).toEqual(1);
    expect(viewService.viewHistory().histories[tab2Container.$historyId].stack.length).toEqual(2);

    // register tab1, view1
    $state.go('tabs.tab1view1');
    rootScope.$apply();
    tab1view1Reg = viewService.register(tab1Container, viewLocals);
    expect(tab1view1Reg.action).toEqual('moveBack');
    expect(tab1view1Reg.direction).toEqual('switch');
    expect(viewService.viewHistory().histories[tab2Container.$historyId].cursor).toEqual(1);
    expect(viewService.viewHistory().histories[tab2Container.$historyId].stack.length).toEqual(2);

    // register tab3, view1
    $state.go('tabs.tab3view1');
    rootScope.$apply();
    var tab3view1Reg = viewService.register(tab3Container, viewLocals);
    expect(tab3view1Reg.action).toEqual('newView');
    expect(tab3view1Reg.direction).toEqual('switch');

    var tab2Hist = viewService.viewHistory().histories[ tab2Container.$historyId ];
    var currentStateId = viewService.getCurrentStateId();
    currentView = viewService.getCurrentView();
    expect(currentView).toBeDefined();
    expect(currentView.historyId).not.toEqual(tab2Hist.historyId);
    expect(tab2Hist.cursor).toEqual(1);
    expect(tab2Hist.stack.length).toEqual(2);
    expect(tab2Hist.cursor).toBeLessThan(tab2Hist.stack.length);

    // register tab2, view2
    $state.go('tabs.tab2view2');
    rootScope.$apply();
    var tab2view2RegAgain = viewService.register(tab2Container, viewLocals);
    expect(tab2view2RegAgain.historyId).toEqual(tab2view2Reg.historyId);
    expect(viewService.viewHistory().histories[tab2Container.$historyId].cursor).toEqual(1);
    expect(viewService.viewHistory().histories[tab2Container.$historyId].stack.length).toEqual(2);
  }));

  it('should go in and out of tabs and root with correct directions', inject(function($location, $state) {
    var tab1Container = {};
    viewService.registerHistory(tab1Container);

    // register tab1, view1
    $state.go('tabs.tab1view1');
    rootScope.$apply();
    var tab1view1Reg = viewService.register(tab1Container, viewLocals);
    expect(tab1view1Reg.action).toEqual('initialView');
    expect(tab1view1Reg.direction).toEqual('none');

    $state.go('home');
    rootScope.$apply();
    var homeReg = viewService.register({}, viewLocals);
    expect(homeReg.action).toEqual('newView');
    expect(homeReg.direction).toEqual('exit');

    $state.go('tabs.tab1view1');
    rootScope.$apply();
    var tab1view1Reg = viewService.register(tab1Container, viewLocals);
    expect(tab1view1Reg.action).toEqual('moveBack');
    expect(tab1view1Reg.direction).toEqual('enter');

    $state.go('home');
    rootScope.$apply();
    var homeReg = viewService.register({}, viewLocals);
    expect(homeReg.action).toEqual('moveForward');
    expect(homeReg.direction).toEqual('exit');
  }));

  it('should start in home, go to tabs, exit back to home', inject(function($location, $state) {
    var homeViewScope = {};
    $state.go('home');
    rootScope.$apply();
    var homeReg = viewService.register(homeViewScope, viewLocals);
    expect(homeReg.action).toEqual('initialView');
    expect(homeReg.direction).toEqual('none');

    var tab1Container = {};
    viewService.registerHistory(tab1Container);

    $state.go('tabs.tab1view1');
    rootScope.$apply();

    var tab1view1Reg = viewService.register(tab1Container, viewLocals);
    expect(tab1view1Reg.action).toEqual('newView');
    expect(tab1view1Reg.direction).toEqual('enter');

    $state.go('home');
    rootScope.$apply();
    homeReg = viewService.register(homeViewScope, viewLocals);
    expect(homeReg.action).toEqual('moveBack');
    expect(homeReg.direction).toEqual('exit');
  }));

  it('should start in tabs1, switch to tabs2, exit to home, enter to tabs1', inject(function($location, $state) {
    var homeViewScope = {};
    var tab1Container = {};
    var tab2Container = {};
    viewService.registerHistory(tab1Container);
    viewService.registerHistory(tab2Container);

    $state.go('tabs.tab1view1');
    rootScope.$apply();
    var tab1view1Reg = viewService.register(tab1Container, viewLocals);
    expect(tab1view1Reg.action).toEqual('initialView');
    expect(tab1view1Reg.direction).toEqual('none');

    $state.go('tabs.tab2view1');
    rootScope.$apply();
    var tab2view1Reg = viewService.register(tab2Container, viewLocals);
    expect(tab2view1Reg.action).toEqual('newView');
    expect(tab2view1Reg.direction).toEqual('switch');

    $state.go('home');
    rootScope.$apply();
    homeReg = viewService.register(homeViewScope, viewLocals);
    expect(homeReg.action).toEqual('newView');
    expect(homeReg.direction).toEqual('exit');

    $state.go('tabs.tab1view1');
    rootScope.$apply();
    tab1view1Reg = viewService.register(tab1Container, viewLocals);
    expect(tab1view1Reg.action).toEqual('moveBack');
    expect(tab1view1Reg.direction).toEqual('enter');
  }));

  it('should start in home, go to tabs, switch to another tab, exit back to home', inject(function($location, $state) {
    var homeViewScope = {};
    $state.go('home');
    rootScope.$apply();
    var homeReg = viewService.register(homeViewScope, viewLocals);
    expect(homeReg.action).toEqual('initialView');
    expect(homeReg.direction).toEqual('none');

    var tab1Container = {};
    var tab2Container = {};
    viewService.registerHistory(tab1Container);
    viewService.registerHistory(tab2Container);

    $state.go('tabs.tab1view1');
    rootScope.$apply();
    var tab1view1Reg = viewService.register(tab1Container, viewLocals);
    expect(tab1view1Reg.action).toEqual('newView');
    expect(tab1view1Reg.direction).toEqual('enter');

    $state.go('tabs.tab2view1');
    rootScope.$apply();

    var tab2view1Reg = viewService.register(tab2Container, viewLocals);
    expect(tab2view1Reg.action).toEqual('newView');
    expect(tab2view1Reg.direction).toEqual('switch');

    $state.go('home');
    rootScope.$apply();
    homeReg = viewService.register(homeViewScope, viewLocals);
    expect(homeReg.action).toEqual('moveBack');
    expect(homeReg.direction).toEqual('exit');
  }));

  it('should be an abstract view', inject(function($document) {
    var reg = viewService.register({}, {});
    expect(reg.action).not.toEqual('abstractView');

    reg = viewService.register({}, {
      $$state: {}
    });
    expect(reg.action).not.toEqual('abstractView');

    reg = viewService.register({}, {
      $$state: {
        self: {}
      }
    });
    expect(reg.action).not.toEqual('abstractView');

    reg = viewService.register({}, {
      $$state: {
        self: {
          abstract: true
        }
      }
    });
    expect(reg.action).toEqual('abstractView');
  }));

  it('should init root viewHistory data', inject(function() {
    expect(viewService.viewHistory().backView).toEqual(null);
    expect(viewService.viewHistory().currentView).toEqual(null);
    expect(viewService.viewHistory().forwardView).toEqual(null);
    expect(viewService.viewHistory().histories).toEqual({
        root: { historyId: 'root', parentHistoryId: null, stack: [], cursor: -1 }
    });
  }));

  it('should not error when clearing empty history', function() {
    expect(function() {
      viewService.clearHistory();
    }).not.toThrow();
  });

  it('should create a viewService view', inject(function($location) {
    var newView = viewService.createView();
    expect(newView).toEqual(null);

    newView = viewService.createView({ stateName: 'about', url: '/url'  });
    expect(newView.stateName).toEqual('about');
  }));

  it('should go() to a view', inject(function($location) {
    var newView = viewService.createView({ stateName: 'about' });
    newView.go();
    rootScope.$apply();
    expect($location.url()).toEqual('/about');

    $location.url('/nochange');
    newView = viewService.createView({ url: '/nochange' });
    var result = newView.go();
    expect(result).toEqual(null);

    $location.url('/nochange');
    newView = viewService.createView({ url: '/nochange' });
    result = newView.go();
    expect(result).toEqual(null);

    newView = viewService.viewHistory().backView = viewService.createView({ url: '/url' });
    result = newView.go();
    expect(result).toEqual(-1);

    newView = viewService.viewHistory().forwardView = viewService.createView({ url: '/url' });
    result = newView.go();
    expect(result).toEqual(1);

    newView = viewService.createView({ url: '/url' });
    newView.go();
    expect($location.url()).toEqual('/url');
  }));

  it('should change history on event changeHistory', inject(function($location, $state) {
    $location.url('/original');

    rootScope.$broadcast("viewState.changeHistory");
    expect($location.url()).toEqual('/original');

    rootScope.$broadcast("viewState.changeHistory", { uiSref: 'about' });
    expect($location.url()).toEqual('/about');

    rootScope.$broadcast("viewState.changeHistory", { url: '/url' });
    expect($location.url()).toEqual('/url');

    viewService.viewHistory().histories.h123 = { stack: [], cursor: -1 };
    rootScope.$broadcast("viewState.changeHistory", { historyId: 'h123' });
    expect($location.url()).toEqual('/url');

    var newView = viewService.createView({ stateName: 'about' });
    viewService.viewHistory().histories.h123.stack.push(newView);
    viewService.viewHistory().histories.h123.cursor++;
    rootScope.$broadcast("viewState.changeHistory", { historyId: 'h123' });
    rootScope.$apply();
    expect($state.current.name).toEqual('about');
  }));

  it('should update document title', inject(function($document) {
    $document[0].title = 'Original Title';

    rootScope.$broadcast("viewState.viewEnter");
    expect($document[0].title).toEqual('Original Title');

    rootScope.$broadcast("viewState.viewEnter", {});
    expect($document[0].title).toEqual('Original Title');

    rootScope.$broadcast("viewState.viewEnter", { title: 'New Title' });
    expect($document[0].title).toEqual('New Title');
  }));

});
