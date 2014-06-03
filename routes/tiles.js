var nano = require('nano')('http://127.0.0.1:5984'),
    tiles_db = nano.use('tiles');

exports.getByArea = function(req, res) {
  var area = req.params['area'],
      zoom = parseInt(req.params['zoom']);

  tiles_db.view('GetTiles', 'GetByArea', {startkey: [area, zoom], endkey: [area, zoom]}, function(err, body) {
      if(err) res.send(err.status_code + " " + err.reason, err.status_code);
      else {
          var items = new Array();

          // Create the response array
          body.rows.forEach(function(row) {
              items.push(row.value)
          });

          res.send(items, 200);
      }
  });
};
