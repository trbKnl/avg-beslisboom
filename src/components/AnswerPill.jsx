export default function AnswerPill({ label }) {
  return (
    <span
      className="inline-block rounded-full px-3 py-1 text-sm text-white"
      style={{
        backgroundColor: 'var(--color-primary)',
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}
