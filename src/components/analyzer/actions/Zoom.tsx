import { BsZoomIn, BsZoomOut } from "react-icons/bs";

import useAppDispatch from "@hooks/useAppDispatch";
import { dispatchZoomIn, dispatchZoomOut } from "@redux/slices/video";

const Zoom = () => {
  const dispatch = useAppDispatch();

  const zoomIn = () => {
    dispatch(dispatchZoomIn(1));
  };
  const zoomOut = () => {
    dispatch(dispatchZoomOut(0));
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
    </div>
  );
};

export default Zoom;
