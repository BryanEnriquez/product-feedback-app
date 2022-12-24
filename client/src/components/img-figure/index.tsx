type Props = {
  src: string;
  alt?: string;
  caption: string;
  circle?: boolean | null | string;
};

const style: React.CSSProperties = { borderRadius: '50%' };

const ImgFigure = ({ src, alt = '', caption, circle = false }: Props) => (
  <figure>
    <img src={src} alt={alt} {...(circle && { style })} />
    <figcaption>{caption}</figcaption>
  </figure>
);

export default ImgFigure;
