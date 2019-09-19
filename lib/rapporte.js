/** Schema of a pdf text field

 {
   "x": 3.278, > from left to right in ??
   "y": 10.797, > from bottom to top in ??
   "w": 101.824, > ??
   "sw": 0.36196875,
   "clr": 0, > 0 = color-index of filling
   "A": "left", > align = left, right, center
   "R": [
     {
      "T": "xyz", > actual text
      "S": -1, > style index from style dictionary; unused
      "TS": [0, 12.9574, 0, 0 ] > [fontFaceId, fontSize, 1/0 for bold, 1/0 for italic]'
    }
  ]
 }
*/

/**
 * implement
 * 
 * https://www.npmjs.com/package/string-similarity
 * https://www.npmjs.com/package/deep-object-diff
 */




/**
https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications#Asynchronously_handling_the_file_upload_process

*/


let PDFParser = require('pdf2json');
let async = require('async');
var utils = require(__dirname + '/../utils.js');



var pdfConcate = function(files, fields, cb) {
      let fileFunctions = [];
      // Create array for async to parse each PDF individualy
      for (let i in files) {
            fileFunctions.push(function(i) {
                  return function(callback) {
                        let pdfParser = new PDFParser();
                        pdfParser.on('pdfParser_dataError', errData => console.error(errData.parserError));
                        // Callback Function
                        pdfParser.on('pdfParser_dataReady', function(pdfData) {
                              callback(null, parseRapportFromJson(pdfData, fields, files[i].name));
                        });
                        // utils.log(files[i]);
                        pdfParser.loadPDF(files[i].path);
                  };
            }(i));
      }
      async.parallel(fileFunctions,
            function(err, lines) {
                  if (err) {
                        utils.log('There was an error in async!');
                        utils.log(err);
                  }
                  let allLines = [];
                  for (let i in lines) {
                        allLines = allLines.concat(lines[i]);
                  }
                  return cb(null, allLines);
            });
};
exports.pdfConcate = pdfConcate;

/**
 * Compare a list of PDF with PDF-Pairs
 * 
 * @param files : array of File-Object from upload
 * @param fields: form parameters from POST
 * @param rule: The rule by which the PDF-Files differentiate (exp. V_)
 * @param cb: return callback
 */
const compareAllPdfs = function(files, fields, rule, cb) {
      // first run through all non rule files in a object with filename as key
      let fileGroups = {};
      for (let i = 0; i < files.length; i++) {
            if (files[i].name.indexOf(rule) == -1) {
                  fileGroups[files[i].name] = [files[i]];
            }
      }
      // second run add rule files to non rule key-objects
      for (let i = 0; i < files.length; i++) {
            if (files[i].name.indexOf(rule) > -1) { // files where rule applies
                  // go through object and find the one that has a key with the non-rule string
                  for (let s in fileGroups) {
                        if (s === files[i].name.replace(rule, '')) {
                              fileGroups[s].push(files[i]);
                              break;
                        }
                  }
            }
      }
      // utils.log(fileGroups);
      let aFuncts = [];
      for (let i in fileGroups) {
            aFuncts.push(function(i){
                  return function(callback){
                        compare2pdf(fileGroups[i], fields, rule, function(err, diff){
                              callback(err, diff);
                        });
                  };
            }(i));
      }
      async.parallel(aFuncts, function(err, data){
            utils.log(data);
            let output = [];
            for (let i = 0;i<data.length;i++) {
                  if (data[i].diff) {
                        output.push(data[i]);
                  }
            }
            cb(err, output);
      });
};
exports.compareAllPdfs = compareAllPdfs;


/**
 * Compares two PDF files
 * 
 * @param files : array of File-Object from upload
 * @param fields: form parameters from POST
 * @param rule: The rule by which the PDF-Files differentiate (exp. V_)
 * @param cb: return callback
 * 
 * returns false if no differences
 * returns object with differences
 */
let compare2pdf = function(files, fields, rule, cb) {
      if (files.length !== 2) return cb(null, false);
      utils.log('comparing files ' + files[0].name + ' with file ' + files[1].name);
      pdfConcate(files, fields, function(err, data) {
            let setA = [];
            let setB = [];
            if (err === null) {
                  for (let i = 0; i < data.length; i++) {
                        if (data[i][0].indexOf(rule) > -1) {
                              data[i].shift(); // remove first
                              data[i].shift(); // two cols (filename, page)
                              setA.push(data[i]);
                        }
                        else {
                              data[i].shift(); // remove first
                              data[i].shift(); // two cols (filename, page)
                              setB.push(data[i]);
                        }
                  }
                  // Do the DIFF
                  let Diff = require('deep-object-diff').diff;
                  let diff = Diff(setA, setB);
                  utils.log(diff);
                  // No differences
                  if (Object.keys(diff).length === 0) {
                        diff = false;
                  }
                  cb(null, {name: files[0].name, diff: diff});
            }
      });
};
exports.compare2pdf = compare2pdf;

/**
 * Cleans the PDFParser output
 * 
 * @param rawJsonObject : the parsed pdf document as objet
 * @param params : the document parameters (firstPage, headerbeginning)
 * 
 */
var parseRapportFromJson = function(rawJsonObject, params, fileName) {
      // The first page where data is in pdf
      let firstPage = parseInt(params.firstPage, 10) - 1;

      // The pages part of the rawJsonObject
      let pages = rawJsonObject.formImage.Pages;

      // array to hold rows
      let lines = [];

      // indicates that relevant content has started;
      // start is indicated by headerBeginning
      // if headerBeginning is found, then 'start' => true
      // for next line
      let start = false;

      // hold left margin of document; set by headerBeginning.left
      let leftMargin = 0;

      // wether current row is a header row or not
      let isHeaderRow = false;

      // number of columns defined by headerRow
      let colCount = 0;

      // holds x-positions of header row as keys
      // gets copied to every 'row'. in case a cell is empty there
      // is no text field. in order to detect an non-existing empty
      // cell, we need this template.
      let rowTemplate = {};

      // the tolerance of the x-Postion
      // not every cell starts at the exact same x-position of
      // the header row. there is a small deviation which we
      // we must detect so we can assign the right column number
      // to a cell which is defined in 'rowTemplate'
      let tolerance = Number.parseFloat(params.tolerance); // in %

      // go through all Pages
      for (let i in pages) {
            utils.log('Page: ' + i);

            // Skip first n pages
            if (i < firstPage) {
                  utils.log('page skipped due to firstPage');
                  continue;
            }

            // y-Value of the last row
            let y_old = 0;
            // holds cells of a row;
            // key => X-position
            let row = {};

            // .Texts holds all text elements of a pdf page;
            let cells = pages[i].Texts;

            // Go through all texts; in a pdf, text fields don't need to be
            // in order. because we're parsing machine created content
            // there is a certain amount of order though. in any case there
            // a line break is not indicated, so we must detect a new line
            // programmically
            for (let r in cells) {

                  // for better reading
                  let curCell = cells[r];

                  // DecodeURI is necessery for example "%3A" => ":"
                  let text = decodeURIComponent(curCell.R[0].T);
                  // CSV Escaping of '"' with double quotes
                  text = text.replace(/"/g, '""');

                  // y-pos / vertical position of text
                  let y = Number.parseFloat(curCell.y);
                  let x = Number.parseFloat(curCell.x);

                  // New Line
                  // ---------------------------------------------------------------
                  // if "y" (vertical) has changed this could mean new line
                  // but first check if new line starts on very left border, because
                  // if this is not the case, then it's only a line break inside
                  // the current row
                  // the first col can therefore only have one line. all the other
                  // cols can have multiple lines;
                  if (start && y > y_old && x <= leftMargin * (1 + tolerance)) {
                        // utils.log(row);
                        // Object2Array
                        let a = [];
                        for (let s in row) {
                              a.push(row[s]);
                        }

                        // the name which is in col 3 is only printed once
                        // if there is no name, take name from previous line
                        if (a[2] === '' && lines.length > 0 && lines[lines.length - 1].length >= 2) {
                              a[2] = lines[lines.length - 1][4];
                        }
                        let cellsWithContent = 0;
                        for (let s = 0; s < a.length; s++) {
                              if (a[s] !== '') cellsWithContent++;
                        }
                        if (!isHeaderRow && cellsWithContent <= colCount && cellsWithContent >= colCount * 0.8) {
                              a.unshift(parseInt(i, 10) + 1);
                              a.unshift(fileName);
                              // utils.log(a);
                              lines.push(a);
                        }
                        // if (isHeaderRow) {
                        //       lines.push(a);
                        // }
                        if (isHeaderRow) {
                              // utils.log(rowTemplate);
                              isHeaderRow = false;
                        }
                        // reset template to original header-template
                        row = {};
                        for (let s in rowTemplate) {
                              row[s] = '';
                        }
                  }


                  // just new col, not new line
                  if (start) {
                        let keyFound = false;
                        if (!isHeaderRow) {
                              // go through the template defined row-object and find
                              // closest key (x-pos) for this cell; s = x-positions
                              for (let s in row) {
                                    if (x >= s * (1 - tolerance) && x <= s * (1 + tolerance)) {
                                          x = s; // set x position to header x-position
                                          keyFound = true;
                                          break;
                                    }
                              }
                        }
                        if (keyFound && (row[x] === undefined || row[x] === '')) {
                              row[x] = text.trim();
                        }
                        // if there is already content in this cell (multiple line cell) append
                        else if (keyFound) {
                              row[x] += '; ' + text.trim();
                        }
                        else if (isHeaderRow) {
                              row[x] = text.trim();
                              rowTemplate[x] = '';
                        }
                  }

                  // Beginning of header row detected => start new table
                  if (text.substr(0, params.headerbeginning.length) === params.headerbeginning) {

                        // reset row template
                        rowTemplate = {};
                        // reset number of columns
                        colCount = 0;
                        // start to parse table from here on
                        start = true;
                        // set left margin of the table
                        leftMargin = curCell.x;
                        row[curCell.x] = text.trim();
                        // we're reading from header row until there's a new line
                        isHeaderRow = true;
                        // set first field of rowTemplate to x-Position
                        rowTemplate[curCell.x] = '';
                  }

                  // we're counting the total number of columns of the table
                  if (isHeaderRow) colCount++;

                  // assign y-pos to y-old position
                  y_old = y;
            }
      }
      return lines;
};
