import { Request, Response } from 'express';
import { realtimeStorage } from '../db/supabase';

export async function getHomeownerAnalytics(req: Request, res: Response) {
  try {
    const { homeownerId } = req.params;
    
    if (!homeownerId) {
      return res.status(400).json({ error: 'Homeowner ID is required' });
    }

    const analytics = await realtimeStorage.getHomeownerAnalytics(homeownerId);
    
    if (!analytics) {
      return res.status(500).json({ error: 'Unable to fetch analytics' });
    }

    // Process analytics data
    const processedAnalytics = {
      totalPitches: analytics.length,
      sentimentBreakdown: {
        positive: analytics.filter(p => p.sentiment === 'positive').length,
        neutral: analytics.filter(p => p.sentiment === 'neutral').length,
        negative: analytics.filter(p => p.sentiment === 'negative').length,
      },
      urgencyBreakdown: {
        high: analytics.filter(p => p.urgency === 'high').length,
        medium: analytics.filter(p => p.urgency === 'medium').length,
        low: analytics.filter(p => p.urgency === 'low').length,
      },
      businessTypes: [...new Set(analytics.map(p => p.detected_business_type).filter(Boolean))],
      recentActivity: analytics.slice(0, 10)
    };

    res.json(processedAnalytics);
  } catch (error) {
    console.error('Error fetching homeowner analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getSalesmanLeaderboard(req: Request, res: Response) {
  try {
    const leaderboard = await realtimeStorage.getSalesmanLeaderboard();
    
    if (!leaderboard) {
      return res.status(500).json({ error: 'Unable to fetch leaderboard' });
    }

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getRealtimeStats(req: Request, res: Response) {
  try {
    const stats = await realtimeStorage.getRealtimeStats();
    
    if (!stats) {
      return res.status(500).json({ error: 'Unable to fetch real-time stats' });
    }

    res.json(stats);
  } catch (error) {
    console.error('Error fetching real-time stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}