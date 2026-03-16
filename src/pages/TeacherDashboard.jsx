import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import "./Dashboard.css";

const Orb = ({ style }) => <div className="db-orb" style={style} />;
const Particle = ({ x, size, color, duration, delay }) => (
  <div className="db-particle" style={{ left:`${x}%`, bottom:"-10px", width:size, height:size, background:color, animationDuration:`${duration}s`, animationDelay:`${delay}s` }} />
);

const TeacherDashboard = () => {

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

  const [activeTab, setActiveTab]       = useState("dashboard");
  const [chartQuiz, setChartQuiz]       = useState(null);
  const [chartData, setChartData]       = useState([]);
  const [posts, setPosts]               = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const [certModal, setCertModal]       = useState(null);
  const [resultsModal, setResultsModal] = useState(null);

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

  const createQuiz = async () => {
    const { data: user } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("quizzes").insert([{
      title, time_limit: timeLimit, teacher_id: user.user.id
    }]);
    console.log("DATA:", data); console.log("ERROR:", error);
    if (!error) { alert("Quiz Created!"); setTitle(""); setTimeLimit(""); fetchQuizzes(); }
  };

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

  const deleteQuiz = async (id) => {
    const { error } = await supabase.from("quizzes").delete().eq("id", id);
    if (!error) fetchQuizzes();
  };

  const viewResults = async (quizId) => {
    const { data, error } = await supabase.from("submissions").select("*").eq("quiz_id", quizId);
    if (!error) {
      console.log(data);
      const withNames = await Promise.all(data.map(async (sub) => {
        const { data: u } = await supabase.from("users").select("name").eq("id", sub.student_id).single();
        return { ...sub, studentName: u?.name || "Student" };
      }));
      setResultsModal({ quizId, data: withNames });
    }
  };

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

  const maxScore = Math.max(...chartData.map(d => d.score), 1);

  return (
    <div className="db-page">
      ...
    </div>
  );
};

export default TeacherDashboard;