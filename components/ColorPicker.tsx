"use client";
import { useId } from "react";

type Props = {
  label: string;
  value: string;                 // hex
  onChange: (val: string) => void;
};

export default function ColorPicker({ label, value, onChange }: Props) {
  const id = useId();
  const onHex = (raw: string) => {
    const v = raw.trim();
    // normalize like "#abc" -> "#aabbcc" if desired; for now pass through
    onChange(v.startsWith("#") ? v : `#${v}`);
  };

  return (
    <div className="row" style={{ alignItems: "center" }}>
      <label htmlFor={id} style={{ minWidth: 80 }}>{label}</label>
      <input id={id} type="color" value={value} onChange={(e) => onHex(e.target.value)} />
      <input
        value={value}
        onChange={(e) => onHex(e.target.value)}
        style={{ width: 110 }}
        aria-label={`${label} hex`}
      />
      {/* live swatch mirrors current state */}
      <div className="swatch" style={{ background: value }} title={value} />
    </div>
  );
}
