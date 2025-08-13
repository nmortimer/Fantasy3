export function titleCase(s: string){return s.replace(/\w\S*/g,w=>w[0].toUpperCase()+w.slice(1).toLowerCase())}
export function clean(s:string){return s.replace(/[^\w\s-]/g," ").replace(/\s+/g," ").trim()}
export function singularize(word:string){
  const w=word.toLowerCase();
  if(w.endsWith("ies")) return word.slice(0,-3)+"y";
  if(w.endsWith("ves")) return word.slice(0,-3)+"f";
  if(w.endsWith("xes")) return word.slice(0,-2);
  if(w.endsWith("s")&&!w.endsWith("ss")) return word.slice(0,-1);
  return word;
}
export function mascotFromTeam(teamName:string){
  const t=clean(teamName).toLowerCase();
  const stop=new Set(["the","team","club","fc","sc","cf","afc","of","and","league","nations"]);
  const toks=t.split(/\s+/).filter(Boolean).filter(x=>!stop.has(x)&&!/^\d+$/.test(x));
  const pick=toks.length?toks[toks.length-1]:(toks[0]||"Mascot");
  return titleCase(singularize(pick));
}
export function hash(s:string){return [...s].reduce((a,c)=>(a+c.charCodeAt(0))>>>0,0)}

const BANK:Record<string,{primary:string;secondary:string}[]>={
  fox:[{primary:"#ff6b00",secondary:"#222"},{primary:"#ffa94d",secondary:"#1a1a1a"}],
  wolf:[{primary:"#626b73",secondary:"#cdd2d6"},{primary:"#4a5568",secondary:"#cbd5e0"}],
  eagle:[{primary:"#002244",secondary:"#c60c30"},{primary:"#0b3d91",secondary:"#e6e6e6"}],
  bear:[{primary:"#4b2e2b",secondary:"#d1b271"},{primary:"#5e3b2e",secondary:"#f0d190"}],
  shark:[{primary:"#0a3d62",secondary:"#60a3bc"},{primary:"#0f4c5c",secondary:"#b1d4e0"}],
  lion:[{primary:"#f4c542",secondary:"#8b4513"},{primary:"#d4a017",secondary:"#5a3815"}],
  tiger:[{primary:"#ff6600",secondary:"#000"},{primary:"#ff7a00",secondary:"#1a1a1a"}],
  dragon:[{primary:"#006400",secondary:"#8b0000"},{primary:"#0b6b3a",secondary:"#7a1e1e"}],
  stallion:[{primary:"#222",secondary:"#ccc"},{primary:"#2b2b2b",secondary:"#e5e7eb"}]
};
const POOL=[{primary:"#ff6b6b",secondary:"#1a1a1a"},{primary:"#1e90ff",secondary:"#f8f8ff"},
{primary:"#2ecc71",secondary:"#145a32"},{primary:"#e67e22",secondary:"#1a1a1a"},
{primary:"#9b59b6",secondary:"#2c3e50"},{primary:"#f1c40f",secondary:"#1a1a1a"},
{primary:"#e74c3c",secondary:"#1a1a1a"}];

export function colorsFor(teamName:string, mascotInput:string){
  const key=(mascotInput||teamName).toLowerCase();
  const bankKey=Object.keys(BANK).find(k=>key.includes(k));
  const bank=bankKey?BANK[bankKey]:POOL;
  return bank[hash(teamName+"|"+key)%bank.length];
}
