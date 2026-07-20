import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/HelpPopover.module.css';

interface Props {
  description: string;
  linkTo: string;
  linkLabel?: string;
}

export function HelpPopover({ description, linkTo, linkLabel = '詳しく見る' }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <span className={styles.wrapper} ref={ref}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(!open)}
        aria-label="ヘルプ"
      >
        ?
      </button>
      {open && (
        <div className={styles.popover}>
          <p className={styles.description}>{description}</p>
          <Link to={linkTo} className={styles.link} onClick={() => setOpen(false)}>
            {linkLabel} →
          </Link>
        </div>
      )}
    </span>
  );
}
