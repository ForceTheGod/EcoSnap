
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { WasteCategory, ClassificationResult } from '../types';
import { WASTE_MAPPINGS, UNKNOWN_INSTRUCTIONS } from '../constants';

class WasteClassifier {
  private model: mobilenet.MobileNet | null = null;
  private isModelLoading: boolean = false;

  public async loadModel(): Promise<void> {
    if (this.model) return;
    if (this.isModelLoading) return;

    this.isModelLoading = true;
    try {
      // Initialize TensorFlow.js environment
      await tf.ready();
      // Load the lightweight MobileNet v2 model (approx 15MB)
      this.model = await mobilenet.load({
        version: 2,
        alpha: 1.0
      });
      console.log('Local MobileNet model loaded successfully.');
    } catch (error) {
      console.error('Error loading MobileNet model:', error);
      throw new Error('Failed to initialize local AI engine. Check your internet for the initial download.');
    } finally {
      this.isModelLoading = false;
    }
  }

  public async classifyElement(element: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<ClassificationResult> {
    if (!this.model) {
      await this.loadModel();
    }
    
    if (!this.model) throw new Error('Model initialization failed');

    try {
      // Local inference happens purely on the device CPU/GPU
      const predictions = await this.model.classify(element);
      
      if (!predictions || predictions.length === 0) {
        return this.getUnknownResult();
      }
      
      const topResult = predictions[0];
      return this.mapLabelToWaste(topResult.className, topResult.probability);
    } catch (err) {
      console.error('Inference error:', err);
      throw new Error('Neural analysis failed');
    }
  }

  public async classify(file: File): Promise<ClassificationResult> {
    const imageUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = imageUrl;

    return new Promise((resolve, reject) => {
      img.onload = async () => {
        try {
          const result = await this.classifyElement(img);
          URL.revokeObjectURL(imageUrl);
          resolve(result);
        } catch (err) {
          URL.revokeObjectURL(imageUrl);
          reject(err);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        reject(new Error('Failed to process image file'));
      };
    });
  }

  private mapLabelToWaste(label: string, confidence: number): ClassificationResult {
    const lowerLabel = label.toLowerCase();
    
    // Rule-based mapping from ImageNet labels to our waste categories
    for (const mapping of WASTE_MAPPINGS) {
      const match = mapping.keywords.find(keyword => lowerLabel.includes(keyword.toLowerCase()));
      if (match) {
        return {
          category: mapping.category,
          confidence,
          label: label.split(',')[0], // Take first alias
          reasoning: `Identified as '${label.split(',')[0]}' which typically falls under ${mapping.category}.`,
          disposalInstructions: mapping.instructions
        };
      }
    }
    
    return this.getUnknownResult(label, confidence);
  }

  private getUnknownResult(label: string = 'Unknown Object', confidence: number = 0): ClassificationResult {
    return {
      category: WasteCategory.UNKNOWN,
      confidence,
      label: label.split(',')[0],
      reasoning: `The system detected '${label.split(',')[0]}' but could not match it to a specific waste stream with high confidence.`,
      disposalInstructions: UNKNOWN_INSTRUCTIONS
    };
  }
}

export const wasteClassifier = new WasteClassifier();
