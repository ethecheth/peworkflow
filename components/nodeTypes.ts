export const NODE_TYPES = [
  'Config',
  'OracleDb',
  'MariaDb',
  'NAS',
  'Server',
  'ProcedureOracle',
  'Schedule',
  'Code',
  'Mail',
  'Web',
  'IF',
  'Switch',
  'HttpRequest',
] as const;
export type NodeType = (typeof NODE_TYPES)[number];
