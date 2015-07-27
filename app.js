var express = require('express');
var app = express();
var pg = require('pg');
var conString = "pg://malibu:Plumtr33!!@localhost/malibu_development";
//var conString = "pg://joseph@localhost/malibu_development";
var client = new pg.Client(conString)
var query_result;

var server = app.listen(5000, function () {

  var host = '10.132.195.26'
  //var host = 'localhost';
  //var host = server.address().address;
  var port = server.address().port;
  console.log('Listening at http://%s:%s', host, port);
});
client.connect();


app.use(function (req, res, next) {
  console.log('Time:', Date.now());
  next();
});

// /places/search?ll=10,-10&a=10 -> needs to return places and mobile services for the place

app.use('/places/search', function (req, res, next) {

        var ll = req.query.ll;
       var ac = req.query.a;

        if (ll) {
          
          //console.log('latlng:' + ll);
          var coordinates = ll.split(',');
          var latitude = coordinates[0];
          var longitude = coordinates[1];
          var serviceDetails;
         




          client.query("select array_to_json(array_agg(row_to_json(t))) as places from (select id, name,(select array_to_json(array_agg(row_to_json(ps))) from (select name, service_id, identifier from place_services inner join service_types on service_types.id = place_services.service_type_id where place_id = places.id) ps) as services from places where ST_CONTAINS(coordinates, ST_GeomFromText('POINT(" + longitude  + " " +  latitude + ")'))) t", null, function (err, results) {

            console.log(JSON.stringify(results));

            if (results.rowCount > 0) {
              
              res.contentType('application/json');
              res.send(JSON.stringify(results.rows[0]));
              res.end();

            } else {

              res.status(404).send('No matches');
              res.end();
            }

          });

        } else {

          res.status(404).end('Must specify coordinates');

        }
});

app.get('/services/:id', function (req, res, next) {

  var service_id = req.params.id;
  var service_type = req.query.st;
  var service_identifier = req.query.key;

  if (!service_identifier) {
    
    res.status(404).send('Required parameters missing');
    res.end()
    next();
  
  } else {

    var service_query = "select * from " + service_identifier + "_services where id=" + service_id;
    //console.log(service_query);

    client.query(service_query, null, function (err, results) {

    if (err) {
    
      res.status(404).send('Error occurred during the request');
    
    } else {

       if (results.rowCount > 0) {

        res.send(JSON.stringify(results.rows));
        res.end();

      } else {

        res.status(404).send('No matches');
        res.end();
      }
    }
    });
  }
});  


app.get('/user/:id', function (req, res, next) {
  res.send('USER');
});  
