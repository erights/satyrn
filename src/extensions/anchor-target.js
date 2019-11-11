const showdown  = require('showdown');
const AnchorRx = RegExp(/<a(.*?)>/)
const FragmentRx = RegExp(/#(.*?)>/);

showdown.extension('anchorTarget', () => {
  return [{
    type: 'output',
    regex: /<a(.*?)>(.*?)<\/a>/gi,
    replace: function (anchorTag) {
      if (anchorTag.indexOf("target") === -1 && anchorTag.indexOf("href=\"#") === -1 && anchorTag.indexOf("href=\"mailto") === -1) {
        anchorTag = anchorTag.replace(AnchorRx, (openingTag) => {
          let newTag = openingTag.slice(0,-1);
          newTag += " target=\"_blank\">";
          return newTag
        })
      }
      // if ( anchorTag.indexOf("href=\"#") !== -1) {
      //   anchorTag = anchorTag.replace(FragmentRx, (href) => {
      //     console.log("# LINK", href);
      //     let newHref = process.cwd() + "/app/app.html" + href
      //     console.log(newHref)
      //     return newHref
      //   })
      // }

      return anchorTag
    }
  }]
});
