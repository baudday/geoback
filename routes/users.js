var nano = require('nano')('http://127.0.0.1:5984'),
    institutions_db = nano.use('institutions'),
    public_users = nano.use('public_users'),
    users_db = nano.use('_users'),
    AWS = require('aws-sdk'),
    crypto = require('crypto'),
    fs = require('fs');

// Configure AWS
AWS.config.loadFromPath('./AWScredentials.json');

// Registration method
exports.register = function(req, res) {
    var username = req.body.username,
        password = req.body.password,
        first = req.body.first,
        last = req.body.last,
        institution = req.body.institution,
        email = req.body.email,
        phone = req.body.phone;

    try {
        var buffer = crypto.randomBytes(256);
        var i;
        var verificationCode = '';
        // loop through each byte
        for (i=0; i < buffer.length; i++) {
            var c = buffer[i]; // the character in range 0 to 255
            var c2 = Math.floor(c / 10.24); // transform to range 0-25 and round down
            var c3 = c2 + 97; // ASCII a to z is 97 to 122
            // now convert the transformed character code to its string
            // value and append to the verification code
            verificationCode += String.fromCharCode(c3);
        }
    } catch(ex) {
        res.send("Oops! Looks like we had a bit of a problem. Please try again.", 500);
        return;
    }

    var user = {
                    "_id": "org.couchdb.user:" + username,
                    "name": username,
                    "realname": first + " " + last,
                    "institution": institution,
                    "email": email,
                    "phone": phone,
                    "type": "user",
                    "roles": [],
                    "password": password,
                    "level": "user",
                    "unconfirmed": "true",
                    "verificationCode": verificationCode
                };

    // Get the institution
    institutions_db.get(institution, function(err, body) {
        if(err) {
            console.log("ERROR GETTING INSTITUTION");
            console.log(err);
            res.send(err.reason, err.status_code);
            return;
        }

        var emailDomain = email.split('@'),
            urlDomain = body.url.split('.'),
            l = urlDomain.length;

        // Check if user's email domain matches institution domain or is on the list
        if(emailDomain[1] + "/" != urlDomain[l-2] + "." + urlDomain[l-1] &&
           body.approvedEmails.indexOf(email) === -1) {
            res.send("Not approved to register under " + body.name, 404);
            return;
        }

        nano.request({
            db: '_users',
            method: 'POST',
            body: user
        }, function(err, body) {
            if(err) {
                console.log("ERROR INSERTING USER");
                console.log(err);
                res.send(err.status_code + " " + err.reason, err.status_code);
                return;
            }

            var subject = "Confirm Registration on GeoRelief Systems";
            var message = first + ", \n\nThank you for registering with GeoRelief Systems!\n";
                message += "Please visit the following page to confirm your email on GeoRelief Systems.\n\n";
                message += "http://georeliefs.com/#/Confirm/" + verificationCode + ":" + username;

            ses = new AWS.SES({region: "us-east-1"})
            // Send the email
            ses.sendEmail({
                Source: "willem.ellis@gmail.com", // Need to change this ASAP
                Destination: {
                    ToAddresses: [email],
                },
                Message: {
                    Subject: {
                        Data: subject
                    },
                    Body: {
                        Text: {
                            Data: message,
                            Charset: "UTF-8"
                        }
                    }
                },
            }, function(err, data) {
                if(err) {
                    console.log("ERROR SENDING EMAIL");
                    console.log(err);
                    res.send(500);
                    return;
                }
            });

            res.send(body, 200);
        });
    });
};

// Login method
exports.login = function(req, res) {
    var institutions = nano.use('institutions'),
        finalResponse;

        // User Credentials
    var username = req.body.username,
        password = req.body.password;

    nano.request({
            method: "POST",
            db: "_session",
            form: { name: username, password: password },
            content_type: "application/x-www-form-urlencoded; charset=utf-8"
        },
        function (err, body, headers) {
            if (err) { 
                res.send("Invalid username or password.", err.status_code); 
                return; 
            }

            // Send CouchDB's cookie right on through to the client
            if (headers && headers['set-cookie']) {
                headers['set-cookie'];
                res.cookie(headers['set-cookie']);
            }
            nano.config.cookie = headers['set-cookie'];
            users_db.get("org.couchdb.user:" + username, function (err, body, headers) {
                if(err) {
                    res.send(err.reason, err.status_code);
                    return;
                }

                // Check if the account is confirmed
                if(body.unconfirmed) {
                    // Clear the cookies
                    res.clearCookie('AuthSession', {path: '/'});
                    res.clearCookie('AuthLevel', {path: '/'});
                    res.clearCookie('UserInfo', {path: '/'});
                    res.send("Please confirm your email address before logging in.", 401);
                    return;
                }

                // Remove the sensitive stuff
                delete body.password_sha;
                delete body.salt;

                finalResponse = body;

                // Don't want anyone to be able to access this one.
                res.cookie('AuthLevel', body.level, { maxAge: 315360000000, httpOnly: true });

                // Get the user's institution info from that table
                institutions.get(body.institution, function(err, body, headers) {
                    if(err) {
                        res.send(err.reason, err.status_code);
                        return
                    }
                    finalResponse.institutionName = body.name;
                    finalResponse.institutionUrl = body.url;

                    // Set the user info cookie
                    res.cookie('UserInfo', JSON.stringify(finalResponse), { maxAge: 315360000000 });

                    // Send that ish
                    res.send(finalResponse, 200);
                });
            });
    });
};

// Logout method
exports.logout = function(req, res) {
    // The CouchDB cookie name is AuthSession
    res.clearCookie('AuthSession', {path: '/'});
    res.clearCookie('AuthLevel', {path: '/'});
    res.clearCookie('UserInfo', {path: '/'});
    var body = {
        status: "success"
    };

    res.send(body, 200);
};

exports.getUser = function(req, res) {
    var auth = req.cookies['AuthSession'],
        nano,
        finalResponse;

    var username = req.params.username;

    if (!auth) {
        res.send(401); 
        return; 
    }

    nano = require('nano')({ url : 'http://localhost:5984', cookie: 'AuthSession=' + auth });
    var users_db = nano.use('_users'),
        institutions = nano.use('institutions');

    users_db.get("org.couchdb.user:" + username, function (err, body, headers) {
        if(err) {
            res.send(err.reason, err.status_code);
            return;
        }
        finalResponse = body;
        institutions.get(body.institution, function(err, body, headers) {
            if(err) {
                res.send(err.reason, err.status_code);
                return
            }
            finalResponse.institutionName = body.name;
            finalResponse.institutionUrl = body.url;
            res.send(finalResponse, 200);
        });
    });

};

exports.changePassword = function(req, res) {
    var auth = req.cookies['AuthSession'],
        nano,
        user;

    var username = req.body.username,
        password = req.body.password,
        oldpass = req.body.oldpass;

    if (!auth) {
        res.send(401); 
        return; 
    }

    nano = require('nano')({ url : 'http://localhost:5984', cookie: 'AuthSession=' + auth });
    var users_db = nano.use('_users');

    nano.request({
        method: "POST",
        db: "_session",
        form: { name: username, password: oldpass },
        content_type: "application/x-www-form-urlencoded; charset=utf-8"
    },
    function (err, body, headers) {
        if (err) { 
            res.send(err.reason, err.status_code); 
            return; 
        }

        users_db.get("org.couchdb.user:" + username, function (err, body, headers) {
            if(err) {
                res.send(err.reason, err.status_code);
                return;
            }

            body.password = password;
            users_db.insert(body, function(err, body) {
                if(err) {
                    res.send(err.status_code + " " + err.reason, err.status_code);
                } else {
                    res.send(body, 200);
                }
            });
        });
    });
};

exports.getByInstitution = function(req, res) {
    // Don't have to be logged in for this since we're using
    // it for an open page.
    var nano = require('nano')('http://127.0.0.1:5984'),
        public_users = nano.use('public_users');

    var institution = req.params.institution;

    public_users.view('GetByInstitution', 'GetByInstitution', {keys: [institution]}, 
        function(err, body) {
            if(err) {
                res.send(err.status_code + " " + err.reason, err.status_code);
            }
            var items = new Array();

            // Create the response array
            body.rows.forEach(function(row) {
                // Make sure we NEVER return the admin user's info
                if(row.value.name != "admin")
                    items.push(row.value);
            });

            res.send(items, 200);
        }
    );
};

exports.approveUser = function(req, res) {
    var auth = req.cookies['AuthSession'],
        level = req.cookies['AuthLevel'],
        userInfo = JSON.parse(req.cookies['UserInfo']);

    if(!auth || level !== 'admin' || !userInfo) {
        res.send(401);
        return;
    }

    // Get the email
    var email = req.body.email;

    // No need to approve emails with institution's domain
    var emailDomain = email.split('@'),
        urlDomain = userInfo.institutionUrl.split('.'),
        l = urlDomain.length;

    // Do this before we go through all that work
    if(emailDomain[1] + "/" == urlDomain[l-2] + "." + urlDomain[l-1]) {
        res.send("Emails from the institution's domain do not have to be registered", 409);
        return;
    }

    // Get the institution info
    institutions_db.get(userInfo.institution, function(err, body) {
        if(err) {
            res.send(err.reason, err.status_code);
            return;
        }

        var institution = body;

        // Get the institution users
        public_users.view('GetByInstitution', 'GetByInstitution', {keys: [userInfo.institution]}, 
            function(err, body) {
                if(err) {
                    res.send(err.status_code + " " + err.reason, err.status_code);
                    return;
                }

                if(institution.approvedEmails) {
                    if(institution.approvedEmails.indexOf(email) > -1) {
                        res.send("This email is already on the list", 409);
                        return;
                    }
                }

                // Check if the user has already registered
                var l = body.rows.length;
                for(var i = 0; i < l; i++) {
                    if(body.rows[i].value.email == email) {
                        res.send("Someone has already registered with this email address", 409);
                        return;
                    } else {
                        i++;
                    }
                }

                if(institution.approvedEmails) {
                    institution.approvedEmails.push(email);
                } else {
                    institution.approvedEmails = [email];
                }
                
                // All's well, save it!
                institutions_db.insert(institution, function(err, institution) {
                    if(err) {
                        res.send(err.reason, err.status_code);
                        return;
                    }

                    res.send(institution, 200);
                    return;
                });
            }
        );

    });
};

// Allows the user to confirm their email address
exports.confirm = function(req, res) {
    // (Gonna need to use admin privileges here)
    var adminCreds = require('./couchcreds.json');
    var adminNano = require('nano')('http://127.0.0.1:5984'),
        adminUsers_db = adminNano.use('_users');
    adminNano.config.url = 'http://' + adminCreds.user + ':' + adminCreds.pass + '@127.0.0.1:5984';

    var string = req.params.string.split(':'),
        key = string[0],
        username = string[1];

    // Find the user and check if the key matches. Remove "unconfirmed" 
    // and "verificationCode" fields if it does.
    if(username === adminCreds.user) {
        res.send('Please don\'t try to do that...', 403);
        return;
    }

    adminUsers_db.get("org.couchdb.user:" + username, function(err, body, headers) {
        if(err) {
            res.send(err.reason, err.status_code);
            return;
        }

        // Check if the account has already been confirmed
        if(!body.unconfirmed || !body.verificationCode) {
            res.send('This account has already been confirmed', 409);
            return;
        }

        // Check to see if the keys match
        if(body.verificationCode !== key) {
            res.send('Verification codes do not match.', 409);
            return;
        }

        // Everything checks out. Delete the two fields and save it back
        delete body.verificationCode;
        delete body.unconfirmed;

        adminUsers_db.insert(body, function(err, body) {
            if(err) {
                res.send(err.reason, err.status_code);
                return;
            }

            res.send(body, 200);
        });
    });
}

// Method for testing session stuff
exports.foo = function(req, res) {
    var auth = req.cookies['AuthSession'],
    nano;

    if (!auth) { res.send(401); return; }
    nano = require('nano')({ url : 'http://127.0.0.1:5984', cookie: 'AuthSession=' + auth });
    res.send("Welcome!");
};