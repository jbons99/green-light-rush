const LINE_COLORS = [
  "#bbff2c",
  "#63bde0",
  "#efbe58",
  "#ef6d6d",
  "#a984ff"
];

export function resizeCanvas(canvas, container) {
  const rect = container.getBoundingClientRect();
  canvas.width = rect.width - 20;
  canvas.height = rect.height - 20;
}

export function clearCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function getCellCenter(canvas, row, col) {
  const cellWidth = canvas.width / 5;
  const cellHeight = canvas.height / 5;
  return {
    x: col * cellWidth + cellWidth / 2,
    y: row * cellHeight + cellHeight / 2
  };
}

export function flashPaylines(canvas, winningLines, duration = 320) {
  const ctx = canvas.getContext("2d");
  clearCanvas(canvas);

  winningLines.forEach((line, index) => {
    ctx.beginPath();
    ctx.strokeStyle = LINE_COLORS[index % LINE_COLORS.length];
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.shadowBlur = 12;
    ctx.shadowColor = ctx.strokeStyle;

    line.rows.forEach((row, col) => {
      const point = getCellCenter(canvas, row, col);
      if (col === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });

    ctx.stroke();
  });

  setTimeout(() => clearCanvas(canvas), duration);
}