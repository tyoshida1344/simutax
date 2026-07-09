import styles from '../styles/ArrowDown.module.css';

interface Props {
  size?: 'sm' | 'md';
}

export function ArrowDown({ size = 'sm' }: Props) {
  const px = size === 'md' ? 28 : 20;

  return (
    <div className={styles.wrapper}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 4v14M12 18l-5-5M12 18l5-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
