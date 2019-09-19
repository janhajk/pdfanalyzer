/*global $*/
(function() {

      // function sendFiles(files) {
      //       const uri = "/upload";
      //       const xhr = new XMLHttpRequest();
      //       const fd = new FormData();

      //       xhr.open("POST", uri, true);
      //       xhr.onreadystatechange = function() {
      //             if (xhr.readyState == 4 && xhr.status == 200) {
      //                   console.log(xhr.responseText); // handle response.
      //             }
      //       };
      //       fd.append('file', files);
      //       // Initiate a multipart/form-data upload
      //       xhr.send(fd);
      // }


      /**
       * 
       * document Loaded listener
       * 
       * this executes on DocumentLoaded
       * 
       * 
       */
      document.addEventListener('DOMContentLoaded', function() {



            var uploadForm = function() {
                  let frmInput = function(params) {
                        let formGroup = function() {
                              let div = document.createElement('div');
                              div.className = 'form-group';
                              return div;
                        };
                        let lbl = function(target, value) {
                              let l = document.createElement('label');
                              l.setAttribute('for', target);
                              l.className = 'form-group';
                              l.innerHTML = value;
                              return l;
                        };
                        let inpt = function(type, name, value) {
                              let input = document.createElement('input');
                              input.setAttribute('type', type);
                              input.className = 'form-control';
                              input.setAttribute('name', name);
                              if (type === 'file') {
                                    input.setAttribute('multiple', 'multiple');
                                    input.setAttribute('name', name + '[]');
                              }
                              if (params.text !== undefined) {
                                    input.value = params.text;
                              }
                              return input;
                        };
                        if (params.type === undefined) {
                              params.type = 'text';
                        }
                        let div = formGroup();
                        let label = lbl(params.name, params.label);
                        let input = inpt(params.type, params.name, params.text);
                        if (params.showLabel !== undefined || !params.showLabel) {
                              div.appendChild(label);
                        }
                        div.appendChild(input);
                        if (params.type === 'file') {
                              $(input).filestyle({
                                    theme: 'blue',
                                    text: ' Dateien ausw&auml;hlen',
                                    dragdrop: false,
                              });
                        }
                        return div;
                  };
                  var content = document.getElementById('frmUpload');
                  var form = document.createElement('form');
                  form.action = 'upload';
                  form.method = 'post';
                  form.enctype = 'multipart/form-data';

                  let formPdfAnalysis = [{
                              name: 'fileupload',
                              type: 'file',
                              label: 'Dateien:',
                              showLabel: false
                        },
                        {
                              name: 'compare',
                              type: 'checkbox',
                              label: 'Vergleichen von Vorabzug <=> Definitive Rechnung:',
                        },
                        {
                              name: 'headerbeginning',
                              text: 'GL/',
                              label: 'Beginn der Tabellen-Kopfzeile:'
                        },
                        {
                              name: 'firstPage',
                              text: '4',
                              label: 'Erste Seite mit zu lesenden Daten:'
                        },
                        {
                              name: 'tolerance',
                              text: '0.04',
                              label: 'Toleranz der X-Position von Zellen gegenüber der Kopfzeile'
                        }
                  ];
                  for (let i in formPdfAnalysis) {
                        form.appendChild(frmInput(formPdfAnalysis[i]));
                  }
                  var button = document.createElement('input');
                  button.className = 'btn btn-primary';
                  button.type = 'submit';
                  form.appendChild(button);
                  content.appendChild(form);
            }();

      });

})();
