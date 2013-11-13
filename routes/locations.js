var nano = require('nano')('http://127.0.0.1:5984'),
    fs = require('fs'),
    crypto = require('crypto'),
    locations = nano.use('locations');

// Add location method
exports.add = function(req, res) {
    var auth = req.cookies['AuthSession'];
    nano.config.cookie = auth;

    var name = req.body.name,
        amenity = req.body.amenity,
        population = req.body.population,
        lat = req.body.lat,
        lon = req.body.lon;
        notes = req.body.notes,
        area = req.body.area,
        image = req.body.image;

    if (!auth) {
        res.send(401); 
        return; 
    }

    // Build the location object
    var location = {
        "geoJSON": {
            "type": "Feature",
            "properties": {
                "name": name,
                "amenity": amenity,
                "population": population,
                "notes": notes,
                "area": area,
                "serviceCount": 0,
                "eventCount": 0
            },
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat]
            },
            "added": new Date()
        }
    };

    // Image is not a required field
    if(image) {
        // We're gonna store the blob to make offline stuff easier later
        location.geoJSON.properties.image = [image];
    }

    // Save the location
    locations.insert(location, function(err, body) {
        if(err) {
            res.send(err.status_code + " " + err.reason, err.status_code);
            return;
        }

        res.send(body, 200);
    });
};

// Get all locations method
exports.getAll = function(req, res) {
    var auth = req.cookies['AuthSession'];
    nano.config.cookie = auth;

    if(!auth) {
        res.send(401);
        return;
    }

    locations.view('AllLocations', 'AllLocations', function(err, body) {
        if(err) {
            res.send(err.status_code + " " + err.reason, err.status_code);
        } else {

            var items = new Array();

            // Create the response array
            body.rows.forEach(function(row) {
                items.push(row.value)
            });

            res.send(items, 200);
        }
    });
};

// Get filtered locations
exports.getFiltered = function(req, res) {
    var auth = req.cookies['AuthSession'];
    nano.config.cookie = auth;

    if(!auth) {
        res.send(401);
        return;
    }

    if(!req.params.type && !req.params.area) {
        res.send(400); // Bad request
        return;
    }

    var type = req.params.type,
        area = req.params.area;

    var param = type ? type : area,
        view = type ? 'GetByType' : 'GetByArea';

    locations.view(view, view, {keys: [param]}, function(err, body) {
        if(err) {
            res.send(err.status_code + " " + err.reason, err.status_code);
        } else {

            var items = new Array();

            // Create the response array
            body.rows.forEach(function(row) {
                items.push(row.value)
            });

            res.send(items, 200);
        }
    });
}