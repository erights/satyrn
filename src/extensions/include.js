const showdown  = require('showdown');
const fs = require('fs');
const path = require('path');

import state from '../state/windowState';

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
    var filePath = path.join(state.baseDir, src);

    console.log('front: ', filePath);
    var inc=fs.readFileSync(filePath,'UTF-8');
    return inc+'\n';
  }

});

