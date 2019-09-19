// User Config File
var config = require(__dirname + '/config.js');

var utils = require(__dirname + '/utils.js');

var auth = require(__dirname + '/auth.js');


// System
var fs = require('fs');

// Middleware for Fileuploads
var formidable = require('formidable');


var basic = function(app, connection) {

    app.get('/',
        function(req, res) {
            res.render('home', { user: req.user });
        });

    app.get('/app', /*auth.ensureAuthenticated,*/ function(req, res) {
        fs.readFile(__dirname + '/public/app.html', 'utf-8', function(err, data) {
            res.send(data);
        });
    });

    app.post('/upload', /*auth.ensureAuthenticated,*/ function(req, res) {
        let gpg = require(__dirname + '/lib/rapporte.js');
        let form = new formidable.IncomingForm();
        let files = [];
        form.on('file', function(field, file) {
            files.push([field, file]);
        });
        form.parse(req, function(err, fields, files1) {
            if (err) {
                console.log(err);
            }
            utils.log(fields.compare);
            files = utils.fileListSimple(files);
            if (fields.compare) {
                gpg.compareAllPdfs(files, fields, 'V_', function(err, data) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        res.send(data);
                        res.end();
                    }
                });
            }
            else {
                if (files.length) {
                    gpg.pdfConcate(files, fields, function(err, allLines) {
                        if (err === null) {
                            utils.csvExport(res, allLines, 'output');
                        }
                    });
                }
                else {
                    utils.log('No files sent!');
                }
            }
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
