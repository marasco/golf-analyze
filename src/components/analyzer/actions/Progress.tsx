import React, { useState, useEffect } from 'react';
import ReactSlider from 'react-slider';
import useAppSelector from "@hooks/useAppSelector";
import { getPlayer } from "@helpers";
import PlayPause from './PlayPause';

const Progress = () => {
  const [current, setCurrent] = useState(0);
  const { duration } = useAppSelector((state) => state.video);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(duration);

  useEffect(() => {
    const player = getPlayer();
    const updateCurrentTime = () => {
      if (player.currentTime >= end) {
         player.pause();
      } else {
        setCurrent(player.currentTime);
      }
    };
    player.addEventListener('timeupdate', updateCurrentTime);
  
    return () => {
      player.removeEventListener('timeupdate', updateCurrentTime);
    };
  }, [end]);

  useEffect(() => {
    setEnd(parseInt(duration.toString()));
  }, [duration]);

  const changeSlider = ([newStart, newEnd]: number[]) => {
    const player: HTMLVideoElement | null = getPlayer();
    if (newStart !== start){
      player.currentTime = newStart;
    }
    setStart(newStart);
    setEnd(newEnd);
    player.play().then(() => {}).catch(() => {});
  };

  const handleCurrentChange = (value: number) => {
    const player = getPlayer();
    player.currentTime = value;
    setCurrent(value);
  };
  
  const sliderWidth = `${((end - start) / duration) * 100}%`;

  return (
    <div className="px-2 w-full">
      <PlayPause start={start} end={end} />
      <ReactSlider
        className="horizontal-slider"
        thumbClassName="thumb"
        trackClassName="track"
        min={0}
        max={duration}
        value={[start, end]}
        onChange={changeSlider}
      />
      <div style={{ width: sliderWidth, marginLeft: `${(start / duration) * 100}%` }}>
        <ReactSlider
          className="horizontal-slider current-playing-slider current"
          thumbClassName="thumb"
          trackClassName="track"
          min={start}
          max={end}
          value={current}
          onChange={handleCurrentChange}
        />
      </div>
    </div>
  );

};

export default Progress;