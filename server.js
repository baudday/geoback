var express = require('express'),
    users = require('./routes/users'),
    institutions = require('./routes/institutions'),
    locations = require('./routes/locations'),
    log = require('./routes/log'),
    services = require('./routes/services'),
    areas = require('./routes/areas'),
    contact = require('./routes/contact');

var app = express();

var allowCrossDomain = function(req, res, next) {
    // Added other domains you want the server to give access to
    // WARNING - Be careful with what origins you give access to
    // var allowedHost = [
    //     'http://backbonetutorials.com',
    //     'http://localhost',
    //     'http://localhost:3000'
    // ];

    // if(allowedHost.indexOf(req.headers.origin) !== -1) {
    //     res.header('Access-Control-Allow-Credentials', true);
    //     res.header('Access-Control-Allow-Origin', req.headers.origin)
    //     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    //     res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    //     next();
    // } else {
    //     res.send({auth: false});
    // }

    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    next();
}

app.configure(function(){
    app.use(express.static(__dirname + '/public/'));
    app.use(express.bodyParser());
    app.use(allowCrossDomain);
    app.use(express.cookieParser('secret-string-is-secret'));
});

// User methods
app.post('/api/users', users.register); // Register
app.post('/api/login', users.login); // Login
app.get('/api/logout', users.logout); // Logout
app.get('/api/users/:id', users.getUser); // Get User
app.post('/api/password', users.changePassword); // Change Password
app.get('/api/users/institution/:institution', users.getByInstitution); // Get users by institution
app.post('/api/users/approve', users.approveUser); // Approve a non-domain email
app.get('/api/users/confirm/:string', users.confirm); // Confirm a user

// Institution methods
app.get('/api/institutions', institutions.getAll); // Get all institutions
app.get('/api/institutions/:id', institutions.getInstitution); // Get single institution by id
app.post('/api/institutions', institutions.addInstitution);

// Locations methods
app.post('/api/locations', locations.add); // Add a location
app.get('/api/locations', locations.getAll); // Get all the locations
app.get('/api/locations/type/:type', locations.getByType) // Get all the locations by type

// Log methods
app.post('/api/log', log.add); // Add log entry
app.get('/api/log/:loc_id', log.get); // Get log entries for location
app.get('/api/log/cluster/:loc_id/:cluster', log.getByCluster) // Get all events for location by cluster

// Services methods
app.post('/api/services', services.add); // Add service entry
app.put('/api/services/:id', services.update); // Update service entry
app.get('/api/services/:loc_id', services.getByLocation); // Get all services in a region by location
app.get('/api/services/cluster/:loc_id/:cluster', services.getByCluster); // Get all services for location by cluster
app.get('/api/services/:service_id', services.getService); // Get single service entry
app.get('/api/services/cluster/:cluster', services.getAllByCluster); // Get all services for a cluster

// Areas methods
app.post('/api/areas', areas.add); // Add an area
app.get('/api/areas/:area', areas.getArea) // Get a single area
app.get('/api/areas', areas.getAll) // Get all areas
app.delete('/api/areas', areas.delete) // Delete an area

// Contact methods
app.post('/api/contact', contact.send);

// Just for testing
app.get('/api/foo', users.foo); // Test!

app.options('/*', function(req, res) {
    res.send('*');
}); // OPTIONS hack

console.log("Listening on port 3000....");
app.listen(3000);