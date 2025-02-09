import * as React from "react";
import { useMotionValue, Reorder, useDragControls } from "framer-motion";
import { useRaisedShadow } from "./use-raised-shadow";
import { ReorderIcon } from "./ReorderIcon";

interface Props {
  item: {
    id: string;
    content: React.ReactNode;
  };
}

export const Item = ({ item }: Props) => {
  const y = useMotionValue(0);
  const boxShadow = useRaisedShadow(y);
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      id={item.id}
      style={{ boxShadow, y }}
      dragListener={false}
      dragControls={dragControls}
    >
      <div className="flex justify-between items-center mb-1">
        <ReorderIcon dragControls={dragControls} />
        <span className="w-full">{item.content}</span>
      </div>
    </Reorder.Item>
  );
};
