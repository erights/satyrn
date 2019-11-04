const showdown  = require('showdown');

showdown.extension('mailitoEmail', () => {
  let content = [];

  return [
    {
      type: 'lang',
      regex:/[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/gi,
      replace: function(s, match) {
        content.push(s);
        var n = content.length - 1;
        return '%EMAIL' + n + '%';
      }
    },
    {
      type: 'output',
      filter: function (text) {
        for (var i=0; i< content.length; ++i) {
          var pat = '%EMAIL' + i + '%';
          text = text.replace(new RegExp(pat, 'gi'), "<a href=\"mailto:" + content[i] + "\" >" + content[i] + "</a>");
        }
        //resetEditor array
        content = [];
        return text;
      }
    }
  ]
})
