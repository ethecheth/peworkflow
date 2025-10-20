import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeType } from './nodeTypes';
import {
  Cog6ToothIcon,
  ServerIcon,
  CircleStackIcon,
  ClockIcon,
  BoltIcon,
  ArchiveBoxIcon,
  CodeBracketIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  QuestionMarkCircleIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/solid';

const nodeStyles = {
  Config: 'bg-blue-500 border-blue-600',
  OracleDb: 'bg-green-500 border-green-600',
  MariaDb: 'bg-purple-500 border-purple-600',
  NAS: 'bg-orange-500 border-orange-600',
  Server: 'bg-red-500 border-red-600',
  ProcedureOracle: 'bg-indigo-500 border-indigo-600',
  Schedule: 'bg-yellow-500 border-yellow-600',
  Code: 'bg-teal-500 border-teal-600',
  Mail: 'bg-pink-500 border-pink-600',
  Web: 'bg-emerald-500 border-emerald-600',
  IF: 'bg-amber-500 border-amber-600',
  Switch: 'bg-violet-500 border-violet-600',
  HttpRequest: 'bg-cyan-500 border-cyan-600',
};

const nodeIcons: Record<NodeType, React.ElementType> = {
  Config: Cog6ToothIcon,
  OracleDb: CircleStackIcon,
  MariaDb: CircleStackIcon,
  NAS: ArchiveBoxIcon,
  Server: ServerIcon,
  ProcedureOracle: BoltIcon,
  Schedule: ClockIcon,
  Code: CodeBracketIcon,
  Mail: EnvelopeIcon,
  Web: GlobeAltIcon,
  IF: QuestionMarkCircleIcon,
  Switch: Squares2X2Icon,
  HttpRequest: GlobeAltIcon,
};

const CustomNode = memo(({ data, selected }: NodeProps) => {
  const nodeType = data.type as NodeType;
  const style = nodeStyles[nodeType] || 'bg-gray-500 border-gray-600';
  const IconComponent = nodeIcons[nodeType] || Cog6ToothIcon;

  return (
    <div className="flex flex-col items-center">
      {/* Node Box */}
      <div
        className={`relative shadow-lg rounded-lg border-2 min-w-[80px] min-h-[60px] flex items-center justify-center ${selected ? 'ring-2 ring-blue-400' : ''} ${style}`}
        style={{ width: 80, height: 60 }}
      >
        {/* Handles */}
        <Handle type="target" position={Position.Top} className="w-3 h-3 bg-white border-2 border-gray-400" style={{ top: -6, left: '50%', transform: 'translateX(-50%)' }} id="top" />
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-white border-2 border-gray-400" style={{ right: -6, top: '50%', transform: 'translateY(-50%)' }} id="right" />
        <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-white border-2 border-gray-400" style={{ bottom: -6, left: '50%', transform: 'translateX(-50%)' }} id="bottom" />
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-white border-2 border-gray-400" style={{ left: -6, top: '50%', transform: 'translateY(-50%)' }} id="left" />
        {/* Icon */}
        <IconComponent className="w-7 h-7 text-white" />
      </div>
      {/* Node label & description */}
      <div className="mt-2 text-center">
        <div className="font-semibold text-xs text-gray-800">{data.label || nodeType}</div>
        {data.description && (
          <div className="text-[11px] text-gray-500">{data.description}</div>
        )}
        <div className="text-[10px] text-gray-400 mt-1">{nodeType}</div>
      </div>
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode; 