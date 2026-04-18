// BIInsights.jsx
// Constats analytiques automatiques — pas du coaching, des faits
// Props: insights = [{ type: 'positive'|'negative'|'warning'|'neutral', text }]

const insightConfig = {
  positive: {
    bg: "#EAF3DE", border: "#C0DD97", text: "#27500A",
    Icon: () => (
      <svg style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} viewBox="0 0 16 16" fill="none">
        <path d="M3 8l4 4 6-7" stroke="#3B6D11" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  negative: {
    bg: "#FCEBEB", border: "#F7C1C1", text: "#791F1F",
    Icon: () => (
      <svg style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="#A32D2D" strokeWidth="1.2" />
        <line x1="8" y1="5" x2="8" y2="9" stroke="#A32D2D" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="11.5" r=".8" fill="#A32D2D" />
      </svg>
    ),
  },
  warning: {
    bg: "#FAEEDA", border: "#FAC775", text: "#633806",
    Icon: () => (
      <svg style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} viewBox="0 0 16 16" fill="none">
        <path d="M8 2.5L14 13H2L8 2.5Z" stroke="#854F0B" strokeWidth="1.2" strokeLinejoin="round" />
        <line x1="8" y1="7" x2="8" y2="10" stroke="#854F0B" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="8" cy="11.5" r=".7" fill="#854F0B" />
      </svg>
    ),
  },
  neutral: {
    bg: "#F1EFE8", border: "#D3D1C7", text: "#444441",
    Icon: () => (
      <svg style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="#5F5E5A" strokeWidth="1.2" />
        <line x1="5.5" y1="8" x2="10.5" y2="8" stroke="#5F5E5A" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
};

// Highlight les valeurs en gras dans le texte — ex: "**14.2%**" → <strong>14.2%</strong>
function InsightText({ text }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? <strong key={i}>{p}</strong> : p
      )}
    </>
  );
}

export default function BIInsights({ insights = [] }) {
  if (!insights.length) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="mb-4">
        <h3 className="text-[14px] font-medium text-gray-900">Insights analytiques</h3>
        <p className="text-[11px] text-gray-400 mt-0.5">
          Constats détectés automatiquement depuis les données du mois
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {insights.map((insight, i) => {
          const cfg = insightConfig[insight.type] || insightConfig.neutral;
          return (
            <div
              key={i}
              className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg border text-[12px] leading-relaxed"
              style={{
                background: cfg.bg,
                borderColor: cfg.border,
                color: cfg.text,
              }}
            >
              <cfg.Icon />
              <InsightText text={insight.text} />
            </div>
          );
        })}
      </div>
    </div>
  );
}