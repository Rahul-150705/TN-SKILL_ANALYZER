export default function SkillBadge({ skill, variant = 'default' }) {
  let colorClass = 'bg-slate-700 text-slate-300';
  if (variant === 'success') colorClass = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
  if (variant === 'danger' || variant === 'missing') colorClass = 'bg-red-500/20 text-red-400 border border-red-500/30';
  if (variant === 'match' || variant === 'matched') colorClass = 'bg-teal-500/20 text-teal-400 border border-teal-500/30';
  if (variant === 'partial') colorClass = 'bg-amber-500/20 text-amber-400 border border-amber-500/30';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {skill}
    </span>
  );
}