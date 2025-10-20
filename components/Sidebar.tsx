import React from 'react';
import { Node, Edge } from 'reactflow';
import { NodeType } from './nodeTypes';
import SafeInput from './SafeInput';

interface SidebarProps {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  onNodeUpdate: (nodeId: string, data: any) => void;
  onEdgeUpdate: (edgeId: string, data: any) => void;
  onEdgeDelete: (edgeId: string) => void;
  workflowName: string;
  onWorkflowNameChange: (name: string) => void;
}

export default function Sidebar({
  selectedNode,
  selectedEdge,
  onNodeUpdate,
  onEdgeUpdate,
  onEdgeDelete,
  workflowName,
  onWorkflowNameChange,
}: SidebarProps) {
  if (!selectedNode && !selectedEdge) {
    return (
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg border p-4 w-64">
        <div className="text-sm font-semibold text-gray-700 mb-3">
          Workflow Properties
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Workflow Name
            </label>
            <SafeInput
              value={workflowName}
              onChange={onWorkflowNameChange}
              placeholder="Enter workflow name"
              className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-xs text-gray-500">
            Select a node or edge to edit its properties
          </div>
        </div>
      </div>
    );
  }

  if (selectedNode) {
    return (
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg border p-4 w-64">
        <div className="text-sm font-semibold text-gray-700 mb-3">
          Node Properties
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Node Type
            </label>
            <div className="px-2 py-1 text-sm bg-gray-100 rounded">
              {selectedNode.data.type}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Label
            </label>
            <SafeInput
              value={selectedNode.data.label || ''}
              onChange={(value) =>
                onNodeUpdate(selectedNode.id, {
                  ...selectedNode.data,
                  label: value,
                })
              }
              placeholder="Enter node label"
              className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Position
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">X:</span> {Math.round(selectedNode.position.x)}
              </div>
              <div>
                <span className="text-gray-500">Y:</span> {Math.round(selectedNode.position.y)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedEdge) {
    return (
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg border p-4 w-64">
        <div className="text-sm font-semibold text-gray-700 mb-3">
          Edge Properties
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Label
            </label>
            <SafeInput
              value={typeof selectedEdge.label === 'string' ? selectedEdge.label : ''}
              onChange={(value) =>
                onEdgeUpdate(selectedEdge.id, {
                  ...selectedEdge,
                  label: value,
                })
              }
              placeholder="Enter edge label"
              className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Connection
            </label>
            <div className="text-xs text-gray-600">
              From: {selectedEdge.source} → To: {selectedEdge.target}
            </div>
          </div>
          <div className="pt-2 border-t">
            <button
              onClick={() => onEdgeDelete(selectedEdge.id)}
              className="w-full px-3 py-2 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              🗑️ Delete Edge
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 