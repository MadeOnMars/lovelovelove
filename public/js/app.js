var pnBtn = document.getElementById('pushBtn');
var hamburgerBtn = document.getElementById('hamburger');
var closeBtn = document.getElementById('close');
var mobilePushBtn = document.getElementById('mobilePushBtn');
var loveBtn = document.getElementById('btn');
var countElement = document.getElementById('count');
var hammertime = new Hammer(document.body);

// By default, counter and defer value at 0
var count = localStorage.count || 0;
var defer = localStorage.defer || 0;
var reg;
var sub;
var isSubscribed = false;
var xhr = new XMLHttpRequest();

function pushUI(){
  if (isSubscribed) {
    mobilePushBtn.classList.remove('inactive');
    pnBtn.classList.remove('inactive');
  } else {
    mobilePushBtn.classList.add('inactive');
    pnBtn.classList.add('inactive');
  }
}

// This function calls the different API endpoints. You can pass a callback to
// modify your UIs once you get the result.
function api(action, value, cb){
  var path = '/';
  switch (action) {
    case 'add':
      path += 'add/'+value;
      break;
    default:
      path += 'add/0';
  }
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);
      if(response.status === 'ok'){
        cb(null, response);
      } else {
        cb('Something is broken.', null);
      }
    }
  };
  xhr.open('GET', path);
  xhr.send();
}


// This function will automatically manage the counter increment depending on
// the network status (online, offline)
function updateCounter(){
  if(navigator.onLine){
    api('add', defer, function(err, res){
      if(err){return;}
      count = localStorage.count = countElement.innerText = res.counter.count;
      localStorage.defer = defer = 0;
    });
  } else {
    localStorage.defer = defer;
    countElement.innerText = parseInt(count) + parseInt(defer);
  }
}


function subscribe() {
  reg.pushManager.subscribe({userVisibleOnly: true}).
  then(function(pushSubscription) {
    sub = pushSubscription;
    var clientId = pushSubscription.endpoint.split('/').pop();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var response = JSON.parse(xhr.responseText);
        if(response.status === 'ok'){
          isSubscribed = true;
          pushUI();
        }
      }
    };
    xhr.open('GET', '/client/'+clientId);
    xhr.send();
  });
}

function unsubscribe() {
  sub.unsubscribe().then(function(event) {
    isSubscribed = false;
    pushUI();
  }).catch(function(error) {
  });
}

// We call updateCounter() once the script is loaded to initialize the counter
updateCounter();

mobilePushBtn.addEventListener('click', function() {
  if (isSubscribed) {
    unsubscribe();
  } else {
    subscribe();
  }
}, false);

pnBtn.addEventListener('click', function() {
  if (isSubscribed) {
    unsubscribe();
  } else {
    subscribe();
  }
}, false);

hamburgerBtn.addEventListener('click', function() {
  document.body.classList.add('navigation');
}, false);

closeBtn.addEventListener('click', function() {
  document.body.classList.remove('navigation');
}, false);

loveBtn.addEventListener('click', function() {
  defer++;
  updateCounter();
}, false);

hammertime.on('swipeleft', function() {
	document.body.classList.remove('navigation');
});
hammertime.on('swiperight', function() {
  document.body.classList.add('navigation');
});

// If service worker is supported by the browser
if ('serviceWorker' in navigator) {
  // We register our sw.js script
  navigator.serviceWorker.register('sw.js').then(function() {
    return navigator.serviceWorker.ready;
  }).then(function(serviceWorkerRegistration) {
    reg = serviceWorkerRegistration;
    subscribe();
    console.log('SW registration success.');
  }).catch(function(error) {
    console.log('Error during SW registration', error);
  });
}
