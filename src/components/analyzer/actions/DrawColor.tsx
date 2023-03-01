import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";

import { DrawColorEnum } from "../../../enums";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { setDrawColor } from "../../../redux/slices/draw";

const drawColors = [
  DrawColorEnum.WHITE,
  DrawColorEnum.GREEN,
  DrawColorEnum.RED,
  DrawColorEnum.BLUE,
  DrawColorEnum.ORANGE,
];

const DrawColor = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const isDrawing = useAppSelector((state) => state.draw.isDrawing);
  const drawColor = useAppSelector((state) => state.draw.color);
  const dispatch = useAppDispatch();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const handleChange = (newDrawColor: DrawColorEnum) => {
    dispatch(setDrawColor(newDrawColor));
  };

  return (
    <Popover.Root onOpenChange={handleOpenChange} open={isOpen && !isDrawing}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="btn-action"
          aria-label="Select draw color"
        >
          <div
            className={"h-4 w-4 border border-white rounded-full"}
            style={{
              backgroundColor: drawColors.find((c) => c === drawColor),
            }}
          />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="left"
          className="p-1 shadow rounded duration-300 ease-in-out will-change-auto flex bg-black  gap-2 text-white"
        >
          {drawColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => {
                handleChange(color);
              }}
              aria-label={`Draw with ${color}`}
              className={`block text-center p-2 rounded ${
                drawColor === color ? "text-brand-blue bg-white" : ""
              }`}
            >
              <div
                className={`h-4 w-4 border border-white rounded-full ${
                  drawColor === color ? "!border-black" : ""
                } `}
                style={{ backgroundColor: color }}
              />
            </button>
          ))}
          <Popover.Arrow className="fill-black" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default DrawColor;