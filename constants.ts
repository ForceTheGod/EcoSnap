
import { WasteCategory, WasteMapping } from './types';

export const WASTE_MAPPINGS: WasteMapping[] = [
  {
    category: WasteCategory.ORGANIC,
    keywords: ['banana', 'apple', 'orange', 'lemon', 'fruit', 'vegetable', 'strawberry', 'pineapple', 'food', 'corn', 'broccoli', 'cabbage', 'bread', 'meat', 'egg'],
    instructions: 'Compost if possible, otherwise place in the organic/green bin. Remove any plastic stickers from fruits.'
  },
  {
    category: WasteCategory.PLASTIC,
    keywords: ['bottle', 'water bottle', 'plastic bag', 'shampoo', 'detergent', 'container', 'jug', 'plastic'],
    instructions: 'Rinse and dry before recycling. Ensure it belongs to supported plastic types (usually #1, #2, #5).'
  },
  {
    category: WasteCategory.PAPER,
    keywords: ['paper', 'envelope', 'carton', 'cardboard', 'box', 'book', 'magazine', 'notebook', 'newspaper'],
    instructions: 'Keep dry and flat. Remove any plastic lining or metal components. Do not recycle paper soiled with grease (like pizza boxes).'
  },
  {
    category: WasteCategory.METAL,
    keywords: ['can', 'tin', 'aluminum', 'foil', 'brass', 'iron', 'steel', 'metal', 'screw', 'hammer'],
    instructions: 'Rinse and dry. Aluminum and steel cans are highly recyclable. Crumple foil into a ball (at least 2 inches wide).'
  },
  {
    category: WasteCategory.GLASS,
    keywords: ['glass', 'wine bottle', 'beer bottle', 'jar', 'mason jar', 'goblet', 'beaker'],
    instructions: 'Rinse and remove caps. Dispose in the glass bin. Avoid mixing with ceramics or heat-resistant glass like Pyrex.'
  },
  {
    category: WasteCategory.E_WASTE,
    keywords: ['phone', 'mobile', 'computer', 'laptop', 'keyboard', 'mouse', 'battery', 'remote', 'electronics', 'circuit', 'tablet'],
    instructions: 'Must be taken to a specialized e-waste collection center. Do not throw in regular trash or recycling bins.'
  }
];

export const UNKNOWN_INSTRUCTIONS = "Item not recognized. Please check your local waste authority guidelines or try taking a clearer photo from a different angle.";
