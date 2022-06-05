function ImgFigure({ src, alt, caption, circle = false }) {
  return (
    <figure>
      <img src={src} alt={alt} {...(circle && { className: 'img-circle' })} />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export default ImgFigure;
