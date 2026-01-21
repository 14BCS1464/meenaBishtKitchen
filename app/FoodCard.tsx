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
import { db } from '../scr/lib/firebase';

export default function FoodCard({ food }: any) {
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState<any[]>([]);
    const [showComments, setShowComments] = useState(false);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const q = query(
            collection(db, 'foods', food.id, 'comments'),
            orderBy('createdAt', 'asc')
        );

        const unsub = onSnapshot(q, (snapshot) => {
            setComments(snapshot.docs.map((d) => d.data()));
        });

        return () => unsub();
    }, [food.id]);

    const addComment = async () => {
        if (!comment.trim()) return;
        setSending(true);

        await addDoc(collection(db, 'foods', food.id, 'comments'), {
            text: comment,
            createdAt: serverTimestamp(),
        });

        setComment('');
        setSending(false);
        setShowComments(true);
    };

    const getFeelingColor = (feeling: string) => {
        const colors: any = {
            bad: '#ef4444',
            good: '#f59e0b',
            better: '#10b981',
            best: '#8b5cf6',
        };
        return colors[feeling] || '#667eea';
    };

    const getFeelingEmoji = (feeling: string) => {
        const emojis: any = {
            bad: '😐',
            good: '🙂',
            better: '😄',
            best: '🤩',
        };
        return emojis[feeling] || '😊';
    };

    return (
        <article
            style={styles.card}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 24px 48px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 16px 32px rgba(0, 0, 0, 0.3)';
            }}
        >
            {/* Gradient accent */}
            <div style={{
                ...styles.accentBar,
                background: `linear-gradient(90deg, ${getFeelingColor(food.feeling)}, transparent)`,
            }}></div>

            {/* HEADER */}
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <div style={styles.avatarCircle}>
                        {food.anonymous ? '🎭' : (food.name ? food.name.charAt(0).toUpperCase() : '👤')}
                    </div>
                    <div>
                        <h3 style={styles.userName}>
                            {food.anonymous ? 'Anonymous' : (food.name || 'Anonymous')}
                        </h3>
                        <div style={styles.ratingRow}>
                            {[...Array(5)].map((_, i) => (
                                <span key={i} style={{
                                    ...styles.starIcon,
                                    opacity: i < food.rating ? 1 : 0.3,
                                }}>⭐</span>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{
                    ...styles.feelingBadge,
                    background: `${getFeelingColor(food.feeling)}22`,
                    color: getFeelingColor(food.feeling),
                    borderColor: `${getFeelingColor(food.feeling)}44`,
                }}>
                    {getFeelingEmoji(food.feeling)} {food.feeling}
                </div>
            </header>

            {/* REVIEW */}
            {food.review && (
                <p style={styles.review}>{food.review}</p>
            )}

            {/* FOOTER */}
            {/* <footer style={styles.footer}>
                <div style={styles.timestamp}>
                    🕐 {food.createdAt?.toDate ? new Date(food.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                </div>
                <button
                    style={{
                        ...styles.toggleButton,
                        background: showComments ? 'rgba(102, 126, 234, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        borderColor: showComments ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                    }}
                    onClick={() => setShowComments((v) => !v)}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = showComments ? 'rgba(102, 126, 234, 0.15)' : 'rgba(255, 255, 255, 0.05)';
                    }}
                >
                    💬 {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                </button>
            </footer> */}

            {/* COMMENTS */}
            <div
                style={{
                    ...styles.commentsWrapper,
                    maxHeight: showComments ? 500 : 0,
                    opacity: showComments ? 1 : 0,
                    marginTop: showComments ? 16 : 0,
                }}
            >
                <div style={styles.commentsList}>
                    {comments.length === 0 && (
                        <p style={styles.emptyText}>💭 No comments yet. Be the first!</p>
                    )}

                    {comments.map((c, i) => (
                        <div
                            key={i}
                            style={{
                                ...styles.commentBubble,
                                alignSelf: i % 2 === 0 ? 'flex-start' : 'flex-end',
                                background: i % 2 === 0
                                    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(102, 126, 234, 0.08))'
                                    : 'linear-gradient(135deg, rgba(246, 147, 251, 0.15), rgba(246, 147, 251, 0.08))',
                                borderColor: i % 2 === 0
                                    ? 'rgba(102, 126, 234, 0.2)'
                                    : 'rgba(246, 147, 251, 0.2)',
                            }}
                        >
                            {c.text}
                        </div>
                    ))}
                </div>

                {/* INPUT */}
                <div style={styles.commentInputRow}>
                    <input
                        style={styles.commentInput}
                        placeholder="Write a comment…"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !sending && comment.trim()) {
                                addComment();
                            }
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        }}
                    />

                    <button
                        style={{
                            ...styles.sendButton,
                            transform: sending ? 'scale(0.9)' : 'scale(1)',
                            opacity: !comment.trim() ? 0.5 : 1,
                            cursor: !comment.trim() || sending ? 'not-allowed' : 'pointer',
                        }}
                        disabled={sending || !comment.trim()}
                        onClick={addComment}
                        onMouseEnter={(e) => {
                            if (comment.trim() && !sending) {
                                e.currentTarget.style.transform = 'scale(1.1)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.6)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.4)';
                        }}
                    >
                        {sending ? '⏳' : '🚀'}
                    </button>
                </div>
            </div>
        </article>
    );
}

/* ---------------- STYLES ---------------- */

const styles: any = {
    card: {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 24,
        padding: 24,
        boxShadow: '0 16px 32px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
    },

    accentBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
    },

    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
        gap: 12,
    },

    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },

    avatarCircle: {
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        fontWeight: 700,
        color: '#fff',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    },

    userName: {
        fontSize: 16,
        fontWeight: 700,
        color: '#fff',
        margin: 0,
        marginBottom: 4,
    },

    ratingRow: {
        display: 'flex',
        gap: 2,
    },

    starIcon: {
        fontSize: 12,
        transition: 'opacity 0.2s',
    },

    feelingBadge: {
        fontSize: 13,
        fontWeight: 700,
        textTransform: 'capitalize',
        padding: '6px 14px',
        borderRadius: 16,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        border: '1px solid',
        whiteSpace: 'nowrap',
    },

    review: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: 1.6,
        marginBottom: 16,
    },

    footer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    },

    timestamp: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
    },

    toggleButton: {
        border: '1px solid',
        borderRadius: 20,
        padding: '8px 16px',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 600,
        color: 'rgba(255, 255, 255, 0.9)',
        transition: 'all 0.2s',
    },

    commentsWrapper: {
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    },

    commentsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        marginBottom: 16,
        maxHeight: 300,
        overflowY: 'auto',
        paddingRight: 4,
    },

    commentBubble: {
        padding: '10px 14px',
        borderRadius: 16,
        fontSize: 14,
        maxWidth: '85%',
        color: 'rgba(255, 255, 255, 0.9)',
        border: '1px solid',
        lineHeight: 1.5,
        wordWrap: 'break-word',
    },

    emptyText: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.4)',
        textAlign: 'center',
        padding: '16px 0',
        fontStyle: 'italic',
    },

    commentInputRow: {
        display: 'flex',
        gap: 10,
        alignItems: 'center',
    },

    commentInput: {
        flex: 1,
        padding: '12px 16px',
        borderRadius: 16,
        border: '1px solid rgba(255, 255, 255, 0.15)',
        background: 'rgba(255, 255, 255, 0.05)',
        fontSize: 14,
        color: '#fff',
        outline: 'none',
        transition: 'all 0.3s',
    },

    sendButton: {
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: 'none',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: '#fff',
        fontSize: 16,
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        flexShrink: 0,
        boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
};