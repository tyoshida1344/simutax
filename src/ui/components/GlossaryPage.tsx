import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { glossaryTerms, categoryLabels, type GlossaryCategory } from '../../content/glossary';
import { Disclaimer } from './Disclaimer';
import styles from '../styles/GlossaryPage.module.css';

const categories = Object.keys(categoryLabels) as GlossaryCategory[];

export function GlossaryPage() {
  const [searchParams] = useSearchParams();
  const highlightTerm = searchParams.get('term');

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GlossaryCategory | 'all'>('all');
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlightTerm && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightTerm]);

  const filtered = useMemo(() => {
    return glossaryTerms.filter((term) => {
      if (selectedCategory !== 'all' && term.category !== selectedCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          term.term.toLowerCase().includes(q) ||
          term.reading.includes(q) ||
          term.definition.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, selectedCategory]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link to="/" className={styles.backLink}>← シミュレータに戻る</Link>
          <Link to="/learn" className={styles.backLink}>しくみを学ぶ</Link>
        </nav>
        <h1 className={styles.title}>用語集</h1>
      </header>

      <div className={styles.controls}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="キーワードで検索"
          aria-label="用語を検索"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={styles.categoryTabs}>
          <button
            type="button"
            className={selectedCategory === 'all' ? styles.tabActive : styles.tab}
            onClick={() => setSelectedCategory('all')}
          >
            すべて
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={selectedCategory === cat ? styles.tabActive : styles.tab}
              onClick={() => setSelectedCategory(cat)}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.termsList}>
        {filtered.length === 0 && (
          <p className={styles.empty}>該当する用語がありません</p>
        )}
        {filtered.map((term) => (
          <div
            key={term.id}
            id={term.id}
            ref={highlightTerm === term.id ? highlightRef : undefined}
            className={highlightTerm === term.id ? styles.termHighlighted : styles.term}
          >
            <div className={styles.termHeader}>
              <span className={styles.termName}>{term.term}</span>
              <span className={styles.termCategory}>{categoryLabels[term.category]}</span>
            </div>
            <p className={styles.termDefinition}>{term.definition}</p>
            {term.relatedTopicId && (
              <Link to={`/learn/${term.relatedTopicId}`} className={styles.termLink}>
                {`解説を見る →`}
              </Link>
            )}
          </div>
        ))}
      </div>

      <Disclaimer />
    </div>
  );
}
