var fs = require('fs');
var http= require('http');
var json = JSON.parse(fs.readFileSync('./districts.geojson', 'utf8'));

var current = 0;
var max = json.features.length - 1;
var RateLimiter = require('limiter').RateLimiter;
var limiter = new RateLimiter(1, 2000);

process.on('uncaughtException', function (err) {
  console.log('sorry');
  current++;
});


json.features.forEach(function(district, index) {

    if (district.properties.nestoria) {
      limiter.removeTokens(1, function() {
        loadDataFromNestoria(district.properties.nestoria, function(data) {
          console.log(index);
          json.features[index].properties.average = data;
          checkIfMax(current);
          current++;

        })
      });
    } else {
      checkIfMax(current);
      current++;
    }

});

function checkIfMax(current) {
   if (current == max) {
                    fs.writeFile("districts_with_data.geojson", JSON.stringify(json), function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("The file was saved!");
                        }
                    })
  }
}

function loadDataFromNestoria(location, callback) {

    console.log('Loading data from nestoria');

    var url = 'http://api.nestoria.de/api?action=metadata&encoding=json&country=de&place_name=' + location;
    //var url = 'https://gist.githubusercontent.com/c0dr/c7e2ae2286669e597d25/raw/17f9396a3beca93554d4e4def942575a5d2e169f/gistfile1.txt';

    return http.get(url, function(res) {
        var body = '';

        res.on('data', function(chunk) {
            body += chunk;
        });

        res.on('end', function() {
            var nestoriadata = JSON.parse(body);
            if(nestoriadata.response.metadata) {
              callback(nestoriadata.response.metadata[0].data['2014_m9']['avg_price']);
            } else {
              callback(0.00);
            }
            
        });
    }).on('error', function(e) {
        console.log("Got error: ", e);
    });

};