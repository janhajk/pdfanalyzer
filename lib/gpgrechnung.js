// User Config File
var config = require(__dirname + '/../config.js');

var utils = require(__dirname + '/../utils.js');

var jsonE = require('jsonexport');


var clean = function(rawJsonObject, headerBeginning, res) {
      let pages = rawJsonObject.formImage.Pages;
      let lines = [];
      let start = false;
      // Pages
      for (let i in pages) {
            utils.log(i);
            let y = 0;
            let line = [];
            let texts = pages[i].Texts;
            // Cells
            for (let r in texts) {
                  let text = decodeURIComponent(texts[r].R[0].T);
                  let y_new = texts[r].y;
                  if (y_new > y) {
                        if (line.length && start) {
                              lines.push(line);
                        }
                        if (line.length && line[0].substr(0, headerBeginning.length) === headerBeginning) {
                              start = true;
                        }
                        line = [];
                        y = y_new;
                  }
                  line.push(text);
            }
            start = false;
      }
      
      jsonE(lines, {rowDelimiter: '\t'}, function(err, csv){
            if (err) utils.log(err);
            res.writeHead(200, {
                  'Content-Type': 'text/csv',
                  'Content-Disposition': 'attchment; filename=output.csv'
            });
            res.write(csv);
            res.end();
      });
};
exports.clean = clean;