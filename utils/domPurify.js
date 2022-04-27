const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;

const DOMPurify = createDOMPurify(window);
DOMPurify.setConfig({ USE_PROFILES: { html: true } });

module.exports = DOMPurify;
