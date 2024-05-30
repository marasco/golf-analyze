import { useRef } from "react";
import { Stage } from "react-konva";

import { useWindowSize } from "rooks";
import useCanvasEvents from "@hooks/useCanvasEvents";

import Shapes from "./Shapes";

const Canvas = () => {
  const stageRef = useRef(null);

  const { innerHeight, innerWidth } = useWindowSize();
  const canvasEvents = useCanvasEvents();
  const initialCanvasWidthRef = useRef<number>(innerWidth ?? 0);

  const width = innerWidth ?? 0;
  const height = innerHeight ?? 0;

  const scale = width / initialCanvasWidthRef.current;
  const exportCanvas = () => {
    if (stageRef.current) {
      const dataUrl = (stageRef.current as any).toDataURL(); // Add type assertion here
      const link = document.createElement('a');
      link.download = 'canvas.png';
      link.href = dataUrl; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  return (
    <div>
      <div>
      <button type="button" onClick={exportCanvas} className="btn-action">Export</button>
    </div>
    <Stage
      ref={stageRef}
      {...canvasEvents}
      width={width}
      height={height}
      className="absolute inset-0"
      scaleX={scale}
      scaleY={scale}
    >
      <Shapes />
    </Stage></div>
  );
};

export default Canvas;
