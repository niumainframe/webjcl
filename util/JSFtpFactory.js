var JSFtp = require('jsftp');

function JSFtpFactory(config) {
        return new JSFtp(config);
}

module.exports = JSFtpFactory;


