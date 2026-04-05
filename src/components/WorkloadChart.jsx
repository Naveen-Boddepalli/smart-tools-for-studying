import React, { useEffect, useRef } from "react";
import { getWeeklyWorkload } from "../utils/studyTimeCalculator";

export default function WorkloadChart({ assignments, darkMode }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const data = getWeeklyWorkload(assignments);
    const max = Math.max(...data.map((d) => d.hours), 4);

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, W, H);

    const padL = 32, padR = 16, padT = 16, padB = 36;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;
    const barW = (chartW / data.length) * 0.5;
    const gap = chartW / data.length;

    const textColor = darkMode ? "#9ca3af" : "#6b7280";
    const gridColor = darkMode ? "#374151" : "#f3f4f6";

    // Grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padT + chartH - (chartH * i) / 4;
      ctx.beginPath();
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.moveTo(padL, y);
      ctx.lineTo(W - padR, y);
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.font = "11px DM Sans, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`${(max * i / 4).toFixed(0)}h`, padL - 4, y + 4);
    }

    // Bars
    data.forEach((d, i) => {
      const x = padL + i * gap + gap / 2 - barW / 2;
      const barH = (d.hours / max) * chartH;
      const y = padT + chartH - barH;

      const grad = ctx.createLinearGradient(0, y, 0, y + barH);
      const isHigh = d.hours >= 3;
      if (isHigh) {
        grad.addColorStop(0, "#f97316");
        grad.addColorStop(1, "#fde68a");
      } else if (d.hours > 0) {
        grad.addColorStop(0, "#6366f1");
        grad.addColorStop(1, "#c7d2fe");
      } else {
        grad.addColorStop(0, gridColor);
        grad.addColorStop(1, gridColor);
      }

      ctx.beginPath();
      ctx.fillStyle = grad;
      const r = Math.min(6, barW / 2);
      ctx.roundRect(x, y, barW, barH, [r, r, 0, 0]);
      ctx.fill();

      // Day label
      ctx.fillStyle = textColor;
      ctx.font = "12px DM Sans, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(d.day, padL + i * gap + gap / 2, H - 8);

      // Hours label on bar
      if (d.hours > 0) {
        ctx.fillStyle = isHigh ? "#7c2d12" : "#3730a3";
        ctx.font = "500 11px DM Sans, sans-serif";
        ctx.fillText(`${d.hours}h`, padL + i * gap + gap / 2, y - 4);
      }
    });
  }, [assignments, darkMode]);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <span>📈</span>
        <span>Weekly Workload</span>
      </div>
      <canvas ref={canvasRef} style={{ width: "100%", height: "180px", display: "block" }} />
    </div>
  );
}
