const ArrowDown = ({ color = '#4661E6' }: { color?: string }) => {
  return (
    <svg
      width="10"
      height="7"
      viewBox="0 0 10 7"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      tabIndex={-1}
    >
      <path
        d="M1 1l4 4 4-4"
        stroke={color}
        strokeWidth="2"
        fill="none"
        fillRule="evenodd"
      />
    </svg>
  );
};

export default ArrowDown;
