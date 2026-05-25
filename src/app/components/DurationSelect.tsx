import { DIET_DURATION_OPTIONS } from '../lib/duration';

export function DurationSelect({
  value,
  onChange,
  className = '',
}: {
  value: number;
  onChange: (days: number) => void;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`w-full px-4 py-2 border border-border rounded-lg bg-white ${className}`}
      aria-label="Liczba dni diety"
    >
      {DIET_DURATION_OPTIONS.map((days) => (
        <option key={days} value={days}>
          {days} dni
        </option>
      ))}
    </select>
  );
}
