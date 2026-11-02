import { cn } from '@/shared/lib/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  label?: string;
}

export function Toggle({ checked, onChange, disabled = false, id, label }: ToggleProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'inline-flex items-center gap-3 cursor-pointer select-none',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          className="sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={cn(
            'w-12 h-7 rounded-full transition-colors duration-200 ease-in-out',
            checked ? 'bg-aqua-500 shadow-inner' : 'bg-slate-200'
          )}
        />
        <div
          className={cn(
            'absolute left-1 top-1 bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-200 ease-in-out',
            checked ? 'transform translate-x-5' : 'transform translate-x-0'
          )}
        />
      </div>
      {label ? <span className="text-sm font-medium text-slate-700">{label}</span> : null}
    </label>
  );
}
