import showdown from "showdown";
import "../extensions/ace-editor";
import "../extensions/mailito-email";
import "../extensions/anchor-target";
import showdownKatex from 'showdown-katex';

showdown.setFlavor('github');

const latexExtension = showdownKatex({
  displayMode: false,
  throwOnError: false, // allows katex to fail silently
  errorColor: '#ff0000',
  delimiters: [
    { left: "$", right: "$", display: true }, // katex default
  ],
});

const showdown_converter = new showdown.Converter({
  extensions: ['aceEditor', 'mailitoEmail', 'anchorTarget', latexExtension],
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



export default showdown_converter;
