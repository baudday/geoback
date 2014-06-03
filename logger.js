var winston = require('winston');
var logger = new (winston.Logger) ({
	transports: [
		new (winston.transports.File)({
			filename: __dirname + '/tmp/logs/server.log',
			colorize: true
		}),
	]
});

exports.info = function() {
	logger.info.apply(null, arguments);
};

exports.warn = function() {
	logger.warn.apply(null, arguments);
};

exports.error = function() {
	logger.error.apply(null, arguments);
};
