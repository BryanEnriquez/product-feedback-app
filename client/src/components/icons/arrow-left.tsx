const ArrowLeft = ({ color = '#4661E6' }: { color?: string }) => {
  return (
    <svg
      width="7"
      height="10"
      viewBox="0 0 7 10"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      tabIndex={-1}
    >
      <path
        d="M6 9L2 5l4-4"
        stroke={color}
        strokeWidth="2"
        fill="none"
        fillRule="evenodd"
      />
    </svg>
  );
};

export default ArrowLeft;
