export interface FilterConfig {
  field: string;
  type: 'select' | 'number' | 'time' | 'date';
  label: string;
  options?: { label: string, value: string }[];
}
