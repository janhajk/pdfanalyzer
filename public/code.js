(function() {
      
      
      
      
      /**
       * 
       * document Loaded listener
       * 
       * this executes on DocumentLoaded
       * 
       * 
       */
      document.addEventListener('DOMContentLoaded', function() {
            var content = document.getElementById('content');
            var form = document.createElement('form');
            form.action = 'upload';
            form.method = 'post';
            form.enctype = 'multipart/form-data';
            var input = document.createElement('input');
            input.type = 'file';
            input.name = 'fileupload';
            var button = document.createElement('input');
            button.type = 'submit';
            form.appendChild(input);
            form.appendChild(button);
            content.appendChild(form);
      });

})();