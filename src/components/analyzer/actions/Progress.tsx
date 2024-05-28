
import useAppSelector from "@hooks/useAppSelector";
import PlayPause from "./PlayPause";
import ReactSlider from 'react-slider'
import { useState, useEffect } from 'react';
import { getPlayer } from "@helpers";


  
function MySlider({ start, end, duration, onChange }: { start: number, end: number, duration: number, onChange: (values: number[]) => void }) {
  return (
    <ReactSlider
      className="horizontal-slider"
      thumbClassName="thumb"
      trackClassName="track"
      min={0}
      max={duration}
      value={[start, end]}
      onChange={onChange}
    />
  );
}
const Progress = () => {
  const { duration } = useAppSelector((state) => state.video);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(duration);
  let player: HTMLVideoElement | null = null;
  useEffect(() => {
    setEnd(parseInt(duration.toString()));
  }, [duration]);

  const changeSlider = ([newStart, newEnd]: number[]) => {
    player = getPlayer();
    if (newStart !== start){
      console.log('changing start to ', newStart)
      player.currentTime = newStart;
    }
    if (newEnd !== end){
      player.currentTime = newEnd;
      console.log('changing end to ', newEnd)
    }
    setStart(newStart);
    setEnd(newEnd);
  };

  return (
    <div className="px-2 w-full">
      <PlayPause start={start} end={end} />
      <MySlider
        start={start}
        end={end}
        duration={duration}
        onChange={changeSlider}
      />
    </div>
  );
};

export default Progress;
