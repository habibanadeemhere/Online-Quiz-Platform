import React, { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../supabase";
import "./Dashboard.css";

const Orb = ({ style }) => <div className="db-orb" style={style} />;
const Particle = ({ x, size, color, duration, delay }) => (
  <div
    className="db-particle"
    style={{
      left: `${x}%`,
      bottom: "-10px",
      width: size,
      height: size,
      background: color,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`,
    }}
  />
);

const CertModal = ({ cert, onClose }) => (
  <div className="db-modal-overlay" onClick={onClose}>
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: "linear-gradient(135deg,#0d0800,#1a1000)",
        border: "2px solid rgba(245,158,11,.5)",
        borderRadius: 28,
        padding: "2.8rem 2.4rem",
        width: "100%",
        maxWidth: 460,
        position: "relative",
        textAlign: "center",
        animation: "lq-cardIn .4s ease",
        boxShadow: "0 0 80px rgba(245,158,11,.2), 0 40px 80px rgba(0,0,0,.7)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 12,
          border: "1px solid rgba(245,158,11,.15)",
          borderRadius: 18,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -1,
          left: -1,
          right: -1,
          height: 3,
          background:
            "linear-gradient(90deg,transparent,#f59e0b,#fbbf24,#f97316,transparent)",
          borderRadius: "28px 28px 0 0",
          animation: "lq-shimmer 3s infinite",
          backgroundSize: "200% 100%",
        }}
      />
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          width: 30,
          height: 30,
          border: "none",
          borderRadius: "50%",
          background: "rgba(255,255,255,.07)",
          color: "rgba(251,191,36,.7)",
          cursor: "pointer",
          fontSize: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ✕
      </button>
      <div
        style={{
          fontSize: "1rem",
          letterSpacing: 6,
          marginBottom: "1rem",
          opacity: 0.6,
          color: "#fbbf24",
        }}
      >
        ★ ★ ★ ★ ★
      </div>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "linear-gradient(135deg,#f59e0b,#f97316)",
          margin: "0 auto 1.2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2rem",
          boxShadow: "0 0 30px rgba(245,158,11,.5)",
        }}
      >
        🏆
      </div>
      <div
        style={{
          fontSize: ".62rem",
          fontFamily: "Syne,sans-serif",
          fontWeight: 700,
          color: "rgba(251,191,36,.55)",
          textTransform: "uppercase",
          letterSpacing: "2px",
          marginBottom: ".4rem",
        }}
      >
        Certificate of Achievement
      </div>
      <div
        style={{
          fontSize: ".85rem",
          color: "rgba(251,191,36,.6)",
          fontFamily: "DM Sans,sans-serif",
          marginBottom: ".5rem",
        }}
      >
        This certifies that
      </div>
      <div
        style={{
          fontFamily: "Syne,sans-serif",
          fontSize: "1.8rem",
          fontWeight: 800,
          color: "#fbbf24",
          marginBottom: ".3rem",
          textShadow: "0 0 20px rgba(251,191,36,.4)",
        }}
      >
        {cert.student_name}
      </div>
      <div
        style={{
          fontSize: ".85rem",
          color: "rgba(251,191,36,.6)",
          marginBottom: ".4rem",
          fontFamily: "DM Sans,sans-serif",
        }}
      >
        has successfully completed
      </div>
      <div
        style={{
          fontFamily: "Syne,sans-serif",
          fontSize: "1.2rem",
          fontWeight: 800,
          color: "#fde68a",
          marginBottom: "1.2rem",
        }}
      >
        {cert.quiz_title}
      </div>
      {cert.score != null && (
        <div
          style={{
            display: "inline-block",
            background: "rgba(245,158,11,.15)",
            border: "1px solid rgba(245,158,11,.35)",
            borderRadius: 50,
            padding: "6px 20px",
            fontFamily: "Syne,sans-serif",
            fontSize: ".82rem",
            fontWeight: 700,
            color: "#fbbf24",
            marginBottom: "1.4rem",
          }}
        >
          🎯 Score: {cert.score} points
        </div>
      )}
      <div
        style={{
          height: 1,
          background: "rgba(245,158,11,.2)",
          margin: "0 0 1.2rem",
        }}
      />
      <div style={{ display: "flex", justifyContent: "center", gap: "2rem" }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 60,
              height: 1,
              background: "rgba(251,191,36,.4)",
              margin: "0 auto .4rem",
            }}
          />
          <div
            style={{
              fontSize: ".65rem",
              color: "rgba(251,191,36,.5)",
              fontFamily: "Syne,sans-serif",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: ".5px",
            }}
          >
            Teacher
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 60,
              height: 1,
              background: "rgba(251,191,36,.4)",
              margin: "0 auto .4rem",
            }}
          />
          <div
            style={{
              fontSize: ".65rem",
              color: "rgba(251,191,36,.5)",
              fontFamily: "Syne,sans-serif",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: ".5px",
            }}
          >
            {new Date(cert.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const StudentDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const [activeTab, setActiveTab] = useState("quizzes");
  const [posts, setPosts] = useState([]);
  const [myCerts, setMyCerts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [viewingCert, setViewingCert] = useState(null);
  const [postText, setPostText] = useState("");
  const [attachedCert, setAttachedCert] = useState(null);
  const [postLoading, setPostLoading] = useState(false);
  const [showCertPicker, setShowCertPicker] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editText, setEditText] = useState("");

  const commentRefs = useRef({});

  const fetchQuizzes = async () => {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setQuizzes(data);
  };

  const fetchQuestions = async (quizId, quiz) => {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", quizId);
    if (!error) {
      setQuestions(data);
      setTimer(quiz?.time_limit ? quiz.time_limit * 60 : 300);
    }
  };

  const fetchPosts = useCallback(async () => {
    const { data: postsData, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("posts error:", error.message);
      return;
    }
    if (!postsData || postsData.length === 0) {
      setPosts([]);
      return;
    }

    const postIds = postsData.map((p) => p.id);
    const { data: commentsData } = await supabase
      .from("comments")
      .select("*")
      .in("post_id", postIds)
      .order("created_at", { ascending: true });

    setPosts(
      postsData.map((post) => ({
        ...post,
        comments: (commentsData || []).filter((c) => c.post_id === post.id),
      })),
    );
  }, []);

  useEffect(() => {
    fetchQuizzes();
    loadCurrentUser();
    fetchPosts();
  }, [fetchPosts]);

  const loadCurrentUser = async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (auth?.user) {
      const { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("id", auth.user.id)
        .single();
      setCurrentUser(user);
      const { data: certs } = await supabase
        .from("certificates")
        .select("*")
        .eq("student_id", auth.user.id)
        .order("created_at", { ascending: false });
      if (certs) setMyCerts(certs);
    }
  };

  const startQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setSubmitted(false);
    setAnswers({});
    fetchQuestions(quiz.id, quiz);
    const id = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setIntervalId(id);
  };

  const handleAnswer = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleSubmit = async () => {
    if (intervalId) clearInterval(intervalId);
    let score = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_option) score += 1;
    });
    const { data: userData } = await supabase.auth.getUser();
    await supabase.from("submissions").insert([
      {
        quiz_id: currentQuiz.id,
        student_id: userData.user.id,
        score,
        answers,
      },
    ]);
    setSubmitted(true);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const createPost = async () => {
    if (!postText.trim() && !attachedCert) return;
    setPostLoading(true);
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      alert("You must be logged in.");
      setPostLoading(false);
      return;
    }
    const { data: userData } = await supabase
      .from("users")
      .select("name")
      .eq("id", authData.user.id)
      .single();
    const { error } = await supabase.from("posts").insert([
      {
        student_id: authData.user.id,
        student_name: userData?.name || "Student",
        content: postText.trim() || null,
        type: attachedCert ? "certificate" : "student_post",
        cert_id: attachedCert?.id || null,
        quiz_title: attachedCert?.quiz_title || null,
        score: attachedCert?.score ?? null,
      },
    ]);
    if (error) {
      alert("Error: " + error.message);
    } else {
      setPostText("");
      setAttachedCert(null);
      setShowCertPicker(false);
      await fetchPosts();
    }
    setPostLoading(false);
  };

  const deletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (!error) await fetchPosts();
  };

  const startEditPost = (post) => {
    setEditingPost(post.id);
    setEditText(post.content || "");
  };

  const saveEditPost = async (postId) => {
    if (!editText.trim()) return;
    const { error } = await supabase
      .from("posts")
      .update({ content: editText.trim() })
      .eq("id", postId);
    if (!error) {
      setEditingPost(null);
      setEditText("");
      await fetchPosts();
    }
  };

  const addComment = async (postId) => {
    const input = commentRefs.current[postId];
    const text = input?.value?.trim();
    if (!text) return;
    const { data: authData } = await supabase.auth.getUser();
    const { data: ud } = await supabase
      .from("users")
      .select("name,role")
      .eq("id", authData.user.id)
      .single();
    const { error } = await supabase.from("comments").insert([
      {
        post_id: postId,
        author_name: ud?.name || "Student",
        author_role: ud?.role || "student",
        text,
      },
    ]);
    if (!error) {
      if (input) input.value = "";
      await fetchPosts();
    }
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const progressPct =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  const isTimerDanger = timer <= 30 && timer > 0;
  const finalScore = questions.reduce(
    (acc, q) => acc + (answers[q.id] === q.correct_option ? 1 : 0),
    0,
  );
  const scorePct = totalQuestions > 0 ? (finalScore / totalQuestions) * 100 : 0;
  const scoreEmoji =
    scorePct >= 80
      ? "🏆"
      : scorePct >= 60
        ? "🎯"
        : scorePct >= 40
          ? "📚"
          : "💪";

  const particles = Array.from({ length: 10 }, (_, i) => ({
    x: (i * 10) % 100,
    size: `${4 + (i % 3) * 2}px`,
    color:
      i % 3 === 0
        ? "rgba(56,189,248,.4)"
        : i % 3 === 1
          ? "rgba(99,102,241,.32)"
          : "rgba(236,72,153,.28)",
    duration: 3.5 + (i % 4) * 0.8,
    delay: i * 0.4,
  }));

  const isMyPost = (post) => post.student_id === currentUser?.id;

  const PostCard = ({ post }) => (
    <div className="db-post" style={{ marginBottom: "1.1rem" }}>
      <div className="db-post-header">
        <div className="db-post-avatar">
          {(post.student_name || "?").slice(0, 2).toUpperCase()}
        </div>
        <div className="db-post-meta">
          <div className="db-post-name">{post.student_name}</div>
          <div className="db-post-time">
            {new Date(post.created_at).toLocaleString()}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginLeft: "auto",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: ".65rem",
              fontFamily: "Syne,sans-serif",
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 50,
              background:
                post.type === "certificate"
                  ? "rgba(245,158,11,.15)"
                  : "rgba(56,189,248,.1)",
              color: post.type === "certificate" ? "#fbbf24" : "#7dd3fc",
              border:
                post.type === "certificate"
                  ? "1px solid rgba(245,158,11,.3)"
                  : "1px solid rgba(56,189,248,.2)",
            }}
          >
            {post.type === "certificate" ? "🏆 Cert" : "📝 Post"}
          </div>

          {isMyPost(post) && (
            <>
              <button
                onClick={() => startEditPost(post)}
                style={{
                  background: "rgba(56,189,248,.1)",
                  border: "1px solid rgba(56,189,248,.2)",
                  borderRadius: 8,
                  color: "#7dd3fc",
                  padding: "4px 10px",
                  cursor: "pointer",
                  fontFamily: "Syne,sans-serif",
                  fontSize: ".72rem",
                  fontWeight: 700,
                }}
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => deletePost(post.id)}
                style={{
                  background: "rgba(239,68,68,.12)",
                  border: "1px solid rgba(239,68,68,.28)",
                  borderRadius: 8,
                  color: "#fca5a5",
                  padding: "4px 10px",
                  cursor: "pointer",
                  fontFamily: "Syne,sans-serif",
                  fontSize: ".72rem",
                  fontWeight: 700,
                }}
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>

      {editingPost === post.id ? (
        <div style={{ padding: ".2rem 1rem .8rem" }}>
          <textarea
            defaultValue={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              padding: "10px 12px",
              background: "rgba(255,255,255,.06)",
              border: "1px solid #38bdf8",
              borderRadius: 11,
              color: "#e0f2fe",
              fontFamily: "DM Sans,sans-serif",
              fontSize: ".88rem",
              outline: "none",
              resize: "vertical",
              lineHeight: 1.5,
              boxShadow: "0 0 0 3px rgba(56,189,248,.12)",
            }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button
              onClick={() => saveEditPost(post.id)}
              style={{
                padding: "7px 16px",
                border: "none",
                borderRadius: 9,
                background: "linear-gradient(135deg,#0ea5e9,#6366f1)",
                color: "#fff",
                fontFamily: "Syne,sans-serif",
                fontSize: ".78rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Save
            </button>
            <button
              onClick={() => setEditingPost(null)}
              style={{
                padding: "7px 16px",
                border: "1px solid rgba(56,189,248,.2)",
                borderRadius: 9,
                background: "transparent",
                color: "rgba(125,211,252,.6)",
                fontFamily: "Syne,sans-serif",
                fontSize: ".78rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        post.content && (
          <div
            style={{
              padding: ".2rem 1.1rem .8rem",
              fontSize: ".92rem",
              color: "rgba(186,230,253,.9)",
              lineHeight: 1.65,
            }}
          >
            {post.content}
          </div>
        )
      )}

      {post.type === "certificate" && post.quiz_title && (
        <div
          className="db-post-cert"
          style={{ cursor: "pointer" }}
          onClick={() =>
            setViewingCert({
              student_name: post.student_name,
              quiz_title: post.quiz_title,
              score: post.score,
              created_at: post.created_at,
            })
          }
        >
          <div className="db-cert-label">
            🏆 Certificate of Achievement &nbsp;
            <span style={{ opacity: 0.5, fontSize: ".6rem" }}>tap to view</span>
          </div>
          <div className="db-cert-title">{post.quiz_title}</div>
          {post.score != null && (
            <div className="db-cert-sub">Score: {post.score} points</div>
          )}
          <span className="db-cert-icon">🎓</span>
        </div>
      )}

      {post.comments && post.comments.length > 0 && (
        <div className="db-comments">
          {post.comments.map((c, ci) => (
            <div key={ci} className="db-comment-item">
              <div className="db-comment-av">
                {(c.author_name || "?").slice(0, 2).toUpperCase()}
              </div>
              <div className="db-comment-body">
                <div className="db-comment-author">
                  {c.author_name} {c.author_role === "teacher" ? "👨‍🏫" : "🎓"}
                </div>
                <div className="db-comment-text">{c.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="db-comment-input-wrap">
        <input
          ref={(el) => (commentRefs.current[post.id] = el)}
          className="db-comment-input"
          placeholder="Write a comment and press Enter…"
          onKeyDown={(e) => {
            if (e.key === "Enter") addComment(post.id);
          }}
        />
        <button className="db-comment-send" onClick={() => addComment(post.id)}>
          ➤
        </button>
      </div>
    </div>
  );

  return (
    <div className="db-page">
      <Orb
        style={{
          width: 480,
          height: 480,
          top: -150,
          right: -130,
          background: "rgba(14,165,233,.15)",
          animation: "lq-orbFloat 9s ease-in-out infinite",
        }}
      />
      <Orb
        style={{
          width: 360,
          height: 360,
          bottom: -90,
          left: -90,
          background: "rgba(99,102,241,.18)",
          animation: "lq-orbFloat 11s ease-in-out infinite reverse",
        }}
      />
      <Orb
        style={{
          width: 260,
          height: 260,
          top: "45%",
          left: "45%",
          background: "rgba(236,72,153,.1)",
          animation: "lq-orbFloat 13s ease-in-out infinite",
        }}
      />
      {particles.map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      <nav className="db-nav">
        <div className="db-nav-logo">
          <div className="db-nav-icon">🧠</div>
          <span className="db-nav-title">QuizForge</span>
        </div>
        <div className="db-nav-tabs">
          <button
            className={`db-tab ${activeTab === "quizzes" ? "active" : ""}`}
            onClick={() => setActiveTab("quizzes")}
          >
            📋 Quizzes
          </button>
          <button
            className={`db-tab ${activeTab === "certs" ? "active" : ""}`}
            onClick={() => setActiveTab("certs")}
          >
            🏆 My Certs{" "}
            {myCerts.length > 0 && (
              <span
                style={{
                  background: "rgba(245,158,11,.3)",
                  borderRadius: 50,
                  padding: "1px 7px",
                  fontSize: ".65rem",
                  marginLeft: 4,
                }}
              >
                {myCerts.length}
              </span>
            )}
          </button>
          <button
            className={`db-tab ${activeTab === "posts" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("posts");
              fetchPosts();
            }}
          >
            📌 Posts
          </button>
        </div>
        <div className="db-nav-badge">
          <div className="db-nav-dot" />
          Student Portal
        </div>
      </nav>

      <div className="db-body">
        <div>
          {activeTab === "quizzes" && (
            <>
              {!currentQuiz ? (
                <>
                  <div className="db-page-hdr">
                    <h1>
                      Student <span>Dashboard</span>
                    </h1>
                    <p>Pick a quiz and show what you know 🚀</p>
                  </div>
                  <div className="db-section-hdr">
                    📋 Available Quizzes{" "}
                    <span className="db-badge-count">{quizzes.length}</span>
                  </div>
                  {quizzes.length === 0 ? (
                    <div className="db-empty">
                      <span className="db-empty-icon">📭</span>No quizzes yet.
                    </div>
                  ) : (
                    <div className="sd-quiz-grid">
                      {quizzes.map((quiz, i) => (
                        <div
                          key={quiz.id}
                          className="sd-quiz-card"
                          style={{ animationDelay: `${i * 0.08}s` }}
                        >
                          <div>
                            <div className="sd-quiz-card-name">
                              {quiz.title}
                            </div>
                            <div className="sd-quiz-card-meta">
                              <span>⏱️ {quiz.time_limit} min</span>
                              <span
                                style={{
                                  width: 3,
                                  height: 3,
                                  borderRadius: "50%",
                                  background: "rgba(125,211,252,.35)",
                                  display: "inline-block",
                                  margin: "0 4px",
                                }}
                              />
                              <span>📝 Quiz</span>
                            </div>
                          </div>
                          <button
                            className="sd-start-btn"
                            onClick={() => startQuiz(quiz)}
                          >
                            Start →
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : submitted ? (
                <div className="sd-score-wrap">
                  <div className="sd-score-card">
                    <span className="sd-score-emoji">{scoreEmoji}</span>
                    <div className="sd-score-title">Quiz Complete!</div>
                    <div className="sd-score-sub">{currentQuiz.title}</div>
                    <div className="sd-score-num">{finalScore}</div>
                    <div className="sd-score-denom">
                      out of {totalQuestions} questions
                    </div>
                    <div className="sd-score-bar-wrap">
                      <div
                        className="sd-score-bar-fill"
                        style={{ width: `${scorePct}%` }}
                      />
                    </div>
                    {scorePct >= 50 && (
                      <div
                        style={{
                          fontSize: ".8rem",
                          color: "rgba(251,191,36,.85)",
                          fontFamily: "Syne,sans-serif",
                          marginBottom: "1rem",
                          fontWeight: 700,
                          padding: "8px 14px",
                          background: "rgba(245,158,11,.1)",
                          borderRadius: 10,
                          border: "1px solid rgba(245,158,11,.25)",
                        }}
                      >
                        🏆 Great job! Your teacher may send you a certificate!
                      </div>
                    )}
                    <button
                      className="sd-back-btn"
                      onClick={() => {
                        setCurrentQuiz(null);
                        setSubmitted(false);
                        fetchQuizzes();
                      }}
                    >
                      ← Back
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="sd-timer-wrap">
                    <div>
                      <div className="sd-quiz-label-tag">Now Taking</div>
                      <div className="sd-quiz-label-name">
                        {currentQuiz.title}
                      </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div
                        className={`sd-timer ${isTimerDanger ? "danger" : ""}`}
                      >
                        {formatTime(timer)}
                      </div>
                      <div className="sd-timer-label">Time Left</div>
                    </div>
                  </div>
                  <div className="sd-progress-wrap">
                    <div className="sd-progress-header">
                      <span>Progress</span>
                      <span>
                        {answeredCount} / {totalQuestions}
                      </span>
                    </div>
                    <div className="sd-progress-bar">
                      <div
                        className="sd-progress-fill"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="sd-question-card"
                      style={{ animationDelay: `${idx * 0.06}s` }}
                    >
                      <div className="sd-question-num">
                        Question {idx + 1} of {totalQuestions}
                      </div>
                      <div className="sd-question-text">{q.question_text}</div>
                      <div className="sd-options">
                        {["a", "b", "c", "d"].map((opt) => (
                          <button
                            key={opt}
                            className={`sd-option ${answers[q.id] === opt ? "selected" : ""}`}
                            onClick={() => handleAnswer(q.id, opt)}
                          >
                            <span className="sd-option-letter">
                              {opt.toUpperCase()}
                            </span>
                            {q[`option_${opt}`]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button className="sd-submit-btn" onClick={handleSubmit}>
                    ✅ Submit Quiz
                  </button>
                </>
              )}
            </>
          )}

          {activeTab === "certs" && (
            <>
              <div className="db-page-hdr">
                <h1>
                  My <span>Certificates</span>
                </h1>
                <p>Tap any certificate to view it in full 🏆</p>
              </div>
              {myCerts.length === 0 ? (
                <div className="db-empty">
                  <span className="db-empty-icon">🏆</span>No certificates yet.
                </div>
              ) : (
                myCerts.map((cert, i) => (
                  <div
                    key={cert.id}
                    className="sd-cert-received"
                    style={{
                      cursor: "pointer",
                      animationDelay: `${i * 0.08}s`,
                      marginBottom: ".8rem",
                    }}
                    onClick={() => setViewingCert(cert)}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div className="sd-cert-received-label">
                          🏆 Certificate of Achievement
                        </div>
                        <div className="sd-cert-received-title">
                          {cert.quiz_title}
                        </div>
                        <div className="sd-cert-received-sub">
                          {cert.score != null
                            ? `Score: ${cert.score} pts · `
                            : ""}
                          {new Date(cert.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: ".75rem",
                          fontFamily: "Syne,sans-serif",
                          color: "rgba(251,191,36,.65)",
                          fontWeight: 700,
                          padding: "5px 12px",
                          border: "1px solid rgba(251,191,36,.25)",
                          borderRadius: 50,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        View →
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === "posts" && (
            <>
              <div className="db-page-hdr">
                <h1>
                  Community <span>Feed</span>
                </h1>
                <p>Everyone can see and comment on all posts 🎉</p>
              </div>

              <div className="db-card" style={{ marginBottom: "1.4rem" }}>
                <div className="db-card-title">
                  <div className="db-card-icon">✍️</div>Create a Post
                </div>

                <textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder={`What's on your mind, ${currentUser?.name?.split(" ")[0] || "student"}?`}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "rgba(255,255,255,.04)",
                    border: "1px solid rgba(56,189,248,.18)",
                    borderRadius: 13,
                    color: "#e0f2fe",
                    fontFamily: "DM Sans,sans-serif",
                    fontSize: ".9rem",
                    outline: "none",
                    resize: "vertical",
                    lineHeight: 1.6,
                    transition: "border-color .2s",
                    marginBottom: ".8rem",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#38bdf8";
                    e.target.style.boxShadow = "0 0 0 3px rgba(56,189,248,.12)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(56,189,248,.18)";
                    e.target.style.boxShadow = "none";
                  }}
                />

                {attachedCert && (
                  <div
                    style={{
                      background: "rgba(245,158,11,.1)",
                      border: "1px solid rgba(245,158,11,.3)",
                      borderRadius: 12,
                      padding: ".8rem 1rem",
                      marginBottom: ".8rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: ".62rem",
                          fontFamily: "Syne,sans-serif",
                          fontWeight: 700,
                          color: "rgba(251,191,36,.6)",
                          textTransform: "uppercase",
                          letterSpacing: ".5px",
                          marginBottom: 2,
                        }}
                      >
                        🏆 Attached Certificate
                      </div>
                      <div
                        style={{
                          fontFamily: "Syne,sans-serif",
                          fontSize: ".88rem",
                          fontWeight: 700,
                          color: "#fbbf24",
                        }}
                      >
                        {attachedCert.quiz_title}
                      </div>
                      {attachedCert.score != null && (
                        <div
                          style={{
                            fontSize: ".75rem",
                            color: "rgba(251,191,36,.55)",
                          }}
                        >
                          Score: {attachedCert.score}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setAttachedCert(null)}
                      style={{
                        background: "rgba(239,68,68,.15)",
                        border: "1px solid rgba(239,68,68,.3)",
                        borderRadius: 8,
                        color: "#fca5a5",
                        padding: "4px 10px",
                        cursor: "pointer",
                        fontFamily: "Syne,sans-serif",
                        fontSize: ".72rem",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      ✕ Remove
                    </button>
                  </div>
                )}

                {showCertPicker && !attachedCert && (
                  <div
                    style={{
                      background: "rgba(6,11,24,.98)",
                      border: "1px solid rgba(245,158,11,.25)",
                      borderRadius: 14,
                      padding: ".5rem",
                      marginBottom: ".8rem",
                      maxHeight: 200,
                      overflowY: "auto",
                    }}
                  >
                    {myCerts.length === 0 ? (
                      <div
                        style={{
                          padding: ".8rem",
                          textAlign: "center",
                          fontSize: ".82rem",
                          color: "rgba(125,211,252,.4)",
                          fontFamily: "Syne,sans-serif",
                        }}
                      >
                        No certificates yet
                      </div>
                    ) : (
                      myCerts.map((cert) => (
                        <div
                          key={cert.id}
                          onClick={() => {
                            setAttachedCert(cert);
                            setShowCertPicker(false);
                          }}
                          style={{
                            padding: ".7rem .9rem",
                            borderRadius: 10,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(245,158,11,.1)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <span style={{ fontSize: "1.2rem" }}>🏆</span>
                          <div>
                            <div
                              style={{
                                fontFamily: "Syne,sans-serif",
                                fontSize: ".84rem",
                                fontWeight: 700,
                                color: "#fbbf24",
                              }}
                            >
                              {cert.quiz_title}
                            </div>
                            {cert.score != null && (
                              <div
                                style={{
                                  fontSize: ".72rem",
                                  color: "rgba(251,191,36,.55)",
                                }}
                              >
                                Score: {cert.score}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".7rem",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={() => setShowCertPicker((v) => !v)}
                    style={{
                      padding: "8px 14px",
                      border: "1px solid rgba(245,158,11,.3)",
                      borderRadius: 10,
                      background: showCertPicker
                        ? "rgba(245,158,11,.15)"
                        : "transparent",
                      color: "#fbbf24",
                      fontFamily: "Syne,sans-serif",
                      fontSize: ".78rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    🏆{" "}
                    {attachedCert ? "Change Certificate" : "Attach Certificate"}
                  </button>
                  <div style={{ flex: 1 }} />
                  <button
                    onClick={createPost}
                    disabled={
                      postLoading || (!postText.trim() && !attachedCert)
                    }
                    style={{
                      padding: "10px 28px",
                      border: "none",
                      borderRadius: 12,
                      background:
                        postText.trim() || attachedCert
                          ? "linear-gradient(135deg,#0ea5e9,#6366f1)"
                          : "rgba(56,189,248,.08)",
                      color:
                        postText.trim() || attachedCert
                          ? "#fff"
                          : "rgba(125,211,252,.35)",
                      fontFamily: "Syne,sans-serif",
                      fontSize: ".9rem",
                      fontWeight: 700,
                      cursor:
                        postText.trim() || attachedCert
                          ? "pointer"
                          : "not-allowed",
                      transition: "all .25s",
                      boxShadow:
                        postText.trim() || attachedCert
                          ? "0 4px 16px rgba(14,165,233,.35)"
                          : "none",
                    }}
                  >
                    {postLoading ? "Posting…" : "Post 🚀"}
                  </button>
                </div>
              </div>

              {posts.length === 0 ? (
                <div className="db-empty">
                  <span className="db-empty-icon">📌</span>No posts yet — be the
                  first!
                </div>
              ) : (
                posts.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </>
          )}
        </div>

        <div className="db-sidebar">
          <div className="db-card">
            <div className="db-card-title">
              <div className="db-card-icon">🏆</div>My Certificates
            </div>
            {myCerts.length === 0 ? (
              <div className="db-empty" style={{ padding: ".8rem 0" }}>
                No certificates yet
              </div>
            ) : (
              myCerts.slice(0, 3).map((cert, i) => (
                <div
                  key={cert.id}
                  className="sd-cert-received"
                  style={{ marginBottom: ".6rem", cursor: "pointer" }}
                  onClick={() => setViewingCert(cert)}
                >
                  <div className="sd-cert-received-label">🏆 Achievement</div>
                  <div className="sd-cert-received-title">
                    {cert.quiz_title}
                  </div>
                  <div className="sd-cert-received-sub">
                    {cert.score != null ? `Score: ${cert.score} · ` : ""}Tap to
                    view
                  </div>
                </div>
              ))
            )}
            {myCerts.length > 3 && (
              <button
                onClick={() => setActiveTab("certs")}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid rgba(245,158,11,.25)",
                  borderRadius: 10,
                  background: "transparent",
                  color: "rgba(251,191,36,.6)",
                  fontFamily: "Syne,sans-serif",
                  fontSize: ".75rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  marginTop: ".4rem",
                }}
              >
                View all {myCerts.length} →
              </button>
            )}
          </div>

          <div
            style={{
              fontFamily: "Syne,sans-serif",
              fontSize: ".9rem",
              fontWeight: 800,
              color: "#e0f2fe",
              marginBottom: ".8rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div className="db-card-icon">📌</div>Recent Posts
          </div>
          {posts.length === 0 ? (
            <div className="db-empty">
              <span className="db-empty-icon">📌</span>No posts yet
            </div>
          ) : (
            posts.slice(0, 3).map((post) => (
              <div
                key={post.id}
                className="db-post"
                style={{ marginBottom: ".8rem" }}
              >
                <div className="db-post-header">
                  <div className="db-post-avatar">
                    {(post.student_name || "?").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="db-post-meta">
                    <div className="db-post-name">{post.student_name}</div>
                    <div className="db-post-time">
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {post.content && (
                  <div
                    style={{
                      padding: ".2rem .9rem .7rem",
                      fontSize: ".82rem",
                      color: "rgba(186,230,253,.75)",
                      lineHeight: 1.5,
                    }}
                  >
                    {post.content}
                  </div>
                )}
                {post.type === "certificate" && post.quiz_title && (
                  <div
                    className="db-post-cert"
                    style={{ cursor: "pointer", margin: "0 .9rem .9rem" }}
                    onClick={() =>
                      setViewingCert({
                        student_name: post.student_name,
                        quiz_title: post.quiz_title,
                        score: post.score,
                        created_at: post.created_at,
                      })
                    }
                  >
                    <div className="db-cert-label">🏆 Certificate</div>
                    <div className="db-cert-title">{post.quiz_title}</div>
                    <span className="db-cert-icon">🎓</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {viewingCert && (
        <CertModal cert={viewingCert} onClose={() => setViewingCert(null)} />
      )}
    </div>
  );
};

export default StudentDashboard;
