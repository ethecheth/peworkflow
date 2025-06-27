export const NODE_TYPES = [
  'Config',
  'OracleDb',
  'MariaDb',
  'NAS',
  'Server',
  'ProcedureOracle',
] as const;
export type NodeType = typeof NODE_TYPES[number];
