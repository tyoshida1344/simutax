import { Link } from 'react-router-dom';
import { learnTopics } from '../../content/learnTopics';
import { Disclaimer } from './Disclaimer';
import styles from '../styles/LearnListPage.module.css';

export function LearnListPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.backLink}>← シミュレータに戻る</Link>
        <h1 className={styles.title}>しくみを学ぶ</h1>
        <p className={styles.subtitle}>各税目の計算方法をステップで解説します</p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>税目別解説</h2>
        <div className={styles.grid}>
          {learnTopics.map((topic) => (
            <Link key={topic.id} to={`/learn/${topic.id}`} className={styles.card}>
              <span className={styles.cardTitle}>{topic.title}</span>
              <span className={styles.cardDescription}>{topic.description}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>その他</h2>
        <div className={styles.grid}>
          <Link to="/glossary" className={styles.card}>
            <span className={styles.cardTitle}>用語集</span>
            <span className={styles.cardDescription}>税金・控除・社会保険の用語を解説</span>
          </Link>
        </div>
      </section>

      <Disclaimer />
    </div>
  );
}
