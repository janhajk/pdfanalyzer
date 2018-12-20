// User Config File
var config = require(__dirname + '/../config.js');

var utils = require(__dirname + '/../utils.js');


var clean = function(rawJsonObject, headerBeginning, res) {
      console.log(rawJsonObject);
      let normalHeight = getNormalLineHeight(rawJsonObject);
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
                  text = text.replace(/;/g, ",")
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

var getNormalLineHeight = function(data) {
      let pages = data.formImage.Pages;
      let heights = {};
      for (let i in pages) {
            let y = 0;
            for (let r in pages[i].Texts) {
                  let y_new = pages[i].Texts[r].y;
                  // new row
                  if (y_new > y) {
                        let rowHeight = y_new - y; // row height
                        if (typeof heights[rowHeight] === 'undefined') {
                              heights[rowHeight] = 0
                        }
                        heights[rowHeight] += 1;
                  }
            }
      }
      utils.log('Heights:');
      utils.log(heights);
      let regularLineHeight = Object.keys(heights).reduce((a, b) => heights[a] > heights[b] ? a : b);
      utils.log('Most Common line Height:');
      utils.log(regularLineHeight);
      return regularLineHeight;
};
