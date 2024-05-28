import { BsFillPlayFill, BsFillPauseFill, BsStopFill } from "react-icons/bs";

import useAppSelector from "@hooks/useAppSelector";
import { getPlayer } from "@helpers";

const playLabel = "Play video";
const pauseLabel = "Pause video";

const stopLabel = "Stop video";

const PlayPause = ({ start, end }: { start: number, end: number }) => {
  // ... el resto de tu código ...
  const { isPlaying } = useAppSelector((state) => state.video);

  const handlePlay = () => {
    const player = getPlayer();
    player.currentTime = start;
    void player.play();
  };

  const handleStop = () => {
    const player = getPlayer();
    player.pause();
    player.currentTime = start;
  };


  const handlePause = () => {
    getPlayer().pause();
  };


  return (
    <>
      {isPlaying ? (
        <button
          type="button"
          className="btn-action"
          onClick={handlePause}
          aria-label={pauseLabel}
          title={pauseLabel}
        >
          <BsFillPauseFill />
        </button>
      ) : (
        <button
          type="button"
          className="btn-action"
          onClick={handlePlay}
          aria-label={playLabel}
          title={playLabel}
        >
          <BsFillPlayFill />
        </button>
      )}
      <button
        type="button"
        className="btn-action"
        onClick={handleStop}
        aria-label={stopLabel}
        title={stopLabel}
      >
        <BsStopFill />
      </button>
    </>
  );
};

export default PlayPause;
