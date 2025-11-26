export default function Chip({ color, text }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${color}`}
    >
      {text}
    </span>
  );
}
