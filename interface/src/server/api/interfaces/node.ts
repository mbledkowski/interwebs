interface NodeProperties {
  url: string;
  title?: string;
  redirect?: boolean;
}

export interface Node {
  id: number;
  label: string;
  properties: NodeProperties;
}
