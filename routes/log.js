var nano = require('nano')('http://127.0.0.1:5984'),
    logs_db = nano.use('logs'),
    users_db = nano.use('_users'),
    session_db = nano.use('_session');

// Add to log method
exports.add = function(req, res) {
    var auth = req.cookies['AuthSession'];
    nano.config.cookie = auth;

    var message = req.body.message,
        loc_id = req.body.loc_id,
        cluster = req.body.cluster,
        institution = req.body.institution;

    // Verify authorization
    if(!auth) {
        res.send(401);
        return;
    }

    var name, date;

    // Get user info
    userInfo = JSON.parse(req.cookies['UserInfo']);

    // Get real name
    name = userInfo.realname;

    // Create the date
    date = new Date();

    // Set up the object
    var entry = {
        "loc_id": loc_id,
        "name": name,
        "date": date,
        "message": message,
        "cluster": cluster,
        "institution": institution
    };

    logs_db.insert(entry, function(err, body) {
        if(err) {
            res.send(err.status_code + " " + err.reason, err.status_code);
            return;
        }
        res.send(body, 200);
    });
};

// Get all entries for a location
exports.get = function(req, res) {
    var auth = req.cookies['AuthSession'];
    nano.config.cookie = auth;

    // Verify authorization
    if(!auth) {
        res.send(401);
        return;
    }

    var id = req.params.loc_id;

    logs_db.view('GetLogs', 'GetLogs', {startkey: [id,{}], endkey:[id], descending: true}, function(err, body) {
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

// Method for getting events for a location by cluster
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
    logs_db.view('GetLogs', 'GetByClusterAndLocation', {startkey: [loc_id, cluster, {}], endkey:[loc_id, cluster], descending: true}, function(err, body) {
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