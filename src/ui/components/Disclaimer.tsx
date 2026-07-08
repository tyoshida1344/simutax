export function Disclaimer() {
  return (
    <footer
      style={{
        fontSize: 12,
        color: 'var(--text-muted)',
        textAlign: 'center',
        padding: '16px 0',
        borderTop: '1px solid var(--border)',
        lineHeight: 1.8,
      }}
    >
      <p>
        本シミュレーションは概算です。
        <br />
        実際の税額は申告内容・自治体により異なります。
      </p>
      <p style={{ marginTop: 8 }}>
        入力データは外部に送信されません。
        <br />
        令和8年（2026年）分の税制に基づく試算です。
      </p>
    </footer>
  );
}
