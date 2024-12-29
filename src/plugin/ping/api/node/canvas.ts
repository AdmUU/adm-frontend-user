type DataSet = {
  [key: string]: number;
};
type CanvasElementSet = {
  [key: string]: HTMLCanvasElement;
};
export const pingChartWidth = 200;
export const pingChartHeight = 30;
export const pingChartCanvas: CanvasElementSet = {};
const pingChartDataCount: DataSet = {};
const pingChartLineCount = 100;
const pingChartLineWidth = Math.floor(pingChartWidth / pingChartLineCount);

/**
 * Get line color by delay
 * @param delay
 * @returns
 */
const getLineColor: (delay: number) => string = (delay) => {
  let selectedColor;
  if (delay === 0) {
    selectedColor = '#ff0000';
  } else if (delay < 350) {
    selectedColor = '#009000';
  } else {
    selectedColor = '#f0a030';
  }
  return selectedColor;
};

/**
 * Get line y by delay
 * @param delay
 * @returns
 */
const getLineY: (delay: number) => number = (delay) => {
  let y;
  if (delay === 0 || delay > 300) {
    y = 0;
  } else {
    y = pingChartHeight - Math.ceil(delay / 10);
  }
  return y;
};

/**
 * Init canvas
 * @param canvas
 * @param id
 * @param delay
 * @returns
 */
export const initCanvas = (canvas: Element, id: string, delay: number) => {
  const ctx = (canvas as HTMLCanvasElement).getContext('2d');
  if (!ctx) return;

  if (delay < 0) {
    pingChartDataCount[id] = 0;
    pingChartCanvas[id] = canvas as HTMLCanvasElement;
    return;
  }
  ctx.beginPath();
  ctx.strokeStyle = getLineColor(delay);
  ctx.lineWidth = pingChartLineWidth;
  const x = pingChartDataCount[id] * pingChartLineWidth;
  const y = getLineY(delay);
  ctx.moveTo(x, y);
  ctx.lineTo(x, (canvas as HTMLCanvasElement).height);
  ctx.stroke();
  pingChartDataCount[id] += 1;
};
