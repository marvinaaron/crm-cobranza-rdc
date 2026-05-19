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
  return (
    <div className={`p-5 sm:p-7 rounded-[2rem] border shadow-sm ${bg}`}>
      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">
        {label}
      </p>
      <p className={`text-2xl sm:text-3xl font-black tabular-nums leading-none ${color}`}>
        {value}
      </p>
      {sub && (
        <p className="text-[10px] font-bold text-slate-400 mt-2 leading-snug">{sub}</p>
      )}
    </div>
  );
}
