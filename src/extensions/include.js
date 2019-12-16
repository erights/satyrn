const showdown  = require('showdown');
const fs = require('fs');

//import state from '../state/windowState';

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
    console.log('loading source', src);
    var inc=fs.readFileSync(src,'UTF-8');
    return inc+'\n';
  }

});

