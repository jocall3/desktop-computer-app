import React from 'react';

export interface Feature {
  id: string;
  name: string;
  description: string;
  icon: string;
  component?: React.FC<any>;
}

export type ViewType = 'login' | 'dashboard' | 'admin-console' | 'about-atlas';

export interface ViewProps {
  onNavigate: (view: ViewType, props?: any) => void;
}