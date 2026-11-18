import React from 'react';
import * as Opening from './Opening';
import * as Formula from './Formula';
import * as Docs from './Docs';
import * as Data from './Data';
import * as Life from './Life';
import * as Scenes from '../three/Scenes';

export const REGISTRY: Record<string, React.FC<any>> = {
  ...(Opening as any),
  ...(Formula as any),
  ...(Docs as any),
  ...(Data as any),
  ...(Life as any),
  ...(Scenes as any),
};
