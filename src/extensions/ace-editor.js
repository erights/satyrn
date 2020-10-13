const showdown  = require('showdown');

showdown.extension('aceEditor', () => {
  let content = [];

  return [
    {
      type: 'lang',
      regex: /```javascript([^]+?)```/gi,
      replace: function(s, match) {
        content.push(match);
        var n = content.length - 1;
        return '%EDITOR' + n + '%\n';
      }
    },
    {
      type: 'output',
      filter: function (text) {
        // TODO could this be done better. How to access state more easily
        for (var index=0; index< content.length; ++index) {
          var pat = '%EDITOR' + index + '%';
          text = text.replace(new RegExp(pat, 'gi'), window.browserState.contentState.getEditorHtml(content[index], index));
          window.browserState.contentState.editors[index] = null;
        }
        content = [];
        return text;
      }
    }
  ]
});

