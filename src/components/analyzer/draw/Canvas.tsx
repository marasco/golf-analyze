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
  let scale = 1; //width / initialCanvasWidthRef.current; // check*1
  const [width, setWidth] = useState(0); 
  const [height, setHeight] = useState(0);  
  const [isRecording, setIsRecording] = useState(false); // Nuevo estado para rastrear si se está grabando
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null); // Use useState here
  let codec = 'video/mp4;';
  const drawShapes = function(context:any, shapes:any) {
  for (const shape of shapes) {
    console.log('attrs', shape.attrs)
    console.log(shape.colorKey)
    if (shape.attrs.radius){
      // Dibuja un círculo
      context.beginPath();
      context.arc(shape.attrs.x, shape.attrs.y, shape.attrs.radius, 0, 2 * Math.PI);
      context.strokeStyle = shape.attrs.fill || shape.colorKey; // establece el color del borde
      context.stroke(); // dibuja el borde del círculo
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
    const canvas = document.querySelector('#export'); 
    const vidContainer = document.querySelector('#video-canvas')

    video.addEventListener('loadedmetadata', function () {
      if (canvas){
        const width = vidContainer.clientWidth;
        const height = vidContainer.clientHeight;
        canvas.width = width;
        canvas.height = height;
        setWidth(width);
        setHeight(height); 
        console.log('update width of konva', width)
        console.log('update height of konva', height)
      }
    });
    video.addEventListener('play', function () {
      const draw = function () {
        if (video.paused || video.ended || !canvas) return;
        const context = canvas.getContext('2d');
        if (context!==null){
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          if (isRecording){
            const stageCanvas = stageRef.current.children[0].canvas._canvas
            if (stageCanvas) {
                const shapes = stageRef.current.getChildren()[0].children;
                drawShapes(context, shapes)
            }
            if (isRecording)
               requestAnimationFrame(draw);
          }
        }
      }
      draw();
    }, false); 
  }); // end useEffect

  const previewAction = () => {
    const videoCanvas = document.querySelector('#video-canvas'); 
    const video = document.getElementsByTagName('video')[0];
    const exportCanvas = document.querySelector('#export'); 
    console.log(videoCanvas)
    console.log(video)
    console.log(exportCanvas)
    const draw = function () {
      const context = exportCanvas.getContext('2d');
      if (context!==null){
        console.log(exportCanvas.width)
        console.log(exportCanvas.height)
        context.drawImage(video, 0, 0, exportCanvas.width, exportCanvas.height);
          const stageCanvas = stageRef.current.children[0].canvas._canvas
          if (stageCanvas) {
              const shapes = stageRef.current.getChildren()[0].children;
              drawShapes(context, shapes);
              const imageUrl = exportCanvas.toDataURL('image/png');
              const prevImg = document.querySelector('#prevImg');
              if (prevImg){
                prevImg.src = imageUrl;
              } else {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.id = 'prevImg';
                img.style.position = 'fixed';
                img.style.right = '0';
                img.style.bottom = '0';
                img.style.width = '200px'; // Ajusta el tamaño según tus necesidades
                document.body.appendChild(img);
              }

          }
//             requestAnimationFrame(draw);
      }
    }
    draw();

  }
  const startR = () => {
    try {
      if (isRecording) return;
      const canvas = document.querySelector('#export'); 
      if (canvas!==null) { 
        console.log('isRecording=> true')
        setIsRecording(true); 
        const player = getPlayer();
        const stream = canvas.captureStream(30); // 30 FPS
        let newRecorder = null;
        if (MediaRecorder.isTypeSupported('video/webm; codecs="vp8, vorbis"')) {
          console.log('using vp8, vorbis')
          codec = 'video/webm;'
           newRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs="vp8, vorbis"' });
        } else if (MediaRecorder.isTypeSupported('video/webm; codecs="vp9"')) {
          console.log('using vp9')
           newRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs="vp9"' });
        } else if (MediaRecorder.isTypeSupported('video/webm; codecs="vp9, opus"')) {
          console.log('using vp9, opus')
           newRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs="vp9, opus"' });
        } else if (MediaRecorder.isTypeSupported('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')) {
          console.log('using avc1.42E01E, mp4a.40.2')
          newRecorder = new MediaRecorder(stream, { mimeType: 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"' });
        }
        player.play().then(() => {}).catch(() => {});
        newRecorder.ondataavailable = e => {
          chunks.push(e.data);
        }
        newRecorder.onstop = () => {
          const blob = new Blob(chunks, { 'type' : codec });
          const videoURL = URL.createObjectURL(blob); 
          chunks = [];
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
      try {
      const player = getPlayer();
        
      player.pause();
      player.currentTime = 0;
      } catch (e){
        console.error(e)
      }
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
      <div className='top-left-menu'>
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
      <button
        onClick={previewAction}
        type="button"
        aria-label="Prev"
        className="btn-action"
      >
        P
      </button>
    </div>
    
  </div>
  );
};

export default Canvas;
