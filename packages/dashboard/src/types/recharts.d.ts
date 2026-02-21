// Recharts 2.x has incomplete React 19 type support.
// Override to allow JSX usage without type errors.
declare module 'recharts' {
  import { ComponentType } from 'react';

  export const AreaChart: ComponentType<any>;
  export const Area: ComponentType<any>;
  export const XAxis: ComponentType<any>;
  export const YAxis: ComponentType<any>;
  export const Tooltip: ComponentType<any>;
  export const ResponsiveContainer: ComponentType<any>;
  export const PieChart: ComponentType<any>;
  export const Pie: ComponentType<any>;
  export const Cell: ComponentType<any>;
  export const BarChart: ComponentType<any>;
  export const Bar: ComponentType<any>;
}
