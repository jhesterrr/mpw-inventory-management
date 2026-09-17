import { cn } from '@/utils';

interface Props {
  code: string;
  height?: number;
  showText?: boolean;
}

function hashChar(c: string) {
  return c.charCodeAt(0) % 7;
}

export default function BarcodeDisplay({ code, height = 36, showText = true }: Props) {
  const bars = [...code].map((ch, idx) => {
    const w = (hashChar(ch) % 3) + 1;
    const dark = (idx + hashChar(ch)) % 2 === 0;
    return { w, dark, key: `${idx}-${ch}` };
  });
  return (
    <div className="flex flex-col items-start gap-1">
      <div
        className="flex items-center gap-[1px] bg-white p-1 rounded border surface-border"
        style={{ height }}
        aria-label={`Barcode ${code}`}
      >
        {bars.map(b => (
          <div
            key={b.key}
            style={{ width: `${b.w}px`, height: '100%' }}
            className={cn(b.dark ? 'bg-neutral-900' : 'bg-neutral-200', 'rounded-[1px]')}
          />
        ))}
      </div>
      {showText && (
        <span className="font-mono text-[10px] tracking-wider text-muted">{code}</span>
      )}
    </div>
  );
}
