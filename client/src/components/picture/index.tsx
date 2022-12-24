type Props = {
  imgs: [string, string, string?];
  /**
   * Defaults: 767px, 1249px;
   */
  maxWidth?: [number, number?];
  alt?: string;
  loading?: 'eager' | 'lazy';
};

const defaultMaxWidth: [number, number] = [767, 1249];

const Picture = ({
  imgs,
  maxWidth = defaultMaxWidth,
  alt = '',
  loading = 'lazy',
}: Props) => (
  <picture>
    <source media={`(max-width: ${maxWidth[0]}px)`} srcSet={imgs[0]} />
    <source
      media={`(max-width: ${maxWidth[1] || maxWidth[0]}px)`}
      srcSet={imgs[1]}
    />
    <img src={imgs[2] || imgs[1]} alt={alt} loading={loading} />
  </picture>
);

export default Picture;
