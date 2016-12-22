var express = require('express');
var app = express();
var fs = require('fs');
var request = require('request');
var gcmAPIendpoint = 'https://fcm.googleapis.com/fcm/send';
var gcmAPIKey = '<REPLACE_WITH_YOUR_SERVER_KEY>';

app.use(express.static(__dirname + '/public'));

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

// This route increment the counter
app.get('/add/:id', function(req, res){
  // We store the id parameter
  var increment = parseInt(req.params.id) || 0;
  // If it's not a number or it is less than 0 we return an error
  if(Number.isNaN(increment) || increment < 0){
    res.status(500).json({status: 'err'});
    return;
  }
  // Everything looks good we can fetch the count file
  fs.readFile('./count.json', 'utf8', function(err, data){
    if (err) {
      res.status(500).json({status: 'err'});
      return;
    }

    // We convert the file to JSON
    var counter = JSON.parse(data);

    // To save some writing, if the increment is 0 we return the response
    if(increment === 0){
      res.json({status: 'ok', counter});
      return;
    }

    // We increment
    counter.count += increment;
    // If the total counter is divisible by 100 we send a PN
    if(counter.count % 100 == 0){
      // We get all the device ids
      fs.readFile('./clients.json', 'utf8', function(err, data){
        if (err) {
          res.status(500).json({status: 'err'});
          return;
        }

        var clients = JSON.parse(data);
        // We send the request to FCM
        request(
          { method: 'POST',
            headers: {
              'Authorization': 'key='+gcmAPIKey,
              'Content-Type' : 'application/json'
            },
            json:{
              registration_ids: clients
            },
            url: gcmAPIendpoint
          }, function (err, response, body) {
            if(err){
              console.log(err);
            }
          });
      });
    }
    // We write the new counter value in count.json
    fs.writeFile('./count.json', JSON.stringify(counter, null, 4), function(err, data){
      if (err) {
        res.status(500).json({status: 'err'});
        return;
      }
      res.json({status: 'ok', counter});
    });

  });
});

// This route save the device id.
app.get('/client/:id', function(req, res){
  var clientId = req.params.id || undefined;
  if(!clientId){
    res.status(500).json({status: 'err'});
    return;
  }
  fs.readFile('./clients.json', 'utf8', function(err, data){
    if (err) {
      res.status(500).json({status: 'err'});
      return;
    }
    var clients = JSON.parse(data);
    if(clients.indexOf(clientId) == -1){
      clients.push(clientId);
      fs.writeFile('./clients.json', JSON.stringify(clients, null, 4), function(err, data){
        if (err) {
          console.log(err);
        }
      });
    }
    res.json({status: 'ok'});
  });
});
