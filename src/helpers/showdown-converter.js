import showdown from "showdown";
import "../extensions/ace-editor";
import "../extensions/mailito-email";
import "../extensions/anchor-target";
import "../extensions/include";

showdown.setFlavor('github');

const showdownConverter = new showdown.Converter({
  extensions: ['include', 'aceEditor', 'mailitoEmail', 'anchorTarget'],
  tables: true,
  simplifiedAutoLink: true,
  smoothLivePreview: true,
  tasklists: true,
  parseImgDimensions: true,
  strikethrough: true,
  ghCodeBlocks: true,
  ghMentions: true,
  splitAdjacentBlockquotes:true
});



export default showdownConverter;
