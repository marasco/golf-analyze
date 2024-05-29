import { BsZoomIn, BsZoomOut } from "react-icons/bs";
import useAppDispatch from "@hooks/useAppDispatch";
import { dispatchZoomIn, dispatchZoomOut } from "@redux/slices/video";
interface TypeCustomMD {
  video: {
    cursor: string;
  },
  audio: boolean;
}
const Zoom = () => {
  const dispatch = useAppDispatch();
  let recorder: MediaRecorder;
  const chunks: BlobPart[] = [];

  const zoomIn = () => {
    dispatch(dispatchZoomIn(1));
  };

  const zoomOut = () => {
    dispatch(dispatchZoomOut(0));
  };
const startR = () => {
    startRecording().catch(console.error);
}
  const startRecording = async () => {
    try {
      const opts: TypeCustomMD = {
        video: { cursor: "always" },
        audio: false
      };
      const stream = await navigator.mediaDevices.getDisplayMedia(opts);
      console.log('start recording')
      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        console.log('recording...')
        chunks.push(e.data);
      }
      recorder.start(1000);
    } catch (err) {
      console.error("Error: ", err);
    }
  };

  const stopRecording = () => {
    console.log({recorder})
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'canvas.webm';
      a.click();
    };
    recorder.stop();
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
          className="btn-action"
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