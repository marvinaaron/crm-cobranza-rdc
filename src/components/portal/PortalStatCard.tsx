type Props = {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  bg?: string;
};

export default function PortalStatCard({
  label,
  value,
  sub,
  color = "text-slate-800",
  bg = "bg-white border-slate-100",
}: Props) {
  const esBlanca = bg.includes("bg-white");
  return (
    <div
      className={`${esBlanca ? "rdc-card dark:bg-slate-900" : ""} p-5 sm:p-6 rounded-2xl ${bg}`}
    >
      <p className="text-[13px] font-semibold text-slate-500 mb-2">
        {label}
      </p>
      <p className={`text-2xl sm:text-3xl font-bold tabular-nums leading-none ${color}`}>
        {value}
      </p>
      {sub && (
        <p className="text-[10px] font-bold text-slate-400 mt-2 leading-snug">{sub}</p>
      )}
    </div>
  );
}
