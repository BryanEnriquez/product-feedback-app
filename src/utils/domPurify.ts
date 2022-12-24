import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const { window } = new JSDOM('');
const purify = DOMPurify(window as any as Window);
purify.setConfig({ USE_PROFILES: { html: true } });

export default purify;
