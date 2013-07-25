var nano = require('nano')('http://127.0.0.1:5984'),
    areas_db = nano.use('areas'),
    users_db = nano.use('_users'),
    session_db = nano.use('_session');

// Add a area method
exports.add = function(req, res) {
    var auth = req.cookies['AuthSession'],
        level = req.cookies['AuthLevel']; // Must be superadmin

    // Get everything
    var name = req.body.areaname,
        coordinates = req.body.coordinates;

    // Generate the date
    var date = new Date();

    if(!auth || level != "superadmin") {
        res.send(401);
        return;
    }

    // Create the area object
    var area = {
        _id: name,
        date: date,
        coordinates: req.body.coordinates
    };

    areas_db.insert(area, function(err, body) {
        if(err) {
            res.send(err.status_code + " " + err.reason, err.status_code);
        } else {
            res.send(body, 200);
        }
    });
};

// Get a single area method
exports.getArea = function(req, res) {
    var auth = req.cookies['AuthSession'];

    // Get the service id
    var area = req.params.area;

    // I think we need to be logged in for this, not sure
    if (!auth) {
        res.send(401);
        return;
    }

    // Get the service
    areas_db.get(area, function(err, body) {
        if(err) {
            res.send(err.status_code + " " + err.reason, err.status_code);
        } else {
            res.send(body, 200);
        }
    });
};

// Get all areas method
exports.getAll = function(req, res) {
    var auth = req.cookies['AuthSession'];

    // Get the area id
    var area = req.params.area;

    // I think we need to be logged in for this, not sure
    if (!auth) {
        res.send(401);
        return;
    }

    // Get the view and return that ish
    areas_db.view('GetAllAreas', 'GetAllAreas', function(err, body) {
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

// Delete a area method
exports.delete = function(req, res) {
    var auth = req.cookies['AuthSession'],
        level = req.cookies['AuthLevel']; // Must be superadmin

    // Get the name
    var name = req.body.name,
        rev = req.body.rev;

    if(!auth || level != "superadmin") {
        res.send(401);
        return;
    }

    areas_db.destroy(name, rev, function(err, body) {
        if(err) {
            res.send(err.status_code + " " + err.reason, err.status_code);
            return;
        }

        res.send(body, 200);
    });
};