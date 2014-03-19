var nano = require('nano')('http://127.0.0.1:5984'),
    services_db = nano.use('services'),
    users_db = nano.use('_users'),
    session_db = nano.use('_session'),
    locations_db = nano.use('locations'),
    AWS = require('aws-sdk');

var adminCreds = require(__dirname + '/../env/couchcreds.json'),
    adminNano = require('nano')('http://127.0.0.1:5984'),
    adminUsers_db = adminNano.use('_users');

// Configure admin nano
adminNano.config.url = 'http://' + adminCreds.user + ':' + adminCreds.pass + '@127.0.0.1:5984';

// Configure AWS
AWS.config.loadFromPath(__dirname + '/../env/AWScredentials.json');

// Add service method
// TEST:
//      * Service in Plan Pending stage
//      * Service in any other stage
// CHECK:
//      * That the service is being inserted
//      * That the serviceCount of the location is being incremented
exports.add = function(req, res) {
    var auth = req.cookies['AuthSession'];

    // Get all the stuff
    var cluster = req.body.cluster,
        institution_name = req.body.institution_name,
        institution_id = req.body.institution_id,
        area = req.body.area,
        stage = req.body.stage,
        description = req.body.description,
        contact = req.body.contact,
        loc_id = req.body.loc_id,
        user_id = req.body.user_id,
        realname = req.body.realname,
        date = new Date();

    // Make sure the user is logged in and has privileges
    if (!auth) { // User level must be "admin" to add institution
        res.send(401); 
        return; 
    }

    // Get the primary contact's info
    adminUsers_db.get(contact, function(err, body, headers) {
        if(err) {
            res.send(err.reason, err.status_code);
            return;
        }

        var primary_contact = {
            user: body.name,
            phone: body.phone,
            email: body.email,
            realname: body.realname
        };

        // Create the service object
        var service = {
            cluster: cluster,
            institution_id: institution_id,
            institution_name: institution_name,
            loc_id: loc_id,
            area: area,
            stage: stage,
            description: description,
            contact: primary_contact,
            confirmed: "false",
            user_id: user_id,
            realname: realname,
            date: date
        };

        // Add the service
        services_db.insert(service, function(err, body) {
            if(err) {
                res.send(err.status_code + " " + err.reason, err.status_code);
                return;
            }

            /**
              * Since we have the script, this no longer needs to happen.
              * Keeping the logic here, just in case!
              *
              **/

            // Increment the service count
            // locations_db.get(loc_id, function(err, body) {
            //     if(err) {
            //         res.send(err.reason, err.status_code);
            //         return;
            //     }

            //     // Increment the service count
            //     body.geoJSON.properties.serviceCount += 1;

            //     // Save it back
            //     locations_db.insert(body, function(err, body) {
            //         if(err) {
            //             res.send(err.reason, err.status_code);
            //             return;
            //         }
            //     });
            // });

            // Everything worked! Send the final response
            res.send(body, 200);
        });
    });
};

// Update service method
exports.update = function(req, res) {
    var auth = req.cookies['AuthSession'];

    // Make sure the user is logged in
    if (!auth) {
        res.send(401); 
        return; 
    }

    // Make the syntax a little easier
    var request = req.body;
    var serviceId = req.params.id;

    // Get the document
    services_db.get(serviceId, function(err, body) {
        if(err) {
            res.send(err.reason, err.status_code);
            return;
        }

        // Ridiculous if block to get only what was sent
        if(request.stage) {
            body.stage = request.stage;
            if(body.stage == "Planned") {
                body.confirmed = "false";
            }
        }

        if(request.description) {
            body.description = request.description;
        }

        if(request.phone) {
            body.contact.phone = request.phone;
        }

        if(request.email) {
            body.contact.email = request.email;
        }

        if(request.confirmed) {
            // Update the status to confirmed
            body.confirmed = request.confirmed;
        }

        // Update the service entry
        services_db.insert(body, function(err, body) {
            if(err) {
                res.send(err.status_code + " " + err.reason, err.status_code);
                return;
            }
        });
    });
    res.send({}, 200);
};

// Get all services for a location method
exports.getByLocation = function(req, res) {
    var auth = req.cookies['AuthSession'];

    // Get the location id
    var loc_id = req.params.loc_id;

    // I think we need to be logged in for this, not sure
    if (!auth) {
        res.send(401);
        return;
    }

    // Get the view and return that ish
    services_db.view('GetServices', 'GetByLocationOnly', 
                    {startkey: [loc_id,{}], endkey:[loc_id], descending: true}, 
        function(err, body) {
            if(err) {
                res.send(err.status_code + " " + err.reason, err.status_code);
            } else {

                var items = new Array();

                // Create the response array
                body.rows.forEach(function(row) {
                    if(row.value.confirmed == "false" && row.value.stage == "Planned") {
                        row.value.stage = "Plan Pending";
                    }
                    items.push(row.value)
                });

                res.send(items, 200);
            }
    });
};

// Get all services for a location by cluster method
exports.getByCluster = function(req, res) {
    var auth = req.cookies['AuthSession'];

    // Get the location id
    var cluster = req.params.cluster,
        loc_id = req.params.loc_id;

    // I think we need to be logged in for this, not sure
    if (!auth) {
        res.send(401);
        return;
    }

    // Get the view and return that ish
    services_db.view('GetServices', 'GetByClusterAndLocation', {startkey: [loc_id, cluster, {}], endkey:[loc_id, cluster], descending: true}, function(err, body) {
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

// Get single service by id
exports.getService = function(req, res) {
    var auth = req.cookies['AuthSession'];

    // Get the service id
    var service_id = req.params.service_id;

    // I think we need to be logged in for this, not sure
    if (!auth) {
        res.send(401);
        return;
    }

    // Get the service
    services_db.get(service_id, function(err, body) {
        if(err) {
            res.send(err.status_code + " " + err.reason, err.status_code);
        } else {
            res.send(body, 200);
        }
    });
};

exports.getAllByCluster = function(req, res) {
    var auth = req.cookies['AuthSession'];

    // Get the cluster
    var cluster = req.params.cluster;

    // I think we need to be logged in for this, not sure
    if (!auth) {
        res.send(401);
        return;
    }

    // Get the view and return that ish
    services_db.view('GetServices', 'GetByClusterOnly', {startkey: [cluster,{}], endkey:[cluster], descending: true}, function(err, body) {
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