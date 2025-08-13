"use client";

import { useId } from "react";

type Props = {
  label: string;
  value: string;                 // hex like #1e90ff
  onChange: (val: string) => void;
};

export default function ColorPicker({ label, value, onChange }: Props) {
  const id = useId();

  function normalize(v: string) {
    const s = v.trim();
    return s.startsWith("#") ? s : `#${s}`;
  }

  return (
    <div className="form-row">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="color"
        value={value}
        onChange={(e) => onChange(normalize(e.target.value))}
        aria-label={`${label} color`}
      />
      <input
        className="hex"
        value={value}
        onChange={(e) => onChange(normalize(e.target.value))}
        aria-label={`${label} hex`}
      />
      <div className="swatch" style={{ background: value }} title={value} />
    </div>
  );
}
