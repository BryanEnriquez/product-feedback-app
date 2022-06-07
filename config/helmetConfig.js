const helmet = require('helmet');

const scriptSrc = ["'self'"];

module.exports = helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'script-src': scriptSrc,
      'img-src': ["'self'", 'https://product-feedback-app.s3.amazonaws.com'],
    },
  },
  crossOriginEmbedderPolicy: false,
});
