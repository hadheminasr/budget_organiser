export default function DashGoalsProgress({ goals = [], locale }) {
  if (!goals.length) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-[13px] font-medium text-gray-900 mb-1">Progression des objectifs</p>
      <p className="text-[11px] text-gray-400 mb-4">Avancement et délai estimé au rythme actuel</p>

      <div className="flex flex-col gap-4">
        {goals.map((goal) => {
          const pct          = Math.min(100, Math.round(((goal.currentAmount ?? 0) / goal.targetAmount) * 100));
          const remainingAmt = goal.targetAmount - (goal.currentAmount ?? 0);
          const isUrgent     = goal.joursRestants != null && goal.joursRestants <= 30;
          const barColor     = pct >= 75 ? "#1D9E75" : pct >= 40 ? "#378ADD" : "#EF9F27";

          return (
            <div key={goal._id}>
              <div className="flex justify-between items-baseline mb-1.5 text-[12px]">
                <span className="font-medium text-gray-900">
                  {goal.icon} {goal.name}
                </span>
                <span className="text-gray-400">
                  {(goal.currentAmount ?? 0).toLocaleString(locale)} /{" "}
                  {goal.targetAmount.toLocaleString(locale)} DT
                </span>
              </div>

              <div className="h-[5px] bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: barColor }}
                />
              </div>

              <div className="flex justify-between items-center mt-1.5 text-[10px] text-gray-400">
                <span>
                  {pct}%
                  {goal.joursRestants != null && ` · ${goal.joursRestants} j restants`}
                </span>
                <span className="flex items-center gap-1.5">
                  {isUrgent && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#FCEBEB] border border-[#F7C1C1] text-[#791F1F] text-[10px]">
                      Échéance proche
                    </span>
                  )}
                  <span>Reste {remainingAmt.toLocaleString(locale)} DT</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}