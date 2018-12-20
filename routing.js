// User Config File
var config = require(__dirname + '/config.js');

var utils = require(__dirname + '/utils.js');


// System
var path = require('path');
var fs = require('fs');

var formidable = require('formidable');



var basic = function(app, connection) {
    app.get('/', function(req, res) {
        fs.readFile(__dirname + '/public/index.html', 'utf-8', function(err, data) {
            res.send(data);
        });
    });

    // app.get('/asset/:aid', auth.ensureAuthenticated, function(req, res) {
    //     var aid = req.params.aid;
    //     var assets = require(__dirname + '/lib/assets.js');
    //     assets.get(aid, connection, function(e, data) {
    //         res.send(e ? e : data);
    //     });
    // });

};

exports.basic = basic;