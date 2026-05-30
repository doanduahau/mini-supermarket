export function Badge({ children, color = 'gray' }: any) {
  const colors: Record<string, string> = {
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
}
