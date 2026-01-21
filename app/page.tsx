'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import FoodCard from './FoodCard';

type Feeling = 'bad' | 'good' | 'better' | 'best' | null;

export default function Home() {
  const [foods, setFoods] = useState<any[]>([]);
  const [db, setDb] = useState<any>(null);

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [feeling, setFeeling] = useState<Feeling>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  /* ---------------- FIREBASE INIT (SAFE) ---------------- */
  useEffect(() => {
    let unsubscribe: any;

    (async () => {
      try {
        const { auth, db } = await import('../scr/lib/firebase');
        const { signInAnonymously } = await import('firebase/auth');
        const {
          collection,
          onSnapshot,
          query,
          orderBy,
        } = await import('firebase/firestore');

        await signInAnonymously(auth);
        setDb(db);

        const q = query(
          collection(db, 'foods'),
          orderBy('createdAt', 'desc')
        );

        unsubscribe = onSnapshot(q, (snapshot) => {
          setFoods(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          );
        });
      } catch (err) {
        console.error('Firebase init error:', err);
      }
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  /* ---------------- SUBMIT REVIEW ---------------- */
  const submitReview = async () => {
    if (!feeling || !db) return;

    setLoading(true);
    try {
      const { addDoc, collection, serverTimestamp } =
        await import('firebase/firestore');

      await addDoc(collection(db, 'foods'), {
        name: anonymous ? null : name || null,
        anonymous,
        feeling,
        rating,
        review: review || null,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Submit error:', err);
    }

    setShowModal(false);
    setName('');
    setAnonymous(false);
    setFeeling(null);
    setRating(5);
    setReview('');
    setLoading(false);
  };

  /* ---------------- UI ---------------- */
  return (
    <main style={styles.container}>
      <style>{keyframes}</style>

      {/* HEADER */}
      <header style={styles.header}>
        <h1 style={styles.title}>🍔 Meena Bisth Kitchen</h1>
        <p style={styles.subtitle}>Real food reviews by real people</p>
      </header>

      {/* LIST */}
      <section style={styles.section}>
        {foods.length === 0 && (
          <p style={styles.empty}>No reviews yet 🍽️</p>
        )}

        {foods.map((item) => (
          <FoodCard key={item.id} food={item} />
        ))}
      </section>

      {/* FAB */}
      <button style={styles.fab} onClick={() => setShowModal(true)}>
        ✍️ Add Review
      </button>

      {/* MODAL */}
      {showModal && (
        <div style={styles.overlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Share your experience</h2>

            {!anonymous && (
              <input
                style={styles.input}
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}

            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={anonymous}
                onChange={() => setAnonymous(!anonymous)}
              />
              Anonymous
            </label>

            {/* FEELINGS */}
            <div style={styles.feelings}>
              {['bad', 'good', 'better', 'best'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFeeling(f as Feeling)}
                  style={{
                    ...styles.feelBtn,
                    opacity: feeling === f ? 1 : 0.5,
                  }}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>

            {/* RATING */}
            <div style={styles.stars}>
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  onClick={() => setRating(r)}
                  style={{
                    ...styles.star,
                    opacity: rating >= r ? 1 : 0.3,
                  }}
                >
                  ⭐
                </button>
              ))}
            </div>

            <textarea
              style={styles.textarea}
              placeholder="Optional description"
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />

            <button
              style={styles.submit}
              disabled={!feeling || loading}
              onClick={submitReview}
            >
              {loading ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

/* ---------------- ANIMATIONS ---------------- */
const keyframes = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

/* ---------------- STYLES ---------------- */
const styles: any = {
  container: {
    minHeight: '100vh',
    padding: 24,
    background: '#0f172a',
    color: '#fff',
  },
  header: {
    textAlign: 'center',
    marginBottom: 32,
    animation: 'fadeIn 0.6s ease',
  },
  title: { fontSize: 36, fontWeight: 800 },
  subtitle: { opacity: 0.7 },
  section: { maxWidth: 600, margin: '0 auto' },
  empty: { textAlign: 'center', opacity: 0.6 },

  fab: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    padding: '14px 24px',
    borderRadius: 999,
    border: 'none',
    background: '#6366f1',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    background: '#111827',
    padding: 24,
    borderRadius: 16,
    width: '100%',
    maxWidth: 420,
    animation: 'fadeIn 0.3s ease',
  },
  modalTitle: { marginBottom: 16 },

  input: {
    width: '100%',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  textarea: {
    width: '100%',
    minHeight: 80,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  checkbox: {
    display: 'flex',
    gap: 8,
    marginBottom: 12,
  },
  feelings: {
    display: 'flex',
    gap: 8,
    marginBottom: 12,
  },
  feelBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: '1px solid #555',
    background: 'transparent',
    color: '#fff',
  },
  stars: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 12,
  },
  star: {
    fontSize: 24,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  submit: {
    width: '100%',
    padding: 14,
    borderRadius: 10,
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    fontWeight: 700,
  },
};
