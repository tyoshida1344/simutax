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
        fill="currentColor"
        aria-hidden="true"
      >
        <rect x="10" y="2" width="4" height="14" rx="1" />
        <polygon points="12,23 4,13 20,13" />
      </svg>
    </div>
  );
}
