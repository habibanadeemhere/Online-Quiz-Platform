import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import "./Signup.css";


const Orb = ({ style }) => (
  <div style={{ position:"absolute", borderRadius:"50%", filter:"blur(90px)", pointerEvents:"none", zIndex:0, ...style }} />
);


const Particle = ({ delay, x, size, color }) => (
  <div style={{
    position:"absolute", left:`${x}%`, bottom:"-10px",
    width:`${size}px`, height:`${size}px`, borderRadius:"50%",
    background: color,
    animation:`lq-floatUp ${3.5+delay}s ease-in infinite`,
    animationDelay:`${delay}s`,
  }} />
);


const Signup = () => {

  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]         = useState("student");
  const navigate = useNavigate();

  
  const [mounted, setMounted]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);


  const handleSignup = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      const { error: insertError } = await supabase.from("users").insert([
        { id: data.user.id, name, email, role }
      ]);

      if (insertError) {
        alert(insertError.message);
      } else {
        alert("Signup successful!");

         navigate("/login");
        
      }
    }
  };

  const particles = Array.from({ length: 14 }, (_, i) => ({
    delay: i * 0.35,
    x: (i * 7.3) % 100,
    size: 3 + (i % 4) * 2.5,
    color: i % 3 === 0
      ? "rgba(56,189,248,0.45)"
      : i % 3 === 1
      ? "rgba(99,102,241,0.35)"
      : "rgba(236,72,153,0.3)",
  }));

  return (
    <div className="lq-page">

  
      <Orb style={{width:550,height:550,top:-180,right:-160,background:"rgba(14,165,233,.18)",animation:"lq-orbFloat 9s ease-in-out infinite"}}/>
      <Orb style={{width:420,height:420,bottom:-120,left:-120,background:"rgba(99,102,241,.2)",animation:"lq-orbFloat 11s ease-in-out infinite reverse"}}/>
      <Orb style={{width:300,height:300,top:"40%",left:"50%",background:"rgba(236,72,153,.12)",animation:"lq-orbFloat 13s ease-in-out infinite"}}/>


      <div className="lq-shoot" style={{width:120,top:"18%",animationDuration:"5s",animationDelay:"0s"}}/>
      <div className="lq-shoot" style={{width:90,top:"52%",animationDuration:"6s",animationDelay:"2.8s"}}/>
      <div className="lq-shoot" style={{width:140,top:"75%",animationDuration:"4.5s",animationDelay:"5.5s"}}/>

  
      <div className="lq-ficon" style={{top:"12%",left:"7%",animationDuration:"5s",animationDelay:"0s"}}>🧠</div>
      <div className="lq-ficon" style={{top:"20%",right:"9%",animationDuration:"6s",animationDelay:"1s"}}>⚡</div>
      <div className="lq-ficon" style={{bottom:"24%",left:"5%",animationDuration:"5.5s",animationDelay:"2s"}}>🎯</div>
      <div className="lq-ficon" style={{bottom:"17%",right:"7%",animationDuration:"4.8s",animationDelay:"1.5s"}}>✨</div>
      <div className="lq-ficon" style={{top:"55%",left:"3%",animationDuration:"7s",animationDelay:"3s"}}>📝</div>
      <div className="lq-ficon" style={{top:"35%",right:"4%",animationDuration:"5.2s",animationDelay:"2.5s"}}>🏆</div>

     
      {particles.map((p, i) => <Particle key={i} {...p} />)}

      
      <div className="lq-badge" style={{top:"10%",left:"50%",transform:"translateX(-50%)"}}>
        ✨ Join QuizForge Today
      </div>

      <div className="lq-layout">

  
        <div className="lq-robot-panel">
          <div className="lq-hi-bubble">👋 Hey! Ready to quiz?</div>

      
          <div className="lq-robot-wrap">
            <div className="lq-r-head">
              <div className="lq-r-antenna">
                <div className="lq-r-ball" />
              </div>
              <div className="lq-r-eyes">
                <div className="lq-r-eye" />
                <div className="lq-r-eye" style={{animationDelay:".12s"}} />
              </div>
              <div className="lq-r-mouth" />
            </div>
            <div className="lq-r-body">
              <div className="lq-r-chest" />
            </div>
            <div className="lq-r-arm-l" />
            <div className="lq-r-arm-r" />
          </div>

          <p className="lq-robot-sub">Your AI quiz companion 🤖</p>
        </div>

   
        <div className={`lq-card ${mounted ? "mounted" : ""}`}>
          <div className="lq-card-glow" />

          <div className="lq-logo">
            <div className="lq-logo-icon">🧠</div>
            <span className="lq-logo-text">QuizForge</span>
          </div>

  
          <div className="lq-robot-face">
            <div className="lq-rf-head">
              <div className="lq-rf-antenna">
                <div className="lq-rf-ball" />
              </div>
              <div className="lq-rf-eyes">
                <div className="lq-rf-eye" />
                <div className="lq-rf-eye" style={{animationDelay:".15s"}} />
              </div>
              <div className="lq-rf-mouth" />
            </div>
            <div className="lq-rf-bubble">Let's get you started! 🚀</div>
          </div>

          <h2 className="lq-heading">Create your account</h2>
          <p className="lq-sub">Join thousands of learners &amp; educators</p>

        
          <div className="lq-role-wrap">
            <button type="button" className={`lq-role-btn ${role === "student" ? "active" : ""}`} onClick={() => setRole("student")}>🎓 Student</button>
            <button type="button" className={`lq-role-btn ${role === "teacher" ? "active" : ""}`} onClick={() => setRole("teacher")}>📚 Teacher</button>
          </div>

          <form onSubmit={handleSignup} noValidate>

            <div className="lq-field">
              <label className="lq-label">Full Name</label>
              <div className="lq-input-wrap">
                <span className="lq-icon">👤</span>
                <input
                  className="lq-input"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="lq-field">
              <label className="lq-label">Email</label>
              <div className="lq-input-wrap">
                <span className="lq-icon">✉️</span>
                <input
                  className="lq-input"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="lq-field">
              <label className="lq-label">Password</label>
              <div className="lq-input-wrap">
                <span className="lq-icon">🔒</span>
                <input
                  type={showPass ? "text" : "password"}
                  className="lq-input"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{paddingRight:"40px"}}
                />
                <button type="button" className="lq-eye" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button className="lq-btn" type="submit" disabled={loading}>
              {loading
                ? <><span className="lq-spinner" />Creating account…</>
                : `Sign up as ${role === "student" ? "Student 🎓" : "Teacher 📚"}`
              }
            </button>

          </form>

          <div className="lq-divider"><span>or</span></div>

          <p className="lq-footer">
            Already have an account? <a href="/login">Login →</a>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Signup;