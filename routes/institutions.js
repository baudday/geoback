var nano = require('nano')('http://127.0.0.1:5984');

// Get all institutions method
exports.getAll = function(req, res) {
    var institutions = nano.use('institutions');

    institutions.view('AllInstitutions', 'AllInstitutions', function(err, body) {
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

// Get single institution by id method
exports.getInstitution = function(req, res) {

    var institutions = nano.use('institutions');

    institutions.get(req.params.id, function(err, body) {
        if(err) {
            res.send(err.status_code + " " + err.reason, err.status_code);
        } else {
            res.send(body, 200);
        }
    });
};

exports.addInstitution = function(req, res) {
    var auth = req.cookies['AuthSession'],
        level = req.cookies['AuthLevel']; // Must send level of user

    var name = req.body.name,
        url = req.body.url,
        description = req.body.description;

        var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });

    if (!auth || level != "superadmin") { // User level must be "superadmin" to add institution
        res.send(401); 
        return; 
    }

    institutions = nano.use('institutions');

    var institution = {
                    "name": name,
                    "url": url,
                    "description": description,
                    "key": guid
                };

    institutions.insert(institution, function(err, body) {
        if(err) {
            res.send(err.status_code + " " + err.reason, err.status_code);
        } else {
            res.send(body, 200);
        }
    });
};