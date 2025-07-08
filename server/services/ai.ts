import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

export interface PitchAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  categories: string[];
  urgency: 'low' | 'medium' | 'high';
  businessType: string;
  summary: string;
  isSpam: boolean;
}

export interface BusinessTypeDetection {
  detectedType: string;
  confidence: number;
  suggestedTypes: string[];
}

// Analyze pitch content using AI
export async function analyzePitch(pitchContent: string, businessName: string): Promise<PitchAnalysis> {
  try {
    // Sentiment analysis
    const sentimentResult = await hf.textClassification({
      model: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
      inputs: pitchContent
    });

    // Get the top sentiment
    const topSentiment = sentimentResult[0];
    const sentiment = topSentiment.label.toLowerCase() as 'positive' | 'neutral' | 'negative';

    // Business type detection from content
    const businessType = await detectBusinessType(pitchContent, businessName);

    // Spam detection
    const isSpam = await detectSpam(pitchContent);

    // Generate summary
    const summary = await generateSummary(pitchContent);

    // Determine urgency based on keywords
    const urgency = determineUrgency(pitchContent);

    // Extract categories
    const categories = await extractCategories(pitchContent);

    return {
      sentiment,
      confidence: topSentiment.score,
      categories,
      urgency,
      businessType: businessType.detectedType,
      summary,
      isSpam
    };
  } catch (error) {
    console.error('Error analyzing pitch:', error);
    // Return default analysis if AI fails
    return {
      sentiment: 'neutral',
      confidence: 0.5,
      categories: ['general'],
      urgency: 'medium',
      businessType: 'Unknown',
      summary: pitchContent.substring(0, 100) + '...',
      isSpam: false
    };
  }
}

// Detect business type from content
export async function detectBusinessType(content: string, businessName: string): Promise<BusinessTypeDetection> {
  try {
    const businessTypes = [
      'Home Improvement', 'Solar Energy', 'Security Systems', 'Landscaping',
      'HVAC', 'Roofing', 'Insurance', 'Real Estate', 'Pest Control',
      'Window/Siding', 'Internet/Cable', 'Water Treatment', 'Cleaning Services',
      'Lawn Care', 'Tree Services', 'Painting', 'Flooring', 'Kitchen/Bath Remodeling',
      'Electrical', 'Plumbing', 'Concrete/Masonry', 'Gutter Services',
      'Pool Services', 'Moving Services', 'Appliance Repair', 'Handyman Services'
    ];

    // Use zero-shot classification to detect business type
    const result = await hf.zeroShotClassification({
      model: 'facebook/bart-large-mnli',
      inputs: `${businessName} ${content}`,
      parameters: {
        candidate_labels: businessTypes
      }
    });

    return {
      detectedType: result.labels[0],
      confidence: result.scores[0],
      suggestedTypes: result.labels.slice(0, 3)
    };
  } catch (error) {
    console.error('Error detecting business type:', error);
    return {
      detectedType: 'Other',
      confidence: 0.5,
      suggestedTypes: ['Other']
    };
  }
}

// Generate intelligent summary of pitch
export async function generateSummary(content: string): Promise<string> {
  try {
    const result = await hf.summarization({
      model: 'facebook/bart-large-cnn',
      inputs: content,
      parameters: {
        max_length: 100,
        min_length: 30
      }
    });

    return result.summary_text;
  } catch (error) {
    console.error('Error generating summary:', error);
    return content.substring(0, 100) + '...';
  }
}

// Detect spam/inappropriate content
export async function detectSpam(content: string): Promise<boolean> {
  try {
    const result = await hf.textClassification({
      model: 'martin-ha/toxic-comment-model',
      inputs: content
    });

    // Check if content is classified as toxic/spam
    const toxicScore = result.find(r => r.label === 'TOXIC')?.score || 0;
    return toxicScore > 0.7; // Threshold for spam detection
  } catch (error) {
    console.error('Error detecting spam:', error);
    return false;
  }
}

// Extract categories from content
async function extractCategories(content: string): Promise<string[]> {
  const categories = ['urgent', 'discount', 'limited-time', 'consultation', 'estimate', 'maintenance', 'repair', 'installation', 'upgrade'];
  
  try {
    const result = await hf.zeroShotClassification({
      model: 'facebook/bart-large-mnli',
      inputs: content,
      parameters: {
        candidate_labels: categories
      }
    });

    // Return categories with confidence > 0.3
    return result.labels.filter((_, index) => result.scores[index] > 0.3);
  } catch (error) {
    console.error('Error extracting categories:', error);
    return ['general'];
  }
}

// Determine urgency based on content
function determineUrgency(content: string): 'low' | 'medium' | 'high' {
  const urgentKeywords = ['urgent', 'emergency', 'immediate', 'asap', 'today', 'now'];
  const mediumKeywords = ['soon', 'this week', 'limited time', 'offer expires'];
  
  const lowerContent = content.toLowerCase();
  
  if (urgentKeywords.some(keyword => lowerContent.includes(keyword))) {
    return 'high';
  } else if (mediumKeywords.some(keyword => lowerContent.includes(keyword))) {
    return 'medium';
  }
  
  return 'low';
}

// Generate personalized response suggestions for homeowners
export async function generateResponseSuggestions(pitchAnalysis: PitchAnalysis): Promise<string[]> {
  const suggestions = [];
  
  if (pitchAnalysis.sentiment === 'positive' && pitchAnalysis.confidence > 0.7) {
    suggestions.push("Thank you for your professional approach. I'm interested in learning more.");
    suggestions.push("This sounds promising. Could you provide more details about pricing?");
  } else if (pitchAnalysis.urgency === 'high') {
    suggestions.push("I appreciate the urgency, but I need time to consider this properly.");
    suggestions.push("Could you schedule a follow-up call to discuss this further?");
  } else {
    suggestions.push("Thank you for the information. I'll review it and get back to you.");
    suggestions.push("I'm not interested at this time, but thank you for reaching out.");
  }
  
  return suggestions;
}

// Enhance business matching for service providers
export async function enhanceBusinessMatching(serviceProvider: any, homeownerPreferences: any): Promise<number> {
  try {
    // Use semantic similarity to match business offerings with homeowner needs
    const businessDescription = `${serviceProvider.businessType} ${serviceProvider.businessName}`;
    const homeownerNeeds = homeownerPreferences.interests || 'general home services';
    
    // This would use sentence similarity models in a real implementation
    // For now, we'll use a simplified matching algorithm
    const match = calculateSimpleMatch(businessDescription, homeownerNeeds);
    
    return match;
  } catch (error) {
    console.error('Error enhancing business matching:', error);
    return 0.5; // Default moderate match
  }
}

function calculateSimpleMatch(business: string, needs: string): number {
  const businessWords = business.toLowerCase().split(/\s+/);
  const needsWords = needs.toLowerCase().split(/\s+/);
  
  let matches = 0;
  businessWords.forEach(word => {
    if (needsWords.some(need => need.includes(word) || word.includes(need))) {
      matches++;
    }
  });
  
  return Math.min(matches / businessWords.length, 1);
}