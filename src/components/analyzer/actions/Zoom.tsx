import React, { useState } from 'react';
import useAppDispatch from "@hooks/useAppDispatch";
import { getPlayer } from "@helpers";
import { BsZoomIn, BsZoomOut } from "react-icons/bs";
import { dispatchZoomIn, dispatchZoomOut } from "@redux/slices/video";
const Zoom = () => {
  const dispatch = useAppDispatch();
  const [isRecording, setIsRecording] = useState(false); // Nuevo estado para rastrear si se está grabando

  const [recorder, setRecorder] = useState<MediaRecorder | null>(null); // Use useState here
  let chunks: BlobPart[] = [];

  const zoomIn = () => {
    dispatch(dispatchZoomIn(1));
  };

  const zoomOut = () => {
    dispatch(dispatchZoomOut(0));
    };
    const startR = () => {
      try {
        
        const canvas = document.querySelector('canvas');
        if (canvas!==null) {
          const player = getPlayer();
          player.play().then(() => {}).catch(() => {});
          setIsRecording(true); 
          const stream = canvas.captureStream(30); // 30 FPS
          console.log({stream})
          const newRecorder = new MediaRecorder(stream);
          newRecorder.ondataavailable = (e) => {
            chunks.push(e.data);
          }
          newRecorder.onstop = (e) => {
            console.log('on_stop')
            const blob = new Blob(chunks, { 'type' : 'video/mp4' });
            chunks = [];
            const videoURL = URL.createObjectURL(blob);
            console.log(videoURL);
            window.open(videoURL)
          }
          newRecorder.start(100);
          setRecorder(newRecorder); // Use setRecorder here
        }
      } catch (err) {
        console.error("Error: ", err);
      }
    };
  
    const stopRecording = () => {
      console.log({recorder}) 
      setIsRecording(false);
      if (recorder!==null){
        recorder.stop();
      }
    };

  return (
    <div>
      <div>
        <button
          type="button"
          onClick={zoomIn}
          aria-label="Zoom In"
          className="btn-action"
        >
          <BsZoomIn />
        </button>
      </div>
      <div>
        <button
          type="button"
          onClick={zoomOut}
          aria-label="Zoom Out"
          className="btn-action"
        >
          <BsZoomOut />
        </button>
      </div>
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
          type="button"
          onClick={stopRecording}
          aria-label="Stop Recording"
          className="btn-action"
        >
          S
        </button>
      </div>
    </div>
  );
};

export default Zoom;