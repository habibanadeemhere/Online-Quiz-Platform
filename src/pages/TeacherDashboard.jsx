import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import "./Dashboard.css";

/* ─── Orb / Particle ─── */
const Orb = ({ style }) => <div className="db-orb" style={style} />;
const Particle = ({ x, size, color, duration, delay }) => (
  <div className="db-particle" style={{ left:`${x}%`, bottom:"-10px", width:size, height:size, background:color, animationDuration:`${duration}s`, animationDelay:`${delay}s` }} />
);

/* ══════════════════════════════════════════
   TEACHER DASHBOARD
══════════════════════════════════════════ */
const TeacherDashboard = () => {

  /* ── Your original state — untouched ── */
  const [quizzes, setQuizzes]           = useState([]);
  const [title, setTitle]               = useState("");
  const [timeLimit, setTimeLimit]       = useState("");
  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA]           = useState("");
  const [optionB, setOptionB]           = useState("");
  const [optionC, setOptionC]           = useState("");
  const [optionD, setOptionD]           = useState("");
  const [correctOption, setCorrectOption] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  /* ── Extra UI state ── */
  const [activeTab, setActiveTab]       = useState("dashboard"); // dashboard | posts
  const [chartQuiz, setChartQuiz]       = useState(null);
  const [chartData, setChartData]       = useState([]);
  const [posts, setPosts]               = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const [certModal, setCertModal]       = useState(null); // { student, quiz, score }
  const [resultsModal, setResultsModal] = useState(null); // { quizId, data }

  /* ── Your original fetchQuizzes — untouched ── */
  const fetchQuizzes = async () => {
    const { data, error } = await supabase
      .from("quizzes").select("*").order("created_at", { ascending: false });
    console.log("QUIZZES:", data);
    if (!error) setQuizzes(data);
  };

  useEffect(() => {
    fetchQuizzes();
    fetchPosts();
  }, []);

  /* ── Your original createQuiz — untouched ── */
  const createQuiz = async () => {
    const { data: user } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("quizzes").insert([{
      title, time_limit: timeLimit, teacher_id: user.user.id
    }]);
    console.log("DATA:", data); console.log("ERROR:", error);
    if (!error) { alert("Quiz Created!"); setTitle(""); setTimeLimit(""); fetchQuizzes(); }
  };

  /* ── Your original addQuestion — untouched ── */
  const addQuestion = async () => {
    if (!selectedQuiz) { alert("Select a quiz first"); return; }
    const { error } = await supabase.from("questions").insert([{
      quiz_id: selectedQuiz, question_text: questionText,
      option_a: optionA, option_b: optionB, option_c: optionC, option_d: optionD,
      correct_option: correctOption
    }]);
    if (!error) {
      alert("Question Added!");
      setQuestionText(""); setOptionA(""); setOptionB(""); setOptionC(""); setOptionD(""); setCorrectOption("");
    }
  };

  /* ── Your original deleteQuiz — untouched ── */
  const deleteQuiz = async (id) => {
    const { error } = await supabase.from("quizzes").delete().eq("id", id);
    if (!error) fetchQuizzes();
  };

  /* ── Your original viewResults — untouched ── */
  const viewResults = async (quizId) => {
    const { data, error } = await supabase.from("submissions").select("*").eq("quiz_id", quizId);
    if (!error) {
      console.log(data);
      // Also show in UI modal
      const withNames = await Promise.all(data.map(async (sub) => {
        const { data: u } = await supabase.from("users").select("name").eq("id", sub.student_id).single();
        return { ...sub, studentName: u?.name || "Student" };
      }));
      setResultsModal({ quizId, data: withNames });
    }
  };

  /* ── Chart: fetch top students for a quiz ── */
  const loadChart = async (quiz) => {
    setChartQuiz(quiz);
    const { data, error } = await supabase
      .from("submissions").select("*").eq("quiz_id", quiz.id).order("score", { ascending: false }).limit(8);
    if (!error) {
      const withNames = await Promise.all(data.map(async (sub) => {
        const { data: u } = await supabase.from("users").select("name").eq("id", sub.student_id).single();
        return { ...sub, studentName: u?.name || "Student" };
      }));
      setChartData(withNames);
    }
  };

  /* ── Certificate: send to student ── */
  const sendCertificate = async () => {
    if (!certModal) return;
    const { error } = await supabase.from("certificates").insert([{
      student_id: certModal.student.student_id,
      quiz_id:    certModal.quiz.id,
      score:      certModal.student.score,
      quiz_title: certModal.quiz.title,
      student_name: certModal.student.studentName,
    }]);
    if (!error) {
      // Also create a post for the feed
      await supabase.from("posts").insert([{
        student_id:   certModal.student.student_id,
        student_name: certModal.student.studentName,
        quiz_title:   certModal.quiz.title,
        score:        certModal.student.score,
        type:         "certificate",
      }]);
      alert(`Certificate sent to ${certModal.student.studentName}! 🏆`);
      setCertModal(null);
      fetchPosts();
    } else {
      alert("Error sending certificate: " + error.message);
    }
  };

  /* ── Posts feed ── */
  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts").select("*, comments(*)").order("created_at", { ascending: false });
    if (!error) setPosts(data);
  };

  const addComment = async (postId) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    const { data: user } = await supabase.auth.getUser();
    const { data: userData } = await supabase.from("users").select("name, role").eq("id", user.user.id).single();
    const { error } = await supabase.from("comments").insert([{
      post_id: postId, author_name: userData?.name || "Teacher",
      author_role: "teacher", text
    }]);
    if (!error) {
      setCommentInputs(p => ({ ...p, [postId]: "" }));
      fetchPosts();
    }
  };

  const particles = Array.from({ length: 10 }, (_, i) => ({
    x: (i * 10) % 100, size: `${4 + (i % 3) * 2}px`,
    color: i%3===0?"rgba(56,189,248,.4)":i%3===1?"rgba(99,102,241,.32)":"rgba(236,72,153,.28)",
    duration: 3.5+(i%4)*.8, delay: i*.4,
  }));

  /* ── Max score for chart scaling ── */
  const maxScore = Math.max(...chartData.map(d => d.score), 1);

  return (
    <div className="db-page">
      <Orb style={{width:480,height:480,top:-150,right:-130,background:"rgba(14,165,233,.15)",animation:"lq-orbFloat 9s ease-in-out infinite"}}/>
      <Orb style={{width:360,height:360,bottom:-90,left:-90,background:"rgba(99,102,241,.18)",animation:"lq-orbFloat 11s ease-in-out infinite reverse"}}/>
      <Orb style={{width:260,height:260,top:"45%",left:"45%",background:"rgba(236,72,153,.1)",animation:"lq-orbFloat 13s ease-in-out infinite"}}/>
      {particles.map((p,i) => <Particle key={i} {...p}/>)}

      {/* ── Navbar ── */}
      <nav className="db-nav">
        <div className="db-nav-logo">
          <div className="db-nav-icon">🧠</div>
          <span className="db-nav-title">QuizForge</span>
        </div>
        <div className="db-nav-tabs">
          <button className={`db-tab ${activeTab==="dashboard"?"active":""}`} onClick={()=>setActiveTab("dashboard")}>📊 Dashboard</button>
          <button className={`db-tab ${activeTab==="posts"?"active":""}`} onClick={()=>setActiveTab("posts")}>📌 Posts</button>
        </div>
        <div className="db-nav-badge"><div className="db-nav-dot"/>Teacher Portal</div>
      </nav>

      <div className="db-body">
        {/* ══ MAIN CONTENT ══ */}
        <div>
          <div className="db-page-hdr">
            <h1>Teacher <span>Dashboard</span></h1>
            <p>Create quizzes, track results, and reward your students</p>
          </div>

          {/* Stats */}
          <div className="db-stats">
            <div className="db-stat">
              <div className="db-stat-icon">📋</div>
              <div className="db-stat-num">{quizzes.length}</div>
              <div className="db-stat-label">Total Quizzes</div>
            </div>
            <div className="db-stat">
              <div className="db-stat-icon">🎯</div>
              <div className="db-stat-num">—</div>
              <div className="db-stat-label">Questions</div>
            </div>
            <div className="db-stat">
              <div className="db-stat-icon">🏆</div>
              <div className="db-stat-num">{posts.length}</div>
              <div className="db-stat-label">Certificates Sent</div>
            </div>
          </div>

          {/* Create + Add Question */}
          <div className="db-grid">
            {/* Create Quiz */}
            <div className="db-card">
              <div className="db-card-title"><div className="db-card-icon">➕</div>Create Quiz</div>
              <div className="db-field">
                <label className="db-label">Quiz Name</label>
                <div className="db-iw"><span className="db-ico">📝</span>
                  <input type="text" placeholder="Quiz Name" className="db-input" value={title} onChange={e=>setTitle(e.target.value)}/>
                </div>
              </div>
              <div className="db-field">
                <label className="db-label">Timer (minutes)</label>
                <div className="db-iw"><span className="db-ico">⏱️</span>
                  <input type="number" placeholder="Timer (minutes)" className="db-input" value={timeLimit} onChange={e=>setTimeLimit(e.target.value)}/>
                </div>
              </div>
              <button onClick={createQuiz} className="db-btn">✨ Create Quiz</button>
            </div>

            {/* Add Question */}
            <div className="db-card">
              <div className="db-card-title"><div className="db-card-icon">❓</div>Add Question</div>
              <div className="db-field">
                <label className="db-label">Select Quiz</label>
                <div className="db-iw"><span className="db-ico">📋</span>
                  <select className="db-select" onChange={e=>setSelectedQuiz(e.target.value)}>
                    <option>Select Quiz</option>
                    {quizzes.map(q=><option key={q.id} value={q.id}>{q.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="db-field">
                <label className="db-label">Question</label>
                <div className="db-iw"><span className="db-ico">💬</span>
                  <input type="text" placeholder="Question" className="db-input" value={questionText} onChange={e=>setQuestionText(e.target.value)}/>
                </div>
              </div>
              <div className="db-field">
                <label className="db-label">Options</label>
                <div className="db-opts-grid">
                  {[["A",optionA,setOptionA],["B",optionB,setOptionB],["C",optionC,setOptionC],["D",optionD,setOptionD]].map(([l,v,s])=>(
                    <div key={l} className="db-opt-item">
                      <span className="db-opt-letter">{l}</span>
                      <input type="text" placeholder={`Option ${l}`} className="db-opt-input" value={v} onChange={e=>s(e.target.value)}/>
                    </div>
                  ))}
                </div>
              </div>
              <div className="db-field">
                <label className="db-label">Correct Option</label>
                <div className="db-correct-wrap">
                  {["a","b","c","d"].map(opt=>(
                    <button key={opt} type="button" className={`db-correct-btn ${correctOption===opt?"active":""}`} onClick={()=>setCorrectOption(opt)}>{opt.toUpperCase()}</button>
                  ))}
                </div>
              </div>
              <button onClick={addQuestion} className="db-btn">➕ Add Question</button>
            </div>
          </div>

          {/* ── Top Students Chart ── */}
          <div className="db-card" style={{marginBottom:"1.4rem"}}>
            <div className="db-card-title"><div className="db-card-icon">📊</div>Top Students Chart</div>
            <div className="db-chart-filter">
              {quizzes.map(q=>(
                <button key={q.id} className={`db-chart-filter-btn ${chartQuiz?.id===q.id?"active":""}`} onClick={()=>loadChart(q)}>
                  {q.title}
                </button>
              ))}
            </div>
            {!chartQuiz ? (
              <div className="db-chart-empty">👆 Select a quiz above to see the top students</div>
            ) : chartData.length === 0 ? (
              <div className="db-chart-empty">No submissions yet for this quiz</div>
            ) : (
              <div className="db-chart-wrap">
                {chartData.map((s, i) => {
                  const pct = (s.score / maxScore) * 100;
                  const h = Math.max(pct * 1.4, 8);
                  return (
                    <div key={i} className="db-bar-group">
                      <div className="db-bar-col" style={{height:`${h}px`}}>
                        <span className="db-bar-score">{s.score}</span>
                      </div>
                      <span className="db-bar-name">{s.studentName?.split(" ")[0]}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Quiz List ── */}
          <div>
            <div className="db-section-hdr">📚 Your Quizzes <span className="db-badge-count">{quizzes.length}</span></div>
            {quizzes.length === 0 ? (
              <div className="db-empty"><span className="db-empty-icon">📭</span>No quizzes yet. Create your first quiz above!</div>
            ) : quizzes.map((quiz,i) => (
              <div key={quiz.id} className="db-quiz-item" style={{animationDelay:`${i*.07}s`}}>
                <div style={{flex:1,minWidth:0}}>
                  <div className="db-quiz-name">{quiz.title}</div>
                  <div className="db-quiz-meta">
                    <span>⏱️ {quiz.time_limit} min</span>
                    <div className="db-quiz-dot"/>
                    <span>ID: {quiz.id?.slice(0,8)}…</span>
                  </div>
                </div>
                <div className="db-quiz-actions">
                  <button onClick={()=>viewResults(quiz.id)} className="db-btn-sm db-btn-results">📊 Results</button>
                  <button onClick={()=>deleteQuiz(quiz.id)} className="db-btn-sm db-btn-delete">🗑️ Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ SIDEBAR: Posts Feed ══ */}
        <div className="db-sidebar">
          <div className="db-card-title" style={{padding:"0 0 .5rem"}}>
            <div className="db-card-icon">📌</div>
            Certificate Feed
            <span className="db-badge-count">{posts.length}</span>
          </div>

          {posts.length === 0 ? (
            <div className="db-empty"><span className="db-empty-icon">🏆</span>No certificates sent yet.</div>
          ) : posts.map((post, i) => (
            <div key={post.id} className="db-post" style={{animationDelay:`${i*.06}s`}}>
              <div className="db-post-header">
                <div className="db-post-avatar">{post.student_name?.slice(0,2).toUpperCase()}</div>
                <div className="db-post-meta">
                  <div className="db-post-name">{post.student_name}</div>
                  <div className="db-post-time">{new Date(post.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="db-post-cert">
                <div className="db-cert-label">🏆 Certificate of Achievement</div>
                <div className="db-cert-title">{post.quiz_title}</div>
                <div className="db-cert-sub">Score: {post.score} points</div>
                <span className="db-cert-icon">🎓</span>
              </div>
              {/* Comments */}
              <div className="db-comments">
                {(post.comments||[]).map((c,ci)=>(
                  <div key={ci} className="db-comment-item">
                    <div className="db-comment-av">{c.author_name?.slice(0,2).toUpperCase()}</div>
                    <div className="db-comment-body">
                      <div className="db-comment-author">{c.author_name} {c.author_role==="teacher"?"👨‍🏫":"🎓"}</div>
                      <div className="db-comment-text">{c.text}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="db-comment-input-wrap">
                <input
                  className="db-comment-input"
                  placeholder="Add a comment…"
                  value={commentInputs[post.id]||""}
                  onChange={e=>setCommentInputs(p=>({...p,[post.id]:e.target.value}))}
                  onKeyDown={e=>e.key==="Enter"&&addComment(post.id)}
                />
                <button className="db-comment-send" onClick={()=>addComment(post.id)}>➤</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ Results Modal ══ */}
      {resultsModal && (
        <div className="db-modal-overlay" onClick={()=>setResultsModal(null)}>
          <div className="db-modal" onClick={e=>e.stopPropagation()}>
            <button className="db-modal-close" onClick={()=>setResultsModal(null)}>✕</button>
            <div className="db-modal-title">📊 Student Results</div>
            <div className="db-modal-sub">
              {quizzes.find(q=>q.id===resultsModal.quizId)?.title} — {resultsModal.data.length} submissions
            </div>
            <div className="db-results-list">
              {resultsModal.data.length===0 ? (
                <div className="db-empty">No submissions yet</div>
              ) : resultsModal.data.map((r,i)=>{
                const quiz = quizzes.find(q=>q.id===resultsModal.quizId);
                return (
                  <div key={i} className="db-result-item">
                    <div>
                      <div className="db-result-name">{r.studentName}</div>
                    </div>
                    <div className="db-result-bar-wrap">
                      <div className="db-result-bar" style={{width:`${Math.min((r.score/10)*100,100)}%`}}/>
                    </div>
                    <div className="db-result-score">{r.score} pts</div>
                    <button
                      className="db-btn-sm db-btn-cert"
                      onClick={()=>{ setResultsModal(null); setCertModal({student:r, quiz}); }}
                    >🏆 Certify</button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══ Certificate Modal ══ */}
      {certModal && (
        <div className="db-modal-overlay" onClick={()=>setCertModal(null)}>
          <div className="db-modal" onClick={e=>e.stopPropagation()}>
            <button className="db-modal-close" onClick={()=>setCertModal(null)}>✕</button>
            <div className="db-modal-title">🏆 Send Certificate</div>
            <div className="db-modal-sub">Preview the certificate before sending</div>
            <div className="db-cert-preview">
              <span className="db-cert-trophy">🏆</span>
              <div className="db-cert-congrats">Certificate of Achievement</div>
              <div className="db-cert-student-name">{certModal.student.studentName}</div>
              <div className="db-cert-quiz-name">has successfully completed</div>
              <div className="db-cert-student-name" style={{fontSize:"1rem"}}>{certModal.quiz.title}</div>
              <div className="db-cert-score-line">Score: {certModal.student.score} points</div>
            </div>
            <button className="db-btn" onClick={sendCertificate}>
              ✅ Send Certificate to {certModal.student.studentName}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;