
export interface BrainContent {
  label: string;
  percentage: number;
}

export interface BodyStatus {
  label: string;
  value: string;
  percentage: number;
  color: 'cyan' | 'orange' | 'red';
}

export interface EquipmentItem {
  name: string;
  description: string;
}

export interface Callout {
  point: 'head' | 'eyes' | 'neck' | 'chest' | 'hands';
  title: string;
  desc: string;
}

export interface LifeManualData {
  score: number;
  scoreMessage: string;
  brainContents: BrainContent[];
  bodyStatus: BodyStatus[];
  equipments: EquipmentItem[];
  callouts: Callout[];
  thoughtBubbles: string[];
}

// Added LifeStats interface to resolve "Module '"../types"' has no exported member 'LifeStats'" error
export interface LifeStats {
  strength: number;
  intelligence: number;
  agility: number;
  vitality: number;
  luck: number;
  charisma: number;
}

export type AppState = 'IDLE' | 'UPLOADING' | 'ANALYZING' | 'RESULT';

export type AspectRatio = '1:1' | '3:4' | '4:3';
