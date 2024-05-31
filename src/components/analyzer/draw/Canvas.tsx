import React, { useState, useRef, useEffect } from 'react';
import { Stage } from "react-konva";
import { getPlayer } from "@helpers";

import useCanvasEvents from "@hooks/useCanvasEvents";

import Shapes from "./Shapes";

const Canvas = () => {
  let chunks: BlobPart[] = [];
  const exportedRef = useRef(null);
  const stageRef = useRef(null);
  const canvasEvents = useCanvasEvents();
  const canvas = document.querySelector('canvas');
  let width = canvas && canvas.width ? canvas.width:0;
  let height = canvas && canvas.height ? canvas.height: 0;
  let scale = 1; //width / initialCanvasWidthRef.current;
  const [isRecording, setIsRecording] = useState(false); // Nuevo estado para rastrear si se está grabando
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null); // Use useState here

  const drawShapes = function(context:any, shapes:any) {
  for (const shape of shapes) {
    console.log('attrs', shape.attrs)
    console.log(shape.colorKey)
    if (shape.attrs.radius){
      // Dibuja un círculo
      context.beginPath();
      context.arc(shape.attrs.x, shape.attrs.y, shape.attrs.radius, 0, 2 * Math.PI);
      context.fillStyle = shape.attrs.fill || shape.colorKey;
      context.fill();
      console.log('drawing circle')
    } else if (shape.attrs.points && shape.attrs.points.length === 4){
      // Dibuja una línea
      context.beginPath();
      context.moveTo(shape.attrs.points[0], shape.attrs.points[1]);
      context.lineTo(shape.attrs.points[2], shape.attrs.points[3]);
      context.strokeStyle = shape.attrs.stroke || shape.colorKey;
      context.stroke();
      console.log('drawing line')
    } else if (shape.attrs.points){
      // Dibuja curvas (asumiendo que son curvas bezier)
      context.beginPath();
      context.moveTo(shape.attrs.points[0], shape.attrs.points[1]);
      for (let i = 2; i < shape.attrs.points.length; i += 6) {
        context.bezierCurveTo(
          shape.attrs.points[i], shape.attrs.points[i+1],
          shape.attrs.points[i+2], shape.attrs.points[i+3],
          shape.attrs.points[i+4], shape.attrs.points[i+5]
        );
      }
      console.log('drawing curve')
      context.strokeStyle = shape.attrs.stroke || shape.colorKey;
      context.stroke();
    }
  }
}
  useEffect(() => {
    const video = document.getElementsByTagName('video')[0];
    const canvas = document.querySelector('export'); 
    //canvas.style.transform = `scale(${zoom})`;
    video.addEventListener('loadedmetadata', function () {
      if (canvas){
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
    });
    video.addEventListener('play', function () {
      const draw = function () {
        if (video.paused || video.ended || !canvas) return;
        const context = canvas.getContext('2d');
        if (context!==null){
          //console.log('drawing')
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          if (isRecording){
            // drawShapes
            const stageCanvas = stageRef.current.children[0].canvas._canvas
            if (stageCanvas) {
                const shapes = stageRef.current.getChildren()[0].children;
                drawShapes(context, shapes)
            }
          requestAnimationFrame(draw);
          }
        }
      }
      draw();
    }, false); 
  }); // end useEffect
  const startR = () => {
    try {
      if (isRecording) return;
      const canvas = document.querySelector('export'); 
      if (canvas!==null) { 
        setIsRecording(true); 
        const player = getPlayer();
        player.play().then(() => {}).catch(() => {});
        const stream = canvas.captureStream(30); // 30 FPS
        const newRecorder = new MediaRecorder(stream);
        newRecorder.ondataavailable = e => {
          console.log('data', e.data);
          chunks.push(e.data);
        }
        newRecorder.onstop = () => {
          console.log('on stop event') 
          const blob = new Blob(chunks, { 'type' : 'video/mp4;' });
          chunks = [];
          const videoURL = URL.createObjectURL(blob);
          console.log(videoURL); // Aquí está la URL del video
          window.open(videoURL)
        };
        setRecorder(newRecorder);
        newRecorder.start();
      }

    } catch (err) {
      console.error("Error: ", err);
    }
  };
  
  const stopRecording = () => {
    console.log('stop', {recorder}) 
    setIsRecording(false);
    if (recorder!==null){
      console.log('stop event executing', {recorder}) 
      recorder.stop();
    }
  };

  return (
    <div className="konv-container">
      <Stage
      ref={stageRef}
      {...canvasEvents}
      width={width}
      height={height}
      className="stage-object inset0"
      scaleX={scale}
      scaleY={scale}
    >
      <Shapes />
    </Stage> 
      <canvas id="export" ref={exportedRef} className="canvas-for-export block max-h-full max-w-full h-full mx-auto pointer-events-none hidden" />
      <div>
      <button
        type="button"
        onClick={startR}
        aria-label="Start Recording"
        className={`btn-action ${isRecording ? 'recording' : ''}`} 
      >
        A
      </button>
      <button
        onClick={stopRecording}
        type="button"
        aria-label="Stop Recording"
        className="btn-action"
      >
        S
      </button>
    </div>
    
  </div>
  );
};

export default Canvas;
