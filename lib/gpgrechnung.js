// User Config File
var config = require(__dirname + '/../config.js');

var utils = require(__dirname + '/../utils.js');

const offset = -1;

var clean = function(rawJsonObject, headerBeginning, res) {
      let pages = rawJsonObject.formImage.Pages;
      let lines = [];
      let start = false

      // Pages
      for (let i in pages) {
            utils.log(i);
            let y_old = 0;
            let line = [];
            let cells = pages[i].Texts;

            // Cells
            for (let r in cells) {
                  let text = decodeURIComponent(cells[r].R[0].T);
                  let y_new = cells[r].y;

                  // New Line
                  if (y_new > y_old) {
                        if (line.length && start) {
                              if (line.length === 1) {
                                    lines[lines.length - 1][lines[lines.length - 1].length] += line[0];
                              }
                              else if (line.length === 2) {
                                    lines[lines.length - 1][lines[lines.length - 1].length] += line[0];
                                    lines[lines.length - 1].push(line[1]);
                              }
                              else {
                                    lines.push(line);
                              }
                        }
                        // If Beginning of Header, then start next line
                        if (line.length && line[0].substr(0, headerBeginning.length) === headerBeginning) {
                              start = true;
                        }
                        utils.log(line);
                        line = [];
                        y_old = y_new;
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
                  if (typeof data[i][r] !== 'number') {
                        data[i][r] = '"' + data[i][r] + '"';
                  }
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
      let a = [y1, y2];
      a.sort(function(a, b) { return a - b });
      for (let i in lines) {
            if (lines[i].y - offset > a[0] && lines[i].y - offset < a[1]) {
                  return [i, lines[i].y];
            }
      }
      return [];
};
