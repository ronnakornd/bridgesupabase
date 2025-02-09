import React from 'react'
import { Reorder } from "framer-motion";
import {Item} from './ReorderItem'

interface Props {
    items: {id: string, content: React.ReactNode}[]
    setItems: (items: {
        id: string;
        content: React.ReactNode;
    }[]) => void
}

function ReorderGroup({items, setItems}: Props) {
  return (
    <Reorder.Group axis="y" onReorder={setItems} values={items}>
    {items.map((item) => (
      <Item key={item.id} item={item} />
    ))}
    </Reorder.Group>
  )
}

export default ReorderGroup