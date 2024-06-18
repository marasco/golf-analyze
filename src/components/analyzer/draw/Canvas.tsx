import React, { useState, useRef, useEffect } from 'react';
import { Stage } from "react-konva";
import { getPlayer } from "@helpers";
import dotenv from 'dotenv';
dotenv.config();
import useCanvasEvents from "@hooks/useCanvasEvents";

import Shapes from "./Shapes";

const Canvas = () => {
  const chunksRef = useRef<BlobPart[]>([]); // Use useRef here
  const exportedRef = useRef(null);
  const stageRef = useRef(null);
  const canvasEvents = useCanvasEvents();

  let scale = 1; //width / initialCanvasWidthRef.current; // check*1
  const [width, setWidth] = useState(0); 
  const [height, setHeight] = useState(0);  
  const [isRecording, setIsRecording] = useState(false); // Nuevo estado para rastrear si se está grabando
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null); // Use useState here
  const drawShapes = function(context:any, shapes:any) {
    context.lineWidth = 3;
  for (const shape of shapes) {
    if (shape.attrs.radius){
      // Dibuja un círculo
      context.beginPath();
      context.arc(shape.attrs.x, shape.attrs.y, shape.attrs.radius, 0, 2 * Math.PI);
      context.strokeStyle = shape.attrs.fill || shape.colorKey; // establece el color del borde
      context.stroke(); // dibuja el borde del círculo
    } else if (shape.attrs.points && shape.attrs.points.length === 4){
      // Dibuja una línea
      context.beginPath();
      context.moveTo(shape.attrs.points[0], shape.attrs.points[1]);
      context.lineTo(shape.attrs.points[2], shape.attrs.points[3]);
      context.strokeStyle = shape.attrs.stroke || shape.colorKey;
      context.stroke();
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
      context.strokeStyle = shape.attrs.stroke || shape.colorKey;
      context.stroke();
    }
  }
}

  useEffect(() => {
    const video = document.getElementsByTagName('video')[0];
    const canvas = document.querySelector('#export'); 
    const vidContainer = document.querySelector('#video-canvas')
  
    // TODO: resize
    video.addEventListener('loadedmetadata', function () {
      if (canvas){
        const width = vidContainer.clientWidth;
        const height = vidContainer.clientHeight;
        canvas.width = width;
        canvas.height = height;
        setWidth(width);
        setHeight(height); 
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
            requestAnimationFrame(draw);
          }
        }
      }
      draw();
    }, false); 
  }, [recorder]); // end useEffect

  const previewAction = () => {
    const video = document.getElementsByTagName('video')[0];
    const exportCanvas = document.querySelector('#export'); 
    const draw = function () {
      const context = exportCanvas.getContext('2d');
      if (context!==null){
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
      }
    }
    draw();

  }
  
const startR = async () => {
  try {
    if (isRecording) return;
    const canvas = document.querySelector('#export'); 
    if (canvas!==null) { 
      console.log('startR=> true')
      
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(async micStream => {
          const player = getPlayer();         

          const videoStream = canvas.captureStream(30); // 30 FPS
          console.log('videoStream', videoStream.getTracks())
          console.log('micStream', micStream.getTracks())
          let combinedStream = new MediaStream([
            ...videoStream.getTracks(), 
            ...micStream.getTracks()
          ]);
          
          const newRecorder = new MediaRecorder(combinedStream);
          newRecorder.onstart = () => {
            console.log('////////MediaRecorder started');
          };
          
          console.log(':play execute')
          console.log(videoStream.active)
          console.log(micStream.active)
          console.log('newRecorder.start...')
          console.log({newRecorder})
          setIsRecording(true);
          
          newRecorder.ondataavailable = e => {
            console.log('ondata', e.data)
            console.log('datasize', e.data.size)
            if (e.data.size > 0)
              chunksRef.current.push(e.data);
            
          }
          newRecorder.onerror = () => {
            console.log('MediaRecorder error');
          };
          newRecorder.start();
          player.play();
          newRecorder.onstop = () => { 
            setIsRecording(false);
            player.pause();
            player.currentTime = 0;
            try {
              if (!chunksRef.current.length) { console.log('no chunks');  return false;  }
              console.log('::onStopVideo'); 
              console.log(chunksRef.current)
              const blob = new Blob(chunksRef.current);
              console.log('blob size: ', blob.size)
              if (blob.size === 0) { return false }
              const formData = new FormData();
              formData.append('video', blob, 'input.webm');
          
              // Enviar el video al servidor para convertirlo
              const response = fetch(`${process.env.API_URL}/convert`, {
                method: 'POST',
                body: formData
              }).then(async response => {
                const { videoURL } = await response.json();
                const finalUrl = `${process.env.API_URL}/${videoURL}`;
                console.log({finalUrl})
                window.open(finalUrl);
              })
          
              // Obtener la URL del video convertido de la respuesta
              
              
              } catch (e){
                console.error(e)
              }

          };
          setRecorder(newRecorder);
        })
        .catch(error => {
          console.log('Error getting microphone', error);
        });
    }
  } catch (err) {
    console.error("Error: ", err);
  }
};
  
  const stopRecording = () => {
    setIsRecording(false);
    if (recorder!==null){ 
      console.log('stop event executing', {recorder}) 
      setTimeout(() => recorder.stop(), 2000);

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
