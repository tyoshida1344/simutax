import styles from '../styles/Modal.module.css';

interface Props {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ title, onClose, children }: Props) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popover} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} type="button" aria-label="閉じる">
          ×
        </button>
        <p className={styles.title}>{title}</p>
        {children}
      </div>
    </div>
  );
}
