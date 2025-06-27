'use client';

import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { useEffect, useState } from 'react';

export default function Workflow() {
  const [elements, setElements] = useState({ nodes: [], edges: [] });

  useEffect(() => {
    fetch('/api/workflows')
      .then((res) => res.json())
      .then((data) => setElements(data))
      .catch(() => {});
  }, []);

  return (
    <div className="w-full h-screen">
      <ReactFlow nodes={elements.nodes} edges={elements.edges}>
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
