
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { WasteCategory, ClassificationResult } from '../types';
import { WASTE_MAPPINGS, UNKNOWN_INSTRUCTIONS } from '../constants';

/**
 * WasteClassifier service
 * Handles the lifecycle of the MobileNet model and provides 
 * classification logic using rule-based mapping for deterministic results.
 */
class WasteClassifier {
  private model: mobilenet.MobileNet | null = null;
  private isModelLoading: boolean = false;

  /**
   * Loads the MobileNet model if not already loaded.
   */
  public async loadModel(): Promise<void> {
    if (this.model) return;
    if (this.isModelLoading) return;

    this.isModelLoading = true;
    try {
      // Ensure the TF backend is ready
      await tf.ready();
      
      // Load MobileNet v2 for better accuracy/size balance
      this.model = await mobilenet.load({
        version: 2,
        alpha: 1.0
      });
      console.log('MobileNet model loaded successfully using ESM.');
    } catch (error) {
      console.error('Error loading MobileNet model:', error);
      throw new Error('Failed to initialize AI model. Please check your internet connection.');
    } finally {
      this.isModelLoading = false;
    }
  }

  /**
   * Classifies a File object.
   * Logic: File -> URL -> Image (Decoded) -> MobileNet -> Label Mapping -> Result
   */
  public async classify(file: File): Promise<ClassificationResult> {
    await this.loadModel();

    if (!this.model) {
      throw new Error('Model not initialized properly.');
    }

    const imageUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = imageUrl;

    try {
      // Using decode() ensures the image is fully ready for TF.js to consume
      await img.decode();
      
      const predictions = await this.model.classify(img);
      
      // Cleanup the object URL immediately after classification
      URL.revokeObjectURL(imageUrl);

      if (!predictions || predictions.length === 0) {
        return this.getUnknownResult();
      }

      // Process the top prediction (MobileNet returns sorted by probability)
      const topResult = predictions[0];
      return this.mapLabelToWaste(topResult.className, topResult.probability);
    } catch (err) {
      URL.revokeObjectURL(imageUrl);
      console.error('Classification error:', err);
      throw new Error('Could not process this image. Try a different file format.');
    }
  }

  /**
   * Maps an ImageNet label to our specific waste categories.
   */
  private mapLabelToWaste(label: string, confidence: number): ClassificationResult {
    const lowerLabel = label.toLowerCase();
    
    // Iterate through mappings and find a match
    for (const mapping of WASTE_MAPPINGS) {
      const match = mapping.keywords.find(keyword => lowerLabel.includes(keyword));
      if (match) {
        return {
          category: mapping.category,
          confidence,
          label: label,
          reasoning: `Matched object detected as '${label}' which is categorized as ${mapping.category}.`,
          disposalInstructions: mapping.instructions
        };
      }
    }

    // Default to unknown if no keywords matched
    return this.getUnknownResult(label, confidence);
  }

  private getUnknownResult(label: string = 'Unknown Item', confidence: number = 0): ClassificationResult {
    return {
      category: WasteCategory.UNKNOWN,
      confidence,
      label,
      reasoning: `The detected object '${label}' doesn't match common waste categories in our database.`,
      disposalInstructions: UNKNOWN_INSTRUCTIONS
    };
  }
}

export const wasteClassifier = new WasteClassifier();
