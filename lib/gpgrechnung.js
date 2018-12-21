// User Config File
var config = require(__dirname + '/../config.js');

var utils = require(__dirname + '/../utils.js');


var clean = function(rawJsonObject, headerBeginning, res) {
      let pages = rawJsonObject.formImage.Pages;
      let lines = [];
      let start = false
      
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
                  
                  // New Line
                  if (y_new > y) {
                        utils.log(line);
                        let trennlinie = hasLine(y, y_new, pages[i].HLines);
                        utils.log('y old: ' + y + '; y_new: ' + y_new);
                        utils.log('has line:');
                        utils.log(trennlinie)
                        if (line.length && start && trennlinie.length) {
                              lines.push(line);
                        }
                        // If Beginning of Header, then start next line
                        if (line.length && line[0].substr(0, headerBeginning.length) === headerBeginning) {
                              start = true;
                        }
                        // if there was a line between two rows, make new line
                        if (isLine.length) {
                              line = [];      
                        }
                        y = y_new;
                  }
                  //text = text.replace(/;/g, ",")
                  line.push(text);
            }
            start = false;
      }
      let csv = array2csv(lines);
      res.writeHead(200, {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attchment; filename=output.csv'
      });
      res.write('﻿' + csv);
      res.end();
};
exports.clean = clean;


var array2csv = function(data) {
      var file = "";
      for (let i = 0; i < data.length; i++) {
            var line = "";
            for (let r = 0; r < data[i].length; r++) {
                  data[i][r] = '"' + data[i][r] + '"';
            }
      }
      for (let i = 0; i < data.length; i++) {
            line = data[i].join(';');
            line += "\n";
            file += line;
      }
      return file;
};


var hasLine = function(y1, y2, lines) {
      for (let i in lines) {
            if (lines[i].y > y1 && lines[i].y < y2) {
                  return [i, lines[i].y];
            } 
      }
      return [];
};
