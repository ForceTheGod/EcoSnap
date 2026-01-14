
export enum WasteCategory {
  ORGANIC = 'Organic',
  PLASTIC = 'Plastic',
  PAPER = 'Paper',
  METAL = 'Metal',
  GLASS = 'Glass',
  E_WASTE = 'E-waste',
  UNKNOWN = 'Unknown'
}

export interface ClassificationResult {
  category: WasteCategory;
  confidence: number;
  label: string;
  reasoning: string;
  disposalInstructions: string;
}

export interface WasteMapping {
  keywords: string[];
  category: WasteCategory;
  instructions: string;
}
