'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  NodeTypes,
  MarkerType,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Link from 'next/link';
import { PlusIcon, MinusIcon, ArrowsPointingOutIcon, PaintBrushIcon, MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon } from '@heroicons/react/24/outline';

import CustomNode from '@/components/CustomNodes';
import { NodeType, NODE_TYPES } from '@/components/nodeTypes';
import SafeInput from '@/components/SafeInput';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

interface WorkflowData {
  id?: number;
  name: string;
  nodes: Node[];
  edges: Edge[];
}

function MinimalControls({ onFormat }: { onFormat?: () => void }) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  return (
    <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
      <button onClick={() => fitView()} className="p-2 bg-gray-800 rounded hover:bg-gray-700 focus:outline-none">
        <ArrowsPointingOutIcon className="w-5 h-5 text-white" />
      </button>
      <button onClick={() => zoomIn()} className="p-2 bg-gray-800 rounded hover:bg-gray-700 focus:outline-none">
        <MagnifyingGlassPlusIcon className="w-5 h-5 text-white" />
      </button>
      <button onClick={() => zoomOut()} className="p-2 bg-gray-800 rounded hover:bg-gray-700 focus:outline-none">
        <MagnifyingGlassMinusIcon className="w-5 h-5 text-white" />
      </button>
      {onFormat && (
        <button onClick={onFormat} className="p-2 bg-gray-800 rounded hover:bg-gray-700 focus:outline-none">
          <PaintBrushIcon className="w-5 h-5 text-white" />
        </button>
      )}
    </div>
  );
}

export default function Workflow({ initialWorkflow, isViewMode = false }: { initialWorkflow?: any; isViewMode?: boolean } = {}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialWorkflow && initialWorkflow.nodes && initialWorkflow.nodes.length > 0
      ? initialWorkflow.nodes.map((node: any) => ({
          id: node.id.toString(),
          type: 'custom',
          position: { x: node.positionX, y: node.positionY },
          data: { type: node.type, ...(node.data || {}), label: node.data?.label || '' },
        }))
      : [
          // Sample nodes to demonstrate connections
          {
            id: '1',
            type: 'custom',
            position: { x: 100, y: 100 },
            data: { type: 'Config', label: 'Start Config' },
          },
          {
            id: '2',
            type: 'custom',
            position: { x: 300, y: 100 },
            data: { type: 'OracleDb', label: 'Database' },
          },
          {
            id: '3',
            type: 'custom',
            position: { x: 500, y: 100 },
            data: { type: 'Server', label: 'Web Server' },
          },
        ]
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialWorkflow && initialWorkflow.edges && initialWorkflow.edges.length > 0
      ? initialWorkflow.edges.map((edge: any) => ({
          id: edge.id.toString(),
          source: edge.source.toString(),
          target: edge.target.toString(),
          label: edge.label,
        }))
      : [
          // Sample edge to show connection
          {
            id: 'e1-2',
            source: '1',
            target: '2',
            label: 'Connect to DB',
          },
        ]
  );
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [workflowName, setWorkflowName] = useState(
    initialWorkflow && initialWorkflow.name ? initialWorkflow.name : 'New Workflow'
  );
  const [selectedProjectCode, setSelectedProjectCode] = useState<string>(
    initialWorkflow && initialWorkflow.projectCode ? initialWorkflow.projectCode : ''
  );
  const [projects, setProjects] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);

  // Load workflows on component mount
  useEffect(() => {
    fetchWorkflows();
    fetchProjects();
  }, []);

  // Load workflow data if initialWorkflow has id
  useEffect(() => {
    if (initialWorkflow && initialWorkflow.id) {
      loadWorkflow(initialWorkflow.id);
    }
  }, [initialWorkflow]);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows');
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data);
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const onConnect = useCallback(
    (params: Connection) => {
      if (!isViewMode) {
        setEdges((eds) => addEdge(params, eds));
      }
    },
    [setEdges, isViewMode]
  );

  const onNodeClick = useCallback((event: any, node: Node) => {
    if (!isViewMode) {
      setSelectedNode(node);
      setSelectedEdge(null);
    }
  }, [isViewMode]);

  const onEdgeClick = useCallback((event: any, edge: Edge) => {
    if (!isViewMode) {
      setSelectedEdge(edge);
      setSelectedNode(null);
    }
  }, [isViewMode]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  const onPaneMouseDown = useCallback((event: any) => {
    // Only deselect if clicking on the pane itself, not on UI elements
    if (event.target.classList.contains('react-flow__pane')) {
      setSelectedNode(null);
      setSelectedEdge(null);
    }
  }, []);

  const onKeyDown = useCallback((event: any) => {
    // Prevent React Flow from handling keyboard events when input is focused
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.closest('input')) {
      event.stopPropagation();
      return;
    }
  }, []);

  const addNode = useCallback((nodeType: NodeType) => {
    const newNode: Node = {
      id: `${nodeType}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: 'custom',
      position: { x: 100, y: 100 },
      data: { type: nodeType, label: '' },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const updateNode = useCallback((nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      )
    );
    setSelectedNode((prev) =>
      prev && prev.id === nodeId
        ? { ...prev, data: { ...prev.data, ...data } }
        : prev
    );
  }, [setNodes, setSelectedNode]);

  const updateEdge = useCallback((edgeId: string, data: any) => {
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === edgeId ? { ...edge, ...data } : edge
      )
    );
    setSelectedEdge((prev) =>
      prev && prev.id === edgeId
        ? { ...prev, ...data }
        : prev
    );
  }, [setEdges, setSelectedEdge]);

  const deleteEdge = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    setSelectedEdge(null);
  }, [setEdges]);

  const saveWorkflow = async () => {
    if (!workflowName.trim()) {
      alert('Please enter a workflow name');
      return;
    }

    setIsSaving(true);
    try {
      const workflowData = {
        name: workflowName,
        projectCode: selectedProjectCode || null,
        nodes: nodes.map(node => ({
          id: node.id.toString(),
          type: node.data.type,
          data: node.data,
          positionX: node.position.x,
          positionY: node.position.y,
        })),
        edges: edges.map(edge => ({
          source: edge.source.toString(),
          target: edge.target.toString(),
          label: edge.label,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
        })),
      };

      let response;
      if (initialWorkflow && initialWorkflow.id) {
        // UPDATE
        response = await fetch(`/api/workflows/${initialWorkflow.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(workflowData),
        });
      } else {
        // CREATE
        response = await fetch('/api/workflows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(workflowData),
        });
      }

      if (response.ok) {
        const savedWorkflow = await response.json();
        alert('Workflow saved successfully!');
        fetchWorkflows();
      } else {
        const error = await response.json();
        alert(`Error saving workflow: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  };

  const loadWorkflow = async (workflowId: number) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`);
      if (response.ok) {
        const workflow = await response.json();
        
        const loadedNodes: Node[] = workflow.nodes.map((node: any) => ({
          id: node.id.toString(),
          type: 'custom',
          position: { x: node.positionX, y: node.positionY },
          data: { type: node.type, label: node.data?.label || '' },
        }));

        const loadedEdges: Edge[] = workflow.edges.map((edge: any) => ({
          id: `e${edge.source}-${edge.target}`,
          source: edge.source.toString(),
          target: edge.target.toString(),
          label: edge.label,
          type: 'default',
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
        }));
        setNodes(loadedNodes);
        setEdges(loadedEdges);
        setWorkflowName(workflow.name);
        setSelectedProjectCode(workflow.projectCode || '');
        setShowLoadModal(false);
        setSelectedNode(null);
        setSelectedEdge(null);
      }
    } catch (error) {
      console.error('Error loading workflow:', error);
      alert('Failed to load workflow');
    }
  };

  const clearWorkflow = () => {
    if (confirm('Are you sure you want to clear the current workflow?')) {
      setNodes([]);
      setEdges([]);
      setWorkflowName('New Workflow');
      setSelectedNode(null);
      setSelectedEdge(null);
    }
  };

  const onLoadClick = () => {
    setShowLoadModal(true);
  };

  const autoFormat = useCallback(() => {
    if (nodes.length === 0) return;

    // Create a map of node connections
    const nodeConnections = new Map<string, string[]>();
    const nodeParents = new Map<string, string[]>();
    
    // Initialize maps
    nodes.forEach(node => {
      nodeConnections.set(node.id, []);
      nodeParents.set(node.id, []);
    });

    // Build connection maps
    edges.forEach(edge => {
      const sourceConnections = nodeConnections.get(edge.source) || [];
      sourceConnections.push(edge.target);
      nodeConnections.set(edge.source, sourceConnections);

      const targetParents = nodeParents.get(edge.target) || [];
      targetParents.push(edge.source);
      nodeParents.set(edge.target, targetParents);
    });

    // Find root nodes (nodes with no parents)
    const rootNodes = nodes.filter(node => {
      const parents = nodeParents.get(node.id) || [];
      return parents.length === 0;
    });

    // If no root nodes found, use the first node
    const startNodes = rootNodes.length > 0 ? rootNodes : [nodes[0]];

    // Calculate levels for each node
    const nodeLevels = new Map<string, number>();
    const visited = new Set<string>();

    const calculateLevel = (nodeId: string, level: number) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      const currentLevel = nodeLevels.get(nodeId) || 0;
      nodeLevels.set(nodeId, Math.max(currentLevel, level));

      const connections = nodeConnections.get(nodeId) || [];
      connections.forEach(connectedNodeId => {
        calculateLevel(connectedNodeId, level + 1);
      });
    };

    startNodes.forEach(node => calculateLevel(node.id, 0));

    // Group nodes by level
    const levelGroups = new Map<number, string[]>();
    nodes.forEach(node => {
      const level = nodeLevels.get(node.id) || 0;
      const group = levelGroups.get(level) || [];
      group.push(node.id);
      levelGroups.set(level, group);
    });

    // Calculate new positions
    const levelSpacing = 250;
    const nodeSpacing = 200;
    const startX = 100;
    const startY = 100;

    const newNodes = nodes.map(node => {
      const level = nodeLevels.get(node.id) || 0;
      const levelGroup = levelGroups.get(level) || [];
      const nodeIndex = levelGroup.indexOf(node.id);
      
      const x = startX + (level * levelSpacing);
      const y = startY + (nodeIndex * nodeSpacing);
      
      return {
        ...node,
        position: { x, y }
      };
    });

    setNodes(newNodes);
  }, [nodes, edges, setNodes]);

  return (
    <ReactFlowProvider>
      {/* Navigation Bar */}
      <nav className="w-full bg-gray-100 text-gray-900 px-6 py-3 flex items-center justify-between shadow z-30">
        <div className="flex items-center gap-4">
          <div className="font-bold text-lg tracking-wide">
            {isViewMode ? 'Workflow Viewer' : 'Workflow Studio'}
          </div>
          <input
            type="text"
            value={workflowName}
            onChange={e => setWorkflowName(e.target.value)}
            placeholder="Workflow Name"
            className="px-3 py-2 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 min-w-[180px]"
            style={{ minWidth: 180 }}
            disabled={isViewMode}
          />
          <select
            value={selectedProjectCode}
            onChange={e => setSelectedProjectCode(e.target.value)}
            className="px-3 py-2 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 min-w-[150px]"
            disabled={isViewMode}
          >
            <option value="">Select Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.projectCode}>
                {project.projectCode} - {project.projectName}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/">
            <button className="px-3 py-2 text-xs bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors">
              ← Back to List
            </button>
          </Link>
          {!isViewMode && (
            <>
              <button 
                onClick={saveWorkflow} 
                disabled={isSaving} 
                className="px-3 py-2 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button 
                onClick={onLoadClick} 
                className="px-3 py-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Load
              </button>
              <button 
                onClick={clearWorkflow} 
                className="px-3 py-2 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </nav>
      <div className="w-full h-screen" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          onMouseDown={onPaneMouseDown}
          onKeyDown={onKeyDown}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid={false}
          snapGrid={[15, 15]}
          connectionRadius={20}
          defaultEdgeOptions={{
            type: 'default',
            animated: false,
            style: { stroke: '#333', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#333' },
          }}
        >
          <Background />
          <MinimalControls onFormat={autoFormat} />
          <MiniMap />
        </ReactFlow>

        {/* Sidebar as Modal/Drawer */}
        {(selectedNode || selectedEdge) && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black bg-opacity-30">
            <div className="bg-white rounded-l-lg shadow-lg border p-4 w-80 h-full overflow-y-auto relative animate-slide-in-right">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
                onClick={() => {
                  setSelectedNode(null);
                  setSelectedEdge(null);
                }}
                aria-label="Close"
              >
                ×
              </button>
              {/* Node Properties */}
              {selectedNode && (
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-3">Node Properties</div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Node Type</label>
                      <div className="px-2 py-1 text-sm bg-gray-100 rounded">{selectedNode.data.type}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Label</label>
                      <SafeInput
                        value={selectedNode.data.label || ''}
                        onChange={value => updateNode(selectedNode.id, { ...selectedNode.data, label: value })}
                        placeholder="Enter node label"
                        className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Position</label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-gray-500">X:</span> {Math.round(selectedNode.position.x)}</div>
                        <div><span className="text-gray-500">Y:</span> {Math.round(selectedNode.position.y)}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setNodes(nds => nds.filter(n => n.id !== selectedNode.id));
                        setEdges(eds => eds.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id));
                        setSelectedNode(null);
                      }}
                      className="w-full px-3 py-2 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors mt-4"
                    >
                      🗑️ Delete Node
                    </button>
                  </div>
                </div>
              )}
              {/* Edge Properties */}
              {selectedEdge && (
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-3">Edge Properties</div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Label</label>
                      <SafeInput
                        value={typeof selectedEdge.label === 'string' ? selectedEdge.label : ''}
                        onChange={value => updateEdge(selectedEdge.id, { ...selectedEdge, label: value })}
                        placeholder="Enter edge label"
                        className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Connection</label>
                      <div className="text-xs text-gray-600">From: {selectedEdge.source} → To: {selectedEdge.target}</div>
                    </div>
                    <div className="pt-2 border-t">
                      <button
                        onClick={() => deleteEdge(selectedEdge.id)}
                        className="w-full px-3 py-2 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        🗑️ Delete Edge
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Load Workflow Modal */}
        {showLoadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Load Workflow</h3>
              {workflows.length === 0 ? (
                <p className="text-gray-500">No saved workflows found.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {workflows.map((workflow) => (
                    <button
                      key={workflow.id}
                      onClick={() => loadWorkflow(workflow.id)}
                      className="w-full text-left p-3 border rounded hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium">{workflow.name}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(workflow.createdAt).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => setShowLoadModal(false)}
                className="mt-4 w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Add Node Button (below navbar, top right) */}
        {!isViewMode && (
          <button
            onClick={() => setShowAddNodeModal(true)}
            className="absolute top-20 right-4 z-40 bg-gray-800 hover:bg-gray-700 text-white rounded shadow-lg p-2 focus:outline-none"
            aria-label="Add Node"
          >
            <PlusIcon className="w-5 h-5 text-white" />
          </button>
        )}
        {/* Add Node Modal */}
        {showAddNodeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 min-w-[260px] max-w-xs w-full">
              <div className="text-lg font-semibold mb-4 text-gray-700">Add Node</div>
              <div className="grid grid-cols-2 gap-3">
                {NODE_TYPES.map((nodeType) => (
                  <button
                    key={nodeType}
                    onClick={() => {
                      addNode(nodeType);
                      setShowAddNodeModal(false);
                    }}
                    className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs font-medium"
                  >
                    {nodeType}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowAddNodeModal(false)}
                className="mt-6 w-full px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </ReactFlowProvider>
  );
}
