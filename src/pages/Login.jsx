import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import "./Login.css";


const Orb = ({ style }) => (
  <div style={{ position:"absolute", borderRadius:"50%", filter:"blur(90px)", pointerEvents:"none", zIndex:0, ...style }} />
);


const Particle = ({ delay, x, size, color }) => (
  <div style={{
    position:"absolute", left:`${x}%`, bottom:"-10px",
    width:`${size}px`, height:`${size}px`, borderRadius:"50%",
    background: color || "rgba(56,189,248,0.4)",
    animation:`lq-floatUp ${3.5 + delay}s ease-in infinite`,
    animationDelay:`${delay}s`,
  }} />
);


const ShootingStar = ({ top, delay }) => (
  <div style={{
    position:"absolute", top:`${top}%`, left:"-10%",
    width:120, height:1.5,
    background:"linear-gradient(90deg, transparent, #7dd3fc, transparent)",
    animation:`lq-shoot 4s ease-in infinite`,
    animationDelay:`${delay}s`,
    zIndex:1,
  }} />
);


const FloatingIcon = ({ icon, style }) => (
  <div style={{
    position:"absolute", fontSize:"1.4rem",
    animation:"lq-iconFloat 5s ease-in-out infinite",
    zIndex:2, opacity:0.18,
    ...style,
  }}>
    {icon}
  </div>
);




const Login = () => {

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();


  const [mounted, setMounted]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

 
  const handleLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert(error.message);
    } else {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();
      if (userError) {
        alert(userError.message);
      } else {
        if (userData.role === "student") navigate("/student");
        else navigate("/teacher");
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
      ? "rgba(139,92,246,0.35)"
      : "rgba(236,72,153,0.3)",
  }));

  return (
    <div className="lq-page">

   
      <Orb style={{width:550,height:550,top:-180,right:-160,background:"rgba(14,165,233,.18)",animation:"lq-orbFloat 9s ease-in-out infinite"}}/>
      <Orb style={{width:420,height:420,bottom:-120,left:-120,background:"rgba(124,58,237,.2)",animation:"lq-orbFloat 11s ease-in-out infinite reverse"}}/>
      <Orb style={{width:300,height:300,top:"40%",left:"50%",background:"rgba(236,72,153,.12)",animation:"lq-orbFloat 13s ease-in-out infinite"}}/>

    
      <ShootingStar top={18} delay={0} />
      <ShootingStar top={42} delay={2.5} />
      <ShootingStar top={68} delay={5} />

 
      <FloatingIcon icon="🧠" style={{top:"12%", left:"8%", animationDelay:"0s"}} />
      <FloatingIcon icon="⚡" style={{top:"20%", right:"10%", animationDelay:"1s"}} />
      <FloatingIcon icon="🎯" style={{bottom:"25%", left:"6%", animationDelay:"2s"}} />
      <FloatingIcon icon="✨" style={{bottom:"18%", right:"8%", animationDelay:"1.5s"}} />
      <FloatingIcon icon="📊" style={{top:"55%", left:"4%", animationDelay:"3s"}} />
      <FloatingIcon icon="🏆" style={{top:"35%", right:"5%", animationDelay:"2.5s"}} />

    
      {particles.map((p, i) => <Particle key={i} {...p} />)}

      
      <div className="lq-badge" style={{top:"10%", left:"50%", transform:"translateX(-50%)", animationDelay:"0s"}}>
        🔐 Secure Login
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
          <div className="lq-rf-bubble">Welcome back! 👋</div>
        </div>

        <h2 className="lq-heading">Login to continue</h2>
        <p className="lq-sub">Enter your credentials to access your dashboard</p>

      
        <form onSubmit={handleLogin} noValidate>

          <div className="lq-field">
            <label className="lq-label">Email Address</label>
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
              <button
                type="button"
                className="lq-eye"
                onClick={() => setShowPass(!showPass)}
                tabIndex={-1}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="lq-forgot">
            <a href="/forgot-password">Forgot password?</a>
          </div>

          <button className="lq-btn" type="submit" disabled={loading}>
            {loading
              ? <><span className="lq-spinner" />Signing in…</>
              : "Login 🚀"
            }
          </button>

        </form>

       
        <div className="lq-divider">
          <span>or</span>
        </div>

        <p className="lq-footer">
          Don't have an account? <a href="/signup">Sign up →</a>
        </p>

      </div>
    </div>
  );
};

export default Login;
