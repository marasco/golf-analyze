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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zoom = useAppSelector((state) => state.video.scale);
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video!==null && canvas!==null) {
      canvas.style.transform = `scale(${zoom})`;
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
      video.play().catch((error) => {
        // Maneja cualquier error que pueda ocurrir durante la reproducción
        console.error("Error al reproducir el video: ", error);
      });
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
      <canvas ref={canvasRef} className="block max-h-full max-w-full h-full mx-auto pointer-events-none" />
      <video
        ref={videoRef}
        style={{ display: 'none' }} // hide the video element
        src={blob}
        loop
        muted
        autoPlay
        playsInline
        data-flipped="false"
        className={`block max-h-full max-w-full h-full mx-auto pointer-events-none ${
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
  );
};

export default Video;