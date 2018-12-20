// User Config File
var config = require(__dirname + '/../config.js');

var utils = require(__dirname + '/../utils.js');


var clean = function(rawJsonObject) {
      utils.log(rawJsonObject.formImage);
      let pages = rawJsonObject.formImage.Pages;
      let lines = [];
      // Pages
      for (let i in pages) {
            let y = 0;
            let line = [];
            let texts = pages[i].Texts;
            // Cells
            for (let r in texts) {
                  let text = texts[r].R[0].T;
                  let y_new = texts[r].y;
                  if (y_new > y) {
                        if (line.length) lines.push(line);
                        line = [];
                        y = y_new;
                  }
                  line.push(text);
            }
            
      }
      return lines;
};
exports.clean = clean;