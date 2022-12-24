import helmet from 'helmet';

const scriptSrc = ["'self'"];

export default helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'script-src': scriptSrc,
      'img-src': [
        "'self'",
        'blob:',
        'data:',
        'https://product-feedback-app.s3.amazonaws.com',
      ],
      'connect-src': [
        "'self'",
        'https://api.product-feedback-app.com',
        // For manual img reload in the front-end using fetch
        'https://product-feedback-app.s3.amazonaws.com',
        // For PUT request using signed url request
        'https://product-feedback-app.s3.us-east-1.amazonaws.com',
      ],
    },
  },
  crossOriginEmbedderPolicy: false,
});
