'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { auth, db } from '../scr/lib/firebase';
import FoodCard from './FoodCard';

export default function Home() {
  const [foods, setFoods] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [feeling, setFeeling] = useState<'bad' | 'good' | 'better' | 'best' | null>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    signInAnonymously(auth);
    const q = query(collection(db, 'foods'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setFoods(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const submitReview = async () => {
    if (!feeling) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'foods'), {
        name: anonymous ? null : name || null,
        anonymous,
        feeling,
        rating,
        review: review || null,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding document: ', error);
    }
    setShowModal(false);
    setName('');
    setAnonymous(false);
    setFeeling(null);
    setRating(5);
    setReview('');
    setLoading(false);
  };

  return (
    <main style={styles.container}>
      <style>{keyframes}</style>

      {/* Animated background elements */}
      <div style={styles.bgCircle1}></div>
      <div style={styles.bgCircle2}></div>
      <div style={styles.bgCircle3}></div>

      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerGlow}></div>
        <h1 style={styles.title}> Meena Bisht Kitchen</h1>
        <p style={styles.subtitle}>Authentic reviews from food lovers worldwide</p>
        <div style={styles.headerStats}>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>{foods.length}</div>
            <div style={styles.statLabel}>Reviews</div>
          </div>
          <div style={styles.statDivider}></div>
          <div style={styles.statItem}>
            <div style={styles.statNumber}>
              {foods.length > 0 ? (foods.reduce((acc, f) => acc + f.rating, 0) / foods.length).toFixed(1) : '5.0'}
            </div>
            <div style={styles.statLabel}>Avg Rating</div>
          </div>
        </div>
      </header>

      {/* LIST */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>✨ Recent Reviews</h2>
          <div style={styles.sectionAccent}></div>
        </div>

        {foods.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🍽️</div>
            <p style={styles.emptyTitle}>No reviews yet</p>
            <p style={styles.emptySubtitle}>Be the first to share your culinary experience</p>
          </div>
        )}

        <div style={styles.reviewGrid}>
          {foods.map((item, idx) => (
            <div key={item.id} style={{ ...styles.reviewCard, animationDelay: `${idx * 0.1}s` }}>
              <FoodCard food={item} />
            </div>
          ))}
        </div>
      </section>

      {/* FLOATING BUTTON */}
      <button
        style={styles.fab}
        onClick={() => setShowModal(true)}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
          e.currentTarget.style.boxShadow = '0 20px 60px rgba(102, 126, 234, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
          e.currentTarget.style.boxShadow = '0 16px 48px rgba(102, 126, 234, 0.5)';
        }}
      >
        <span style={styles.fabIcon}>✍️</span>
        <span>Add Review</span>
      </button>

      {/* MODAL */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>✨ Share Your Experience</h2>
              <button style={styles.closeButton} onClick={() => setShowModal(false)}>×</button>
            </div>

            {!anonymous && (
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Your Name</label>
                <input
                  style={styles.input}
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
                />
              </div>
            )}

            <label style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={anonymous}
                onChange={() => setAnonymous(!anonymous)}
                style={styles.checkbox}
              />
              <span>🎭 Post anonymously</span>
            </label>

            {/* FEELING */}
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>How was your experience?</label>
              <div style={styles.feelingRow}>
                {[
                  { key: 'bad', label: 'Bad', emoji: '😐', color: '#ef4444' },
                  { key: 'good', label: 'Good', emoji: '🙂', color: '#f59e0b' },
                  { key: 'better', label: 'Better', emoji: '😄', color: '#10b981' },
                  { key: 'best', label: 'Best', emoji: '🤩', color: '#8b5cf6' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFeeling(f.key as any)}
                    style={{
                      ...styles.feelingButton,
                      background: feeling === f.key
                        ? `linear-gradient(135deg, ${f.color}, ${f.color}dd)`
                        : 'rgba(255, 255, 255, 0.05)',
                      borderColor: feeling === f.key ? f.color : 'rgba(255,255,255,0.1)',
                      color: feeling === f.key ? '#fff' : 'rgba(255,255,255,0.7)',
                      transform: feeling === f.key ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: feeling === f.key ? `0 8px 24px ${f.color}66` : 'none',
                    }}
                  >
                    <span style={styles.feelingEmoji}>{f.emoji}</span>
                    <span>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* RATING */}
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Rating</label>
              <div style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRating(r)}
                    style={{
                      ...styles.star,
                      filter: rating >= r ? 'grayscale(0%) drop-shadow(0 4px 8px rgba(251, 191, 36, 0.6))' : 'grayscale(100%)',
                      opacity: rating >= r ? 1 : 0.3,
                      transform: rating >= r ? 'scale(1.2)' : 'scale(1)',
                    }}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            {/* DESCRIPTION */}
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Tell us more (optional)</label>
              <textarea
                style={styles.textarea}
                placeholder="Describe the flavors, presentation, service..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
              />
            </div>

            {/* ACTIONS */}
            <div style={styles.modalActions}>
              <button
                style={styles.cancelButton}
                onClick={() => setShowModal(false)}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                Cancel
              </button>
              <button
                style={{
                  ...styles.primaryButton,
                  opacity: !feeling ? 0.5 : 1,
                  cursor: !feeling || loading ? 'not-allowed' : 'pointer',
                }}
                disabled={!feeling || loading}
                onClick={submitReview}
                onMouseEnter={(e) => {
                  if (feeling && !loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
                }}
              >
                {loading ? '💫 Submitting...' : '🚀 Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* ---------------- KEYFRAMES ---------------- */
const keyframes = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 0.4;
      transform: scale(1);
    }
    50% {
      opacity: 0.6;
      transform: scale(1.1);
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(40px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

/* ---------------- STYLES ---------------- */
const styles: any = {
  container: {
    width: '100%',
    margin: '0 auto',
    padding: 24,
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative',
    overflow: 'hidden',
  },

  bgCircle1: {
    position: 'fixed',
    top: '-200px',
    right: '-200px',
    width: '500px',
    height: '500px',
    background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15), transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
    animation: 'pulse 8s ease-in-out infinite',
  },

  bgCircle2: {
    position: 'fixed',
    bottom: '-150px',
    left: '-150px',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(246, 147, 251, 0.1), transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
    animation: 'pulse 10s ease-in-out infinite',
  },

  bgCircle3: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(118, 75, 162, 0.08), transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
    animation: 'float 15s ease-in-out infinite',
  },

  header: {
    textAlign: 'center',
    marginBottom: 48,
    padding: '48px 32px',
    borderRadius: 32,
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'hidden',
    animation: 'fadeInUp 0.8s ease',
  },

  headerGlow: {
    position: 'absolute',
    top: '-100px',
    right: '-100px',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(102, 126, 234, 0.3), transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
    animation: 'pulse 4s ease-in-out infinite',
  },

  title: {
    fontSize: 48,
    fontWeight: 900,
    marginBottom: 12,
    letterSpacing: '-1.5px',
    background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    position: 'relative',
    zIndex: 1,
    textShadow: '0 0 40px rgba(102, 126, 234, 0.3)',
  },

  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 300,
    position: 'relative',
    zIndex: 1,
    marginBottom: 24,
  },

  headerStats: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    marginTop: 24,
    position: 'relative',
    zIndex: 1,
  },

  statItem: {
    textAlign: 'center',
  },

  statNumber: {
    fontSize: 32,
    fontWeight: 800,
    background: 'linear-gradient(135deg, #667eea, #f093fb)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginTop: 4,
  },

  statDivider: {
    width: '1px',
    height: '40px',
    background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.2), transparent)',
  },

  section: {
    marginBottom: 100,
    position: 'relative',
    zIndex: 1,
  },

  sectionHeader: {
    marginBottom: 32,
    position: 'relative',
  },

  sectionTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: '#fff',
    marginBottom: 8,
    letterSpacing: '-0.5px',
  },

  sectionAccent: {
    width: '60px',
    height: '4px',
    background: 'linear-gradient(90deg, #667eea, #764ba2)',
    borderRadius: '2px',
  },

  reviewGrid: {
    display: 'grid',
    gap: 20,
  },

  reviewCard: {
    animation: 'fadeInUp 0.6s ease backwards',
  },

  emptyState: {
    textAlign: 'center',
    padding: 64,
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: 24,
    border: '1px solid rgba(255, 255, 255, 0.08)',
    animation: 'fadeInUp 0.8s ease',
  },

  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    animation: 'float 3s ease-in-out infinite',
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 8,
  },

  emptySubtitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
  },

  fab: {
    position: 'fixed',
    bottom: 32,
    right: 32,
    padding: '18px 32px',
    borderRadius: 999,
    border: 'none',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 16px 48px rgba(102, 126, 234, 0.5)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 999,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },

  fabIcon: {
    fontSize: 20,
  },

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.3s ease',
    padding: 20,
  },

  modal: {
    background: 'rgba(26, 26, 46, 0.95)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    padding: 32,
    borderRadius: 28,
    width: '100%',
    maxWidth: 520,
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 32px 64px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
    animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },

  modalTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '-0.5px',
  },

  closeButton: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 28,
    width: 40,
    height: 40,
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },

  inputGroup: {
    marginBottom: 24,
  },

  inputLabel: {
    display: 'block',
    fontSize: 14,
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 10,
    letterSpacing: '0.3px',
  },

  input: {
    width: '100%',
    padding: 16,
    borderRadius: 14,
    border: '2px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.05)',
    fontSize: 15,
    transition: 'all 0.3s',
    outline: 'none',
    color: '#fff',
    boxSizing: 'border-box',
  },

  textarea: {
    width: '100%',
    padding: 16,
    borderRadius: 14,
    border: '2px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.05)',
    minHeight: 120,
    resize: 'vertical',
    fontSize: 15,
    fontFamily: 'inherit',
    transition: 'all 0.3s',
    outline: 'none',
    boxSizing: 'border-box',
    color: '#fff',
  },

  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    padding: 12,
    borderRadius: 12,
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },

  checkbox: {
    width: 20,
    height: 20,
    cursor: 'pointer',
  },

  feelingRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },

  feelingButton: {
    padding: '16px',
    borderRadius: 14,
    border: '2px solid',
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 600,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  feelingEmoji: {
    fontSize: 20,
  },

  ratingRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: 8,
  },

  star: {
    fontSize: 36,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    padding: 4,
  },

  modalActions: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 32,
  },

  cancelButton: {
    padding: '14px 28px',
    borderRadius: 14,
    border: '2px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 15,
    transition: 'all 0.2s',
    flex: 1,
  },

  primaryButton: {
    padding: '14px 28px',
    borderRadius: 14,
    border: 'none',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 15,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    flex: 1,
    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
  },
};