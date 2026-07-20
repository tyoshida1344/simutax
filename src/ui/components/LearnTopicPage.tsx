import { useParams, Link, Navigate } from 'react-router-dom';
import { getTopicById } from '../../content/learnTopics';
import { glossaryTerms } from '../../content/glossary';
import { taxParams } from '../../data/taxParams';
import { FlowChart } from './FlowChart';
import { Disclaimer } from './Disclaimer';
import styles from '../styles/LearnTopicPage.module.css';

export function LearnTopicPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const topic = topicId ? getTopicById(topicId) : undefined;

  if (!topic) {
    return <Navigate to="/learn" replace />;
  }

  const flowChart = topic.getFlowChart(taxParams);
  const notes = topic.getNotes(taxParams);
  const related = topic.relatedTerms
    .map((id) => glossaryTerms.find((t) => t.id === id))
    .filter(Boolean);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.backLink}>← シミュレータに戻る</Link>
          <Link to="/learn" className={styles.backLink}>一覧に戻る</Link>
        </nav>
        <h1 className={styles.title}>{topic.title}</h1>
      </header>

      <section className={styles.section}>
        <p className={styles.introduction}>{topic.introduction}</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>計算の流れ</h2>
        <FlowChart data={flowChart} />
      </section>

      {notes.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>ポイント</h2>
          <ul className={styles.notesList}>
            {notes.map((note, i) =>
              typeof note === 'string' ? (
                <li key={i} className={styles.noteItem}>{note}</li>
              ) : (
                <li key={i} className={styles.noteTableWrapper}>
                  <div className={styles.noteTableScroll}>
                    <table className={styles.noteTable}>
                      <caption className={styles.noteTableTitle}>{note.title}</caption>
                      <thead>
                        <tr>
                          {note.headers.map((h, hi) => (
                            <th key={hi}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {note.rows.map((row, ri) => (
                          <tr key={ri}>
                            {row.map((cell, ci) => (
                              <td key={ci}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </li>
              ),
            )}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>関連する用語</h2>
          <div className={styles.termsList}>
            {related.map((term) => (
              <Link key={term!.id} to={`/glossary?term=${term!.id}`} className={styles.termLink}>
                {term!.term}
              </Link>
            ))}
          </div>
        </section>
      )}

      {topic.references && topic.references.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>公式リンク・届出</h2>
          <ul className={styles.referencesList}>
            {topic.references.map((ref, i) => (
              <li key={i} className={styles.referenceItem}>
                <a href={ref.url} target="_blank" rel="noopener noreferrer" className={styles.referenceLink}>
                  {ref.label}
                </a>
                {ref.description && (
                  <span className={styles.referenceDescription}>{ref.description}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link to="/" className={styles.simulatorLink}>
        この数字でシミュレーションする →
      </Link>

      <Disclaimer />
    </div>
  );
}
