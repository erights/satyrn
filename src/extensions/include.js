const showdown  = require('showdown');
const fs = require('fs');
const path = require('path');

showdown.extension('include', () => {

  return [
    {
      type: 'lang',
      regex: /```include([^]+?)```/gi,
      replace: function(s, match) { 
        let sources = match.split('\n');
        var replacement = '';
        
        sources.forEach(element => {
            replacement += loadSource(element);
        });

        return replacement;
      }
    }
  ]

  //////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////

  function loadSource(src) {
    if(!src) return '';

    console.log('loading source', src);
    var filePath = path.join(window.satyrnBrowser.baseDir, src);

    console.log('front: ', filePath);

    var inc = null;
    try {
      inc = fs.readFileSync(filePath, 'UTF-8');
    } catch (err) {
      inc = '<div class="includeError">' +
        err.message +
        '</div>';
    }
    return inc+'\n';
  }

});

