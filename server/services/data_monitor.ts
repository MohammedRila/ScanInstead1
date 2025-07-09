import { performDataIntelligenceAnalysis } from "./ai";
import { storage } from "../storage";

interface DataMonitoringStats {
  totalEntries: number;
  cleanupCandidates: number;
  duplicatesFound: number;
  anomaliesDetected: number;
  lastAnalysis: Date;
}

class DataMonitoringService {
  private stats: DataMonitoringStats = {
    totalEntries: 0,
    cleanupCandidates: 0,
    duplicatesFound: 0,
    anomaliesDetected: 0,
    lastAnalysis: new Date()
  };

  // Background data intelligence monitoring
  async performBackgroundAnalysis() {
    try {
      console.log('🔍 Starting background data intelligence analysis...');
      
      // Get all homeowners to analyze their data
      const homeowners = await this.getAllHomeowners();
      let totalAnalyzed = 0;
      
      for (const homeowner of homeowners) {
        try {
          const pitches = await storage.getPitchesByHomeowner(homeowner.id);
          
          if (pitches.pitches && pitches.pitches.length > 0) {
            // Perform comprehensive analysis
            const analysis = await performDataIntelligenceAnalysis(pitches.pitches);
            
            // Update statistics
            this.updateStats(analysis);
            
            // Log significant findings
            if (analysis.anomalies?.anomalies.length > 0) {
              console.log(`🚨 Anomalies detected for homeowner ${homeowner.id}:`, 
                analysis.anomalies.anomalies);
            }
            
            if (analysis.deduplication?.duplicates.length > 0) {
              console.log(`🔁 Duplicates found for homeowner ${homeowner.id}:`, 
                analysis.deduplication.duplicates.length);
            }
            
            totalAnalyzed++;
          }
        } catch (error) {
          console.error(`Error analyzing data for homeowner ${homeowner.id}:`, error);
        }
      }
      
      console.log(`✅ Background analysis completed. Analyzed ${totalAnalyzed} datasets.`);
      this.stats.lastAnalysis = new Date();
      
    } catch (error) {
      console.error('Background analysis failed:', error);
    }
  }

  private async getAllHomeowners(): Promise<any[]> {
    // This would need to be implemented based on your storage system
    // For now, return empty array as Firebase doesn't have a direct way to get all homeowners
    return [];
  }

  private updateStats(analysis: any) {
    if (analysis.cleanup?.cleanup_stats) {
      this.stats.totalEntries += analysis.cleanup.cleanup_stats.total_entries || 0;
      this.stats.cleanupCandidates += analysis.cleanup.cleanup_stats.flagged_entries || 0;
    }
    
    if (analysis.deduplication?.deduplication_stats) {
      this.stats.duplicatesFound += analysis.deduplication.deduplication_stats.duplicate_groups || 0;
    }
    
    if (analysis.anomalies?.anomaly_stats) {
      this.stats.anomaliesDetected += analysis.anomalies.anomaly_stats.total_anomalies || 0;
    }
  }

  // Auto-cleanup service
  async performAutoCleanup() {
    console.log('🧹 Starting auto-cleanup process...');
    
    try {
      // This would implement actual cleanup logic
      // For now, just log what would be cleaned
      console.log('Auto-cleanup completed. Stats:', this.stats);
    } catch (error) {
      console.error('Auto-cleanup failed:', error);
    }
  }

  // Get monitoring statistics
  getStats(): DataMonitoringStats {
    return { ...this.stats };
  }

  // Start monitoring service
  startMonitoring() {
    console.log('🚀 Starting data intelligence monitoring service...');
    
    // Run background analysis every 30 minutes
    setInterval(() => {
      this.performBackgroundAnalysis();
    }, 30 * 60 * 1000);
    
    // Run auto-cleanup every 24 hours
    setInterval(() => {
      this.performAutoCleanup();
    }, 24 * 60 * 60 * 1000);
    
    // Initial analysis
    setTimeout(() => {
      this.performBackgroundAnalysis();
    }, 10000); // Wait 10 seconds after startup
  }
}

export const dataMonitor = new DataMonitoringService();