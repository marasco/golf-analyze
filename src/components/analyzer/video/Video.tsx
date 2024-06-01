import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { BsFillExclamationCircleFill } from "react-icons/bs";

import FocusLock from "react-focus-lock";

import useAppSelector from "@hooks/useAppSelector";
import useAppDispatch from "@hooks/useAppDispatch";
import {
  setPlayback,
  setDuration,
  setCurrentTime,
  setSpeed,
  setMuted,
  reset,
} from "@redux/slices/video";

const Video = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); //id: video-canvas
  const zoom = useAppSelector((state) => state.video.scale);
  const vidContainer = document.querySelector('#video-canvas')

     
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    console.log('video zoom?')
    if (video!==null && canvas!==null) {
      canvas.style.transform = `scale(${zoom})`;
      console.log('setting canvas transform', zoom)
      // need to update the width and height of konva canvas. zoom does not work fine for video.
      /*if (vidContainer){
      let vwidth = vidContainer.clientWidth;
      let vheight = vidContainer.clientHeight;
      const scaleString = vidContainer.style.transform; // Ejemplo: "scale(1.2)"
      const scale = parseFloat(scaleString.slice(6, -1)); // Extrae el factor de escala y lo convierte en un número

      vwidth = vwidth * scale;
      vheight = vheight * scale;

      console.log('update width of konva', vwidth)
      document.querySelector('.konvajs-content canvas').style.width = `${vwidth}px`;
      document.querySelector('.konvajs-content canvas').style.height = `${vheight}px`;
      }
      */
      const context = canvas.getContext('2d');
      video.addEventListener('loadedmetadata', function () {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      });
      video.addEventListener('play', function () {
        const draw = function () {
          if (video.paused || video.ended) return;
          if (context!==null){
            //console.log('drawing')
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            requestAnimationFrame(draw);
          }
        };
        draw();
      }, false);
      
    }
  }, [zoom]);


  const { blob, isFlipped } = useAppSelector((state) => state.video);
  const [playbackError, setPlaybackError] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const onPlay = () => {
    dispatch(setPlayback(true));
  };

  const onPause = () => {
    dispatch(setPlayback(false));
  };

  const onDurationChange = (e: React.SyntheticEvent) => {
    const currentTarget = e.currentTarget as HTMLVideoElement;
    dispatch(setDuration(currentTarget.duration));
  };

  const onTimeUpdate = (e: React.SyntheticEvent) => {
    const currentTarget = e.currentTarget as HTMLVideoElement;
    dispatch(setCurrentTime(currentTarget.currentTime));
    dispatch(setDuration(currentTarget.duration));
  };

  const onRateChange = (e: React.SyntheticEvent) => {
    const currentTarget = e.currentTarget as HTMLVideoElement;
    dispatch(setSpeed(currentTarget.playbackRate));
  };

  const onVolumeChange = (e: React.SyntheticEvent) => {
    const currentTarget = e.currentTarget as HTMLVideoElement;
    dispatch(setMuted(currentTarget.muted));
  };

  const handleReset = () => {
    dispatch(reset());
  };

  const onError = () => {
    setPlaybackError(true);
  };

  if (playbackError) {
    return createPortal(
      <FocusLock>
        <div className="fixed inset-0 flex items-center justify-center z-[100000] bg-white dark:bg-black bg-opacity-90">
          <div className="text-center">
            <BsFillExclamationCircleFill className="text-4xl mb-2 mx-auto" />
            <h2 className="text-lg uppercase font-bold mb-4">
              A Playback Error Occurred
            </h2>
            <button
              type="button"
              className="uppercase text-brand-blue font-semibold"
              onClick={handleReset}
            >
              Return Home
            </button>
          </div>
        </div>
      </FocusLock>,
      document.body
    );
  }
  return (
    <div className="video-container">
      <canvas id="video-canvas" ref={canvasRef} className="canvas-for-video block max-w-full max-h-full h-full mx-auto pointer-events-none" />
      <div id='vid-container' style={{ display: 'none' }}>
        <video
        ref={videoRef} 
        src={blob}
        loop
        muted
        playsInline
        data-flipped="false"
        className={`block max-w-full max-h-full h-full mx-auto pointer-events-none ${
          isFlipped ? "-scale-x-100" : "scale-x-100"
        }`}
        onPlay={onPlay}
        onPlaying={onPlay}
        onPause={onPause}
        onLoadedData={onDurationChange}
        onDurationChange={onDurationChange}
        onTimeUpdate={onTimeUpdate}
        onRateChange={onRateChange}
        onVolumeChange={onVolumeChange} 
        onError={onError}
      />
      </div>
    </div>
  );
};

export default Video;