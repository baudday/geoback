var AWS = require('aws-sdk');
// Configure AWS
AWS.config.loadFromPath('./AWScredentials.json');

exports.send = function(req, res) {
    var name = req.body.name,
        email = req.body.email,
        regarding = req.body.subject,
        message = req.body.message;

    var ses = new AWS.SES({region: "us-east-1"});

    switch(regarding) {
        case "adminForInst":
            var subject = "Institution Admin Access Request on GeoReliefs";
        break;

        case "bugReport":
            var subject = "A New Bug Has Been Reported on GeoReliefs";
        break;

        case "feedback":
            var subject = "New Feedback on GeoReliefs";
        break;
    }

    message += "\n Sent by: " + name + "\n\n You can reply directly to this message.";

    // Send email to the person it was assigned to
    ses.sendEmail({
        Source: "willem.ellis@gmail.com", // Need to change this ASAP
        Destination: {
            ToAddresses: ["willem.ellis@gmail.com"],
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
            res.send(500);
            return;
        }
    });

    // Everything worked! Send the response of the insert
    res.send({}, 200);
};