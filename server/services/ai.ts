import { HfInference } from '@huggingface/inference';
import natural from 'natural';
import compromise from 'compromise';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';
// import pdfParse from 'pdf-parse';
import crypto from 'crypto';
import stringSimilarity from 'string-similarity';
import leven from 'leven';
import Sentiment from 'sentiment';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

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
    }).catch(() => {
      // Fallback to rule-based analysis if model is unavailable
      const positiveWords = ['excellent', 'premium', 'professional', 'warranty', 'discount', 'quality', 'experienced', 'trusted'];
      const negativeWords = ['urgent', 'immediate', 'problems', 'damage', 'failing', 'emergency', 'critical'];
      
      const words = pitchContent.toLowerCase().split(' ');
      const positiveCount = words.filter(word => positiveWords.some(pos => word.includes(pos))).length;
      const negativeCount = words.filter(word => negativeWords.some(neg => word.includes(neg))).length;
      
      if (positiveCount > negativeCount) {
        return [{ label: 'POSITIVE', score: 0.7 }];
      } else if (negativeCount > positiveCount) {
        return [{ label: 'NEGATIVE', score: 0.7 }];
      } else {
        return [{ label: 'NEUTRAL', score: 0.6 }];
      }
    });

    // Get the top sentiment
    const topSentiment = sentimentResult[0];
    const sentiment = topSentiment.label.toLowerCase().replace('label_', '') as 'positive' | 'neutral' | 'negative';

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
    console.error('Error detecting business type with AI:', error);
    
    // Fallback to rule-based detection
    const businessKeywords = {
      'Roofing': ['roof', 'roofing', 'shingles', 'gutters', 'leak'],
      'Solar Energy': ['solar', 'panels', 'energy', 'electricity', 'power'],
      'HVAC': ['hvac', 'heating', 'cooling', 'air conditioning', 'furnace'],
      'Security Systems': ['security', 'alarm', 'protection', 'surveillance', 'monitoring'],
      'Landscaping': ['landscape', 'lawn', 'garden', 'trees', 'mowing'],
      'Insurance': ['insurance', 'policy', 'coverage', 'claims', 'protection'],
      'Home Improvement': ['renovation', 'remodel', 'improvement', 'upgrade', 'repair']
    };

    const combinedText = `${businessName} ${content}`.toLowerCase();
    
    for (const [type, keywords] of Object.entries(businessKeywords)) {
      if (keywords.some(keyword => combinedText.includes(keyword))) {
        return {
          detectedType: type,
          confidence: 0.7,
          suggestedTypes: [type]
        };
      }
    }
    
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
    if (toxicScore > 0.7) return true;
  } catch (error) {
    console.error('Error detecting spam with AI model:', error);
  }

  // Fallback to rule-based spam detection
  const spamKeywords = ['win', 'winner', 'prize', 'free money', 'congratulations', 'urgent', 'limited time', 'act now', 'click here', 'selected', 'claim', 'expires', 'no payment', 'cash prize'];
  const lowerContent = content.toLowerCase();
  
  // Check for spam indicators
  const spamIndicators = spamKeywords.filter(keyword => lowerContent.includes(keyword));
  
  // Check for excessive punctuation (multiple exclamation marks)
  const excessivePunctuation = (content.match(/!!!+/g) || []).length > 2;
  
  // Check for ALL CAPS words
  const allCapsWords = content.split(' ').filter(word => word.length > 3 && word === word.toUpperCase());
  const excessiveCaps = allCapsWords.length > 5;
  
  // Consider spam if multiple indicators present
  return spamIndicators.length >= 3 || excessivePunctuation || excessiveCaps;
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

// ==== HIDDEN AI FEATURES WITH OBFUSCATED NAMES ====

// In-memory cache for duplicate detection
const contentCache = new Map<string, { hash: string; content: string; timestamp: number }>();

// 1. Duplicate Detection (match_lvl)
export function detectDuplicates(content: string): number {
  const contentHash = crypto.createHash('md5').update(content.toLowerCase()).digest('hex');
  
  let maxSimilarity = 0;
  for (const [, cached] of contentCache) {
    // Use string similarity for content comparison
    const similarity = stringSimilarity.compareTwoStrings(content.toLowerCase(), cached.content.toLowerCase());
    maxSimilarity = Math.max(maxSimilarity, similarity);
    
    // Also check Levenshtein distance for fuzzy matching
    const distance = leven(content.toLowerCase(), cached.content.toLowerCase());
    const fuzzyScore = 1 - (distance / Math.max(content.length, cached.content.length));
    maxSimilarity = Math.max(maxSimilarity, fuzzyScore);
  }
  
  // Store in cache
  contentCache.set(contentHash, { hash: contentHash, content: content.toLowerCase(), timestamp: Date.now() });
  
  // Clean old entries (older than 7 days)
  const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  for (const [hash, data] of contentCache) {
    if (data.timestamp < weekAgo) {
      contentCache.delete(hash);
    }
  }
  
  return maxSimilarity;
}

// 2. Advanced Sentiment Analysis (s_flag)
export function advancedSentimentAnalysis(content: string): number {
  const sentiment = new Sentiment();
  const result = sentiment.analyze(content);
  
  // Convert to 0-1 scale where 0.5 is neutral, 0 is very negative, 1 is very positive
  const normalizedScore = (result.score + 10) / 20; // Adjust range based on typical sentiment scores
  return Math.max(0, Math.min(1, normalizedScore));
}

// 3. Intent Detection (i_tag)
export function detectIntent(content: string): string {
  const intents = {
    'sales': ['buy', 'purchase', 'offer', 'deal', 'price', 'cost', 'estimate', 'quote'],
    'consultation': ['free', 'consultation', 'assessment', 'evaluation', 'inspection'],
    'urgency': ['urgent', 'immediate', 'emergency', 'asap', 'today', 'right now'],
    'maintenance': ['maintenance', 'service', 'repair', 'fix', 'problem', 'issue'],
    'upgrade': ['upgrade', 'improve', 'better', 'new', 'latest', 'modern'],
    'warranty': ['warranty', 'guarantee', 'insurance', 'protection', 'coverage'],
    'followup': ['follow', 'callback', 'schedule', 'appointment', 'meeting']
  };
  
  const lowerContent = content.toLowerCase();
  const scores = Object.entries(intents).map(([intent, keywords]) => {
    const count = keywords.filter(keyword => lowerContent.includes(keyword)).length;
    return { intent, score: count };
  });
  
  const topIntent = scores.reduce((max, current) => current.score > max.score ? current : max);
  return topIntent.score > 0 ? topIntent.intent : 'general';
}

// 4. Enhanced Urgency Detection (u_score)
export function detectUrgencyScore(content: string): number {
  const urgencyIndicators = {
    high: ['urgent', 'emergency', 'immediate', 'asap', 'critical', 'today', 'right now', 'expires today'],
    medium: ['soon', 'this week', 'limited time', 'offer expires', 'while supplies last'],
    low: ['schedule', 'convenient', 'when ready', 'no rush', 'flexible']
  };
  
  const lowerContent = content.toLowerCase();
  let score = 0.5; // Base neutral score
  
  // Check for high urgency indicators
  const highCount = urgencyIndicators.high.filter(word => lowerContent.includes(word)).length;
  const mediumCount = urgencyIndicators.medium.filter(word => lowerContent.includes(word)).length;
  const lowCount = urgencyIndicators.low.filter(word => lowerContent.includes(word)).length;
  
  score += (highCount * 0.3) + (mediumCount * 0.2) - (lowCount * 0.1);
  return Math.max(0, Math.min(1, score));
}

// 5. Keyword Extraction (k_meta)
export function extractKeywords(content: string): string {
  // Use compromise for NLP processing
  const doc = compromise(content);
  
  // Extract key terms
  const people = doc.people().out('array');
  const places = doc.places().out('array');
  const organizations = doc.organizations().out('array');
  const topics = doc.topics().out('array');
  const nouns = doc.nouns().out('array');
  const adjectives = doc.adjectives().out('array');
  
  // Use natural for additional processing
  const tokens = natural.WordTokenizer.tokenize(content.toLowerCase());
  const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'are', 'as', 'was', 'were', 'been', 'be']);
  const filteredTokens = tokens.filter(token => !stopWords.has(token) && token.length > 2);
  
  // Calculate TF-IDF style importance
  const frequency = {};
  filteredTokens.forEach(token => {
    frequency[token] = (frequency[token] || 0) + 1;
  });
  
  const keywords = {
    entities: { people, places, organizations },
    topics: topics.slice(0, 5),
    important_terms: Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word),
    descriptors: adjectives.slice(0, 5),
    key_nouns: nouns.slice(0, 10)
  };
  
  return JSON.stringify(keywords);
}

// Advanced keyword extraction using Python components (hidden from reverse engineering)
export async function extractAdvancedKeywords(content: string): Promise<any> {
  try {
    const { PythonShell } = await import('python-shell');
    
    const options = {
      mode: 'text' as const,
      pythonOptions: ['-u'],
      scriptPath: './server/services/',
      args: [content]
    };
    
    return new Promise((resolve, reject) => {
      PythonShell.run('keyword_extraction.py', options, (err, results) => {
        if (err) {
          console.error('Advanced keyword extraction error:', err);
          resolve({
            rake_keywords: [],
            yake_keywords: [],
            tfidf_keywords: [],
            keybert_keywords: [],
            combined_keywords: []
          });
        } else {
          try {
            const result = JSON.parse(results?.[0] || '{}');
            resolve(result);
          } catch (parseError) {
            console.error('Parse error in keyword extraction:', parseError);
            resolve({
              rake_keywords: [],
              yake_keywords: [],
              tfidf_keywords: [],
              keybert_keywords: [],
              combined_keywords: []
            });
          }
        }
      });
    });
  } catch (error) {
    console.error('Advanced keyword extraction initialization error:', error);
    return {
      rake_keywords: [],
      yake_keywords: [],
      tfidf_keywords: [],
      keybert_keywords: [],
      combined_keywords: []
    };
  }
}

// 6. OCR Text Extraction (xtext)
export async function extractTextFromFile(fileBuffer: Buffer, mimeType: string): Promise<string> {
  try {
    if (mimeType.includes('pdf')) {
      // PDF text extraction - dynamically import to avoid startup issues
      try {
        const pdfParse = await import('pdf-parse');
        const pdfData = await pdfParse.default(fileBuffer);
        return pdfData.text;
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        return 'PDF text extraction temporarily unavailable';
      }
    } else if (mimeType.includes('image')) {
      // OCR for images using Tesseract
      const { data: { text } } = await Tesseract.recognize(fileBuffer, 'eng');
      return text;
    }
    return '';
  } catch (error) {
    console.error('OCR extraction error:', error);
    return '';
  }
}

// 7. Pattern Matching (rscore)
export function calculatePatternScore(content: string): number {
  const patterns = [
    /\b\d{3}-\d{3}-\d{4}\b/g, // Phone numbers
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Emails
    /\b(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/\S*)?\b/g, // URLs
    /\$\d+(?:,\d{3})*(?:\.\d{2})?/g, // Money amounts
    /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, // Dates
  ];
  
  let patternCount = 0;
  patterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) patternCount += matches.length;
  });
  
  // Normalize based on content length
  return Math.min(1, patternCount / (content.length / 100));
}

// 8. Click Timing Analysis (clickT and b_prob)
export function analyzeClickTiming(timestamps: number[]): { clickT: number; b_prob: number } {
  if (timestamps.length < 2) {
    return { clickT: 0, b_prob: 0 };
  }
  
  const intervals = [];
  for (let i = 1; i < timestamps.length; i++) {
    intervals.push(timestamps[i] - timestamps[i - 1]);
  }
  
  const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
  
  // Bot detection: very consistent timing or extremely fast clicking
  const consistencyScore = 1 - Math.min(1, variance / 1000); // Less variance = more bot-like
  const speedScore = avgInterval < 500 ? 1 : 0; // Very fast clicking
  
  const botProbability = (consistencyScore + speedScore) / 2;
  
  return {
    clickT: avgInterval,
    b_prob: botProbability
  };
}

// 9. Next Action Prediction (n_pred)
export function predictNextAction(content: string, previousActions: string[] = []): string {
  const actionKeywords = {
    'schedule_callback': ['call', 'callback', 'schedule', 'talk', 'discuss'],
    'request_quote': ['quote', 'estimate', 'price', 'cost', 'how much'],
    'book_consultation': ['consultation', 'visit', 'come out', 'look at', 'assess'],
    'request_info': ['information', 'details', 'learn more', 'tell me', 'explain'],
    'decline_politely': ['not interested', 'no thanks', 'maybe later', 'not now'],
    'report_spam': ['spam', 'scam', 'suspicious', 'fake', 'not real']
  };
  
  const lowerContent = content.toLowerCase();
  const scores = Object.entries(actionKeywords).map(([action, keywords]) => {
    const count = keywords.filter(keyword => lowerContent.includes(keyword)).length;
    return { action, score: count };
  });
  
  const topAction = scores.reduce((max, current) => current.score > max.score ? current : max);
  return topAction.score > 0 ? topAction.action : 'read_and_consider';
}

// 10. Conversion Probability (c_prob)
export function calculateConversionProbability(analysis: any): number {
  let score = 0.5; // Base probability
  
  // Positive sentiment increases conversion
  if (analysis.sentiment === 'positive') score += 0.2;
  else if (analysis.sentiment === 'negative') score -= 0.3;
  
  // High urgency can increase conversion
  if (analysis.urgency === 'high') score += 0.1;
  else if (analysis.urgency === 'low') score -= 0.1;
  
  // Professional content increases conversion
  if (analysis.isSpam) score -= 0.4;
  
  // Business type relevance
  const highValueBusinessTypes = ['Solar Energy', 'HVAC', 'Roofing', 'Security Systems'];
  if (highValueBusinessTypes.includes(analysis.businessType)) score += 0.15;
  
  return Math.max(0, Math.min(1, score));
}

// Comprehensive Analysis Function
export async function performHiddenAnalysis(content: string, fileBuffer?: Buffer, mimeType?: string, clickTimestamps?: number[]): Promise<any> {
  const extractedText = fileBuffer && mimeType ? await extractTextFromFile(fileBuffer, mimeType) : '';
  const fullContent = content + ' ' + extractedText;
  
  // Advanced keyword extraction (hidden from reverse engineering)
  const advancedKeywords = await extractAdvancedKeywords(fullContent);
  
  const hiddenAnalysis = {
    match_lvl: detectDuplicates(content),
    s_flag: advancedSentimentAnalysis(content),
    i_tag: detectIntent(content),
    u_score: detectUrgencyScore(content),
    k_meta: extractKeywords(content),
    xtext: extractedText,
    rscore: calculatePatternScore(fullContent),
    ...clickTimestamps ? analyzeClickTiming(clickTimestamps) : { clickT: 0, b_prob: 0 },
    n_pred: predictNextAction(content),
    // Advanced keyword extraction results (obfuscated field names)
    kw_rake: advancedKeywords.rake_keywords || [],
    kw_yake: advancedKeywords.yake_keywords || [],
    kw_tfidf: advancedKeywords.tfidf_keywords || [],
    kw_bert: advancedKeywords.keybert_keywords || [],
    kw_combined: advancedKeywords.combined_keywords || []
  };
  
  // Calculate conversion probability after other analysis
  hiddenAnalysis.c_prob = calculateConversionProbability({
    sentiment: hiddenAnalysis.s_flag > 0.6 ? 'positive' : hiddenAnalysis.s_flag < 0.4 ? 'negative' : 'neutral',
    urgency: hiddenAnalysis.u_score > 0.7 ? 'high' : hiddenAnalysis.u_score > 0.4 ? 'medium' : 'low',
    isSpam: hiddenAnalysis.b_prob > 0.7
  });
  
  return hiddenAnalysis;
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