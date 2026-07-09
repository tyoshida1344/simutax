import styles from '../styles/Disclaimer.module.css';

export function Disclaimer() {
  return (
    <footer className={styles.footer}>
      <p>
        本シミュレーションは概算です。
        <br />
        実際の税額は申告内容・自治体により異なります。
      </p>
      <p>
        入力データは外部に送信されません。
        <br />
        令和8年（2026年）分の税制に基づく試算です。
      </p>
    </footer>
  );
}
