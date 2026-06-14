type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: Props) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search songs..."
      className="
        w-full
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        p-4
        outline-none
      "
    />
  );
}
