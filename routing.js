// User Config File
var config = require(__dirname + '/config.js');

var utils = require(__dirname + '/utils.js');


// System
var path = require('path');
var fs = require('fs');
var PDFParser = require("pdf2json");


var formidable = require('formidable');

var auth = require(__dirname + '/auth.js');


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
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {
            let pdfParser = new PDFParser();
            var gpg = require(__dirname + '/lib/gpgrechnung.js');
            pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
            pdfParser.on("pdfParser_dataReady", function(pdfData) {
                (function() {
                    let data = gpg.clean(JSON.stringify(pdfData));
                    res.send(data);
                }())
            });
            fs.readFile(files.fileupload.path, (err, pdfBuffer) => {
                if (!err) {
                    pdfParser.parseBuffer(pdfBuffer);
                }
            })
            utils.log(files.fileupload);
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