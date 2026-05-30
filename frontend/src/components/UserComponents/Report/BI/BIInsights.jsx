import { Check, AlertCircle, AlertTriangle, MinusCircle } from 'lucide-react';

const insightConfig = {
  positive: {
    bg: "#EAF3DE", border: "#C0DD97", text: "#27500A",
    Icon: () => <Check size={16} color="#3B6D11" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />,
  },
  negative: {
    bg: "#FCEBEB", border: "#F7C1C1", text: "#791F1F",
    Icon: () => <AlertCircle size={16} color="#A32D2D" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />,
  },
  warning: {
    bg: "#FAEEDA", border: "#FAC775", text: "#633806",
    Icon: () => <AlertTriangle size={16} color="#854F0B" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />,
  },
  neutral: {
    bg: "#F1EFE8", border: "#D3D1C7", text: "#444441",
    Icon: () => <MinusCircle size={16} color="#5F5E5A" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />,
  },
};

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
              <span>{insight.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}