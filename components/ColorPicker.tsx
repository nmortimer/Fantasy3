"use client";
import { useId } from "react";

type Props = {
  label: string;
  value: string;
  onChange: (val: string) => void;
};

export default function ColorPicker({ label, value, onChange }: Props) {
  const id = useId();
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <label htmlFor={id} style={{ opacity: 0.75 }}>{label}</label>
      <input id={id} type="color" value={value} onChange={(e) => onChange(e.target.value)} />
      <input style={{ width: 110 }} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
