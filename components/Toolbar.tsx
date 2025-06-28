import React from 'react';
import { NodeType, NODE_TYPES } from './nodeTypes';

interface ToolbarProps {
  onAddNode: (nodeType: NodeType) => void;
  onSave: () => void;
  onLoad: () => void;
  onClear: () => void;
  onFormat: () => void;
  isSaving?: boolean;
}

export default function Toolbar({
  onAddNode,
  onSave,
  onLoad,
  onClear,
  onFormat,
  isSaving = false,
}: ToolbarProps) {
  return (
    <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg border p-4">
      <div className="flex flex-col gap-3">
        <div className="text-sm font-semibold text-gray-700 mb-2">
          Add Nodes
        </div>
        <div className="grid grid-cols-2 gap-2">
          {NODE_TYPES.map((nodeType) => (
            <button
              key={nodeType}
              onClick={() => onAddNode(nodeType)}
              className="px-3 py-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {nodeType}
            </button>
          ))}
        </div>
        
        <div className="border-t pt-3">
          <div className="text-sm font-semibold text-gray-700 mb-2">
            Workflow Actions
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={onFormat}
              className="px-3 py-2 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              🎨 Auto Format
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="px-3 py-2 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Workflow'}
            </button>
            <button
              onClick={onLoad}
              className="px-3 py-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Load Workflow
            </button>
            <button
              onClick={onClear}
              className="px-3 py-2 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 