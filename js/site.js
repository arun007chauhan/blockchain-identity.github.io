
(function(){

  var lastState;
  var stripDomain = /(.*?:\/\/.+?\/)|([#?].+)/g;
  var stripSlashes = /(^\/)|(\/$)/g;
  localStorage.xtagHistoryIndex = localStorage.xtagHistoryIndex || 0;

  function splitPath(path){
    path = path.replace(stripDomain, '').replace(stripSlashes, '').split('/');
    return path.length ? path : ['/'];
  }

  function getPath(paths, path, obj){
    var steps = splitPath(path);
    var item = steps.reduce(function(o, k){
      return o[k] = o[k] || { _entry: {} }
    }, paths);
    return item._entry = obj || item._entry;
  }

  function callPath(paths, path, fn){
    var steps = splitPath(path);
    var last = steps.pop();
    var obj = steps.reduce(function(o, k){
      if (k) {
        var item = o[k] = o[k] || { _entry: {} };
        fn(item._entry);
        return item;
      }
    }, paths)[last];
    if (obj && obj._entry) fn(obj._entry, true);
  }

  var initPop = PopStateEvent.prototype.initPopStateEvent;
  function firePop(state){
    var event;
    if (initPop) {
      event = document.createEvent('PopStateEvent');
      event.initPopStateEvent('popstate', true, true, state);
    }
    else {
      event = new PopStateEvent('popstate', { state: state, bubbles: true, cancelable: true })
    }
    window.dispatchEvent(event);
  }

  function setTitle(title){
    if (title) document.querySelector('title').innerHTML = title;
  }

  function setIndex(obj){
    if (!obj.index) obj.index = ++localStorage.xtagHistoryIndex;
  }

  xtag.history = {
    paths: {},
    push: function(obj, merge, force){
      if (!force && obj.path == location.pathname) return;
      if (merge) obj = xtag.merge({}, history.state || {}, obj);
      setIndex(obj);
      history.pushState(obj, obj.title || null, obj.path);
      firePop(obj);
      setTitle(obj.title);
    },
    replace: function(obj, pop){
      obj = xtag.merge({}, history.state || {}, obj);
      setIndex(obj);
      history.replaceState(obj, obj.title || null, obj.path);
      if (pop) firePop(obj);
      setTitle(obj.title);
    },
    addPath: function(path, obj){
      getPath(this.paths, path, obj);
      if (path == location.pathname) {
          var docState = document.readyState;
          if (docState != 'loading') this.replace({
            path: path,
            title: obj.title
          }, true);
      }
    },
    addPaths: function(obj){
      for (var z in obj) this.addPath(z, obj[z]);
    },
    loadState: function(){
      var self = this;
      var state = history.state || {};
      var title = state.title;
      state.direction = state && state.index > (lastState && lastState.index) ? 1 : -1;
      callPath(this.paths, location.href, function(entry, call){
        if (!title) state.title = entry.title;
        if (call || entry.chain) entry.action.call(self, state, lastState || state);
      });
      setTitle(state.title);
      lastState = state;
      if (window.ga) {
        ga('set', 'page', location.pathname);
        ga('send', 'pageview');
      }
    }
  }

  document.addEventListener('WebComponentsReady', function(){
    if (history.state) xtag.history.loadState();
    else xtag.history.replace({
      path: location.href,
      title: document.title
    }, true)
  });

  window.addEventListener('popstate', function(e){
    xtag.history.loadState();
  });

})();

function switchPage(view){
  document.getElementById(view).show(true);
  xtag.query(document, 'x-action[data-view]').forEach(function(action){
    if (action.getAttribute('data-view') == view) action.setAttribute('selected', '');
    else action.removeAttribute('selected');
  });
}

(function(){

  var globalMenu = document.getElementById('global_menu');

  xtag.history.addPaths({
    '/overview': {
      action: function(){
        switchPage('overview');
      }
    },
    '/system': {
      action: function(){
        switchPage('system');
      }
    },
    '/code': {
      action: function(){
        switchPage('code');
      }
    },
    '/community':  {
      action: function(){
        switchPage('community');
      }
    }
  });

  xtag.addEvents(document, {
    'viewchange': function(event){
      globalMenu.hide();
      var view = event.target.getAttribute('data-view');
      xtag.history.push({
        path: '/' + view
      }, true);
    }
  });

  var diagram = document.getElementById('diagram');
  var systemView = document.getElementById('system');
  xtag.addEvents(diagram, {
    'tap:delegate([diagram-group])': function(){
      var group = this.getAttribute('diagram-group');
      diagram.setAttribute('diagram-highlight', group);
    }
  });

  window.addEventListener('hashchange', function(){
    switch(location.hash) {
      case 'system-names'

      break;

      case 'system-users'

      break;

      case 'system-containers'

      break;
    }
  }, false);

})();
