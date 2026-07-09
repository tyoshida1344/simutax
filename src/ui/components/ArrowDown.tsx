import styles from '../styles/ArrowDown.module.css';

interface Props {
  size?: 'sm' | 'md';
}

export function ArrowDown({ size = 'sm' }: Props) {
  const px = size === 'md' ? 32 : 24;

  return (
    <div className={styles.wrapper}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <rect x="9" y="2" width="6" height="13" rx="1" />
        <polygon points="12,23 3,12 21,12" />
      </svg>
    </div>
  );
}
