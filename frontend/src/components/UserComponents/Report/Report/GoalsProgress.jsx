export default function GoalsProgress({ goalsWidget, locale }) {
  if (!goalsWidget || goalsWidget.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-5">
      <h2 className="font-bold text-sm text-rose-900 mb-4">
        Progression des objectifs
      </h2>

      <div className="flex flex-col gap-4">
        {goalsWidget.map((goal) => (
          <div key={goal._id}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{goal.icon}</span>
                <span className="text-xs font-bold text-rose-900">
                  {goal.name}
                </span>

                {goal.isUrgent && (
                  <span className="text-[10px] px-2 py-0.5 bg-red-50 text-red-400 rounded-full font-bold">
                    🔥 Urgent
                  </span>
                )}
              </div>

              <span className="text-xs text-pink-400">
                {goal.currentAmount.toLocaleString(locale)} / {goal.targetAmount.toLocaleString(locale)} DT
              </span>
            </div>

            <div className="h-2.5 bg-pink-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${goal.percent}%`,
                  backgroundColor: goal.isUrgent ? "#f87171" : "#D7A4A6",
                }}
              />
            </div>

            <div className="flex justify-between text-[10px] mt-1">
              <span
                className="font-bold"
                style={{
                  color: goal.isUrgent ? "#f87171" : "#D7A4A6",
                }}
              >
                {goal.percent}%
              </span>

              {goal.joursRestants !== null && (
                <span className={goal.isUrgent ? "text-red-400 font-bold" : "text-pink-300"}>
                  {goal.joursRestants === 0
                    ? "⚠️ Échéance aujourd'hui !"
                    : `${goal.joursRestants} jours restants`}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {goalsWidget.some((g) => g.isUrgent) && (
        <p className="text-xs text-red-400 mt-4 bg-red-50 px-3 py-2 rounded-xl">
          🔥 Un ou plusieurs objectifs arrivent à échéance dans moins de 30 jours
        </p>
      )}

      {goalsWidget.every((g) => !g.isUrgent) && (
        <p className="text-xs text-emerald-500 mt-4 bg-emerald-50 px-3 py-2 rounded-xl">
          ✅ Tous vos objectifs sont dans les délais
        </p>
      )}
    </div>
  );
}