import { useEffect } from "react";

export default function Confetti({ fire }: { fire: boolean }) {
  useEffect(() => {
    if (!fire) return;
    const count = 80;
    const root = document.createElement("div");
    root.style.position = "fixed";
    root.style.inset = "0";
    root.style.pointerEvents = "none";
    root.style.zIndex = "9999";
    document.body.appendChild(root);

    const particles: HTMLDivElement[] = [];
    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.style.position = "absolute";
      p.style.width = "8px";
      p.style.height = "14px";
      p.style.background = `hsl(${Math.random()*360},80%,60%)`;
      p.style.left = Math.random()*100 + "%";
      p.style.top = "-10px";
      p.style.opacity = "0.9";
      p.style.transform = `rotate(${Math.random()*360}deg)`;
      root.appendChild(p);
      particles.push(p);

      const duration = 1500 + Math.random()*1200;
      const translateX = (Math.random()-0.5) * 200;
      const translateY = 120 + Math.random()*400;
      p.animate(
        [
          { transform: p.style.transform, opacity: 1, offset: 0 },
          { transform: `translate(${translateX}px, ${translateY}px) rotate(${Math.random()*720}deg)`, opacity: 0.9, offset: 0.7 },
          { transform: `translate(${translateX}px, ${translateY+80}px) rotate(${Math.random()*1080}deg)`, opacity: 0, offset: 1 }
        ],
        { duration, easing: "ease-out", fill: "forwards" }
      );
    }
    const t = setTimeout(()=>{ root.remove(); }, 2500);
    return () => { clearTimeout(t); root.remove(); };
  }, [fire]);
  return null;
}
