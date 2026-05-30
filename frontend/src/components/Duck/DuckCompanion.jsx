import { useEffect, useState } from "react";

const REACTION_VIDEOS = {
  overspend:         "/assets/duck/reactions/overspend.mp4",
  welcome:           "/assets/duck/reactions/welcome.mp4",
  goal_contribution: "/assets/duck/reactions/goal_contribution.mp4",
  goal_achieved:     "/assets/duck/reactions/goal_achieved.mp4",
  levelup:           "/assets/duck/reactions/levelup.mp4",
  leveldown:         "/assets/duck/reactions/leveldown.mp4",
};

const STATE_VIDEOS = {
  0: "/assets/duck/states/state-0.mp4",
  1: "/assets/duck/states/state-1.mp4",
  2: "/assets/duck/states/state-2.mp4",
  3: "/assets/duck/states/state-3.mp4",
  4: "/assets/duck/states/state-4.mp4",
  5: "/assets/duck/states/state-5.mp4",
};

//Couleurs par état
const STATE_COLORS = {
  0: "#888780",
  1: "#D85A30",
  2: "#EF9F27",
  3: "#1D9E75",
  4: "#534AB7",
  5: "#D4537E",
};

const NEXT_STATE_NAMES = {
  0: "Fragile",
  1: "Stable",
  2: "Équilibré",
  3: "Épanoui",
  4: "Légendaire",
  5: "—",
};

const OVERLAY_REACTIONS = new Set([
  "levelup", "leveldown", "welcome", "overspend", "goal_achieved",
]);
//ComposantPrincipal
export default function DuckCompanion({ duck }) {
  const { data, activeReaction, activeMsg, closeModal, openModal } = duck;
  // "idle" | "bubble" | "overlay" | "stats"
  const [mode, setMode]=useState("idle");

  const stateId=data?.companionStateId ?? 0;
  const color=STATE_COLORS[stateId] ?? "#888780";
  const idleVideo=STATE_VIDEOS[stateId] ?? STATE_VIDEOS[0];
  //Réagir aux changements de réaction
  useEffect(() => {
    if (!activeReaction) {//arrive closemodal remet activeReaction à null
      //ne pas écraser "stats" si l'utilisateur a ouvert le popup manuellement
      setMode((prev) => prev === "stats" ? "stats" : "idle");
      return;
    }
    setMode(OVERLAY_REACTIONS.has(activeReaction) ? "overlay" : "bubble");
  }, [activeReaction]);

  //fonction fléchée pour gérer la fin des vidéos de réaction
  const handleBubbleEnd  = () => setMode("idle");
  const handleOverlayEnd = () => { setMode("idle");
                                   closeModal(); 
                                  };
  //Clic sur le duck idle = ouvre les stats
  const handleIdleClick = () => {
    openModal(); //signale à useDuck que le modal est ouvert
    setMode("stats");
  };

  const handleStatsClose = () => {
    closeModal();
    setMode("idle");
  };

  //MODE IDLE

  if (mode === "idle") {
    return (
      <div
        onClick={handleIdleClick}
        style={{
          position:"fixed",
          bottom:"20px",
          right:"20px",
          width:"100px",
          height:"100px",
          zIndex:50,
          cursor:"pointer",
          borderRadius:"50%",
          overflow:"hidden",
          background:"#ffffff",
          boxShadow:"0 2px 12px rgba(0,0,0,0.10)",
        }}
      >
        <video key={idleVideo} src={idleVideo} autoPlay loop muted playsInline
          style={{ width:"100%", height:"100%", objectFit:"cover", mixBlendMode:"multiply", display:"block" }} />
      </div>
    );
  }

  // MODE BUBBLE — bulle discrète, coin bas-droite (goal_contribution)

  if (mode === "bubble") {
    return (
      <div style={{
        position:"fixed", bottom:"20px", right:"20px", zIndex:100,
        display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"8px",
        pointerEvents:"none",
      }}>
        {activeMsg && (
          <div style={{
            background:"#ffffff", border:"0.5px solid #fce7f3", borderRadius:"14px",
            padding:"8px 14px", fontSize:"13px", maxWidth:"210px",
            color:"#374151", boxShadow:"0 2px 10px rgba(0,0,0,0.08)", lineHeight:1.5,
          }}>
            {activeMsg}
          </div>
        )}
        <div style={{
          width:"100px", height:"100px", borderRadius:"50%",
          overflow:"hidden", background:"#ffffff", boxShadow:"0 2px 12px rgba(0,0,0,0.10)",
        }}>
          <video key={activeReaction} src={REACTION_VIDEOS[activeReaction]}
            autoPlay playsInline
            style={{ width:"100%", height:"100%", objectFit:"cover", mixBlendMode:"multiply", display:"block" }}
            onEnded={handleBubbleEnd} />
        </div>
      </div>
    );
  }
  // MODE OVERLAY — plein écran, réaction importante
  if (mode === "overlay") {
    return (
      <div onClick={handleOverlayEnd} style={{
        position:"fixed", inset:0, zIndex:200,
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        gap:"20px", background:"rgba(0,0,0,0.45)", cursor:"pointer", overflow:"hidden",
      }}>
        <div style={{
          width:"260px", height:"260px", borderRadius:"50%",
          overflow:"hidden", background:"#ffffff",
          boxShadow:"0 8px 40px rgba(0,0,0,0.18)", flexShrink:0,
        }}>
          <video key={activeReaction} src={REACTION_VIDEOS[activeReaction]}
            autoPlay playsInline
            style={{ width:"100%", height:"100%", objectFit:"cover", mixBlendMode:"multiply", display:"block" }}
            onEnded={handleOverlayEnd} />
        </div>

        {activeMsg && (
          <div style={{
            background:"#ffffff", borderRadius:"18px", padding:"14px 22px",
            fontSize:"15px", fontWeight:600, color:"#111827",
            maxWidth:"300px", textAlign:"center",
            boxShadow:"0 4px 24px rgba(0,0,0,0.12)", lineHeight:1.5,
          }}>
            {activeMsg}
          </div>
        )}

        <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.55)", marginTop:"4px" }}>
          Appuie pour continuer
        </p>
      </div>
    );
  }

  
  // MODE STATS — popup clic manuel 

  if (mode === "stats" && data) {
    return (
      <div
        onClick={(e) => { 
          if (e.target === e.currentTarget) //e.currentTarget = élément qui possède le onClick
            handleStatsClose(); 
          }}
        style={{
          position:"fixed", inset:0, zIndex:200,
          display:"flex", alignItems:"center", justifyContent:"center",
          background:"rgba(0,0,0,0.45)",
        }}
      >
        <div style={{
          position:"relative", width:"300px", borderRadius:"20px",
          background:"var(--color-background-primary,#fff)",
          padding:"28px 24px 20px",
          boxShadow:"0 8px 40px rgba(0,0,0,0.18)",
        }}>
          {/* Fermer */}
          <button 
            onClick={handleStatsClose} 
            style={{
              position:"absolute", top:"12px", right:"12px",
              width:"28px", height:"28px", borderRadius:"50%", border:"none",
              background:"var(--color-background-secondary,#f5f4ef)",
              color:"var(--color-text-secondary,#666)",
              fontSize:"13px", cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>✕</button>

          <div style={{
            display:"flex", justifyContent:"center", marginBottom:"10px",
          }}>
            <div style={{
              width:"110px", height:"110px", borderRadius:"50%",
              overflow:"hidden", background:"#ffffff",
              boxShadow:"0 2px 12px rgba(0,0,0,0.08)",
            }}>
              <video key={`stats-${stateId}`} src={idleVideo}
                autoPlay loop muted playsInline
                style={{ width:"100%", height:"100%", objectFit:"cover", mixBlendMode:"multiply", display:"block" }} />
            </div>
          </div>

          <div style={{
            marginBottom:"16px",
            background:"var(--color-background-secondary,#f5f4ef)",
            borderRadius:"4px 12px 12px 12px",
            padding:"11px 14px",
            fontSize:"13px", lineHeight:1.6,
            color:"var(--color-text-secondary,#555)",
          }}>
            {data.message}
          </div>

          <div style={{ display:"flex", justifyContent:"center", gap:"8px", marginBottom:"14px" }}>
            {[0,1,2,3,4].map((i) => (
              <span key={i} style={{ fontSize:"22px" }}>
                {i < data.hearts ? "🩷" : "🤍"}
              </span>
            ))}
          </div>

          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
            <span style={{ fontSize:"11px", color:"var(--color-text-tertiary,#999)" }}>
              Progression vers {NEXT_STATE_NAMES[stateId]}
            </span>
            <span style={{ fontSize:"11px", fontWeight:500 }}>{data.progressToNext}%</span>
          </div>
          <div style={{
            height:"4px", borderRadius:"2px", overflow:"hidden",
            background:"var(--color-border-tertiary,rgba(0,0,0,.08))",
            marginBottom:"16px",
          }}>
            <div style={{
              height:"100%", borderRadius:"2px",
              width:`${data.progressToNext}%`,
              background: color,
              transition:"width 600ms ease-in-out",
            }} />
          </div>

          <div style={{ borderTop:"0.5px solid var(--color-border-tertiary,rgba(0,0,0,.08))" }}>
            {[
              ["État",data.stateName],
              ["Streak",`${data.streak} mois consécutifs`],
              ["Total cœurs gagnés", `${data.totalHearts}`],
              ["Mois évalué",data.evaluatedMonth ?? "—"],
            ].map(([label, value]) => (
              <div key={label} style={{
                display:"flex", justifyContent:"space-between",
                padding:"9px 0",
                borderTop:"0.5px solid var(--color-border-tertiary,rgba(0,0,0,.07))",
              }}>
                <span style={{ fontSize:"12px", color:"var(--color-text-secondary,#888)" }}>{label}</span>
                <span style={{ fontSize:"12px", fontWeight:500 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}