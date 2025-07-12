import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Wifi, 
  WifiOff, 
  Cloud, 
  CloudOff, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Users, 
  Activity,
  Database,
  Server,
  RefreshCw
} from 'lucide-react';

export type ConnectionStatus = 'online' | 'offline' | 'connecting' | 'syncing' | 'error';

interface StatusIndicatorsProps {
  showConnectionStatus?: boolean;
  showSyncStatus?: boolean;
  showServerStatus?: boolean;
  customStatuses?: Array<{
    label: string;
    status: ConnectionStatus;
    icon?: React.ReactNode;
    timestamp?: Date;
  }>;
}

export function StatusIndicators({ 
  showConnectionStatus = true,
  showSyncStatus = true,
  showServerStatus = true,
  customStatuses = []
}: StatusIndicatorsProps) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('online');
  const [syncStatus, setSyncStatus] = useState<ConnectionStatus>('online');
  const [serverStatus, setServerStatus] = useState<ConnectionStatus>('online');
  const [lastSync, setLastSync] = useState<Date>(new Date());

  // Monitor connection status
  useEffect(() => {
    const updateConnectionStatus = () => {
      setConnectionStatus(navigator.onLine ? 'online' : 'offline');
    };

    updateConnectionStatus();
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);

    return () => {
      window.removeEventListener('online', updateConnectionStatus);
      window.removeEventListener('offline', updateConnectionStatus);
    };
  }, []);

  // Simulate sync status (in real app, this would come from actual sync state)
  useEffect(() => {
    const interval = setInterval(() => {
      if (connectionStatus === 'online') {
        setSyncStatus('syncing');
        setTimeout(() => {
          setSyncStatus('online');
          setLastSync(new Date());
        }, 1000);
      } else {
        setSyncStatus('offline');
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [connectionStatus]);

  // Check server status
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch('/api/health', { 
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        setServerStatus(response.ok ? 'online' : 'error');
      } catch {
        setServerStatus('error');
      }
    };

    checkServerStatus();
    const interval = setInterval(checkServerStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: ConnectionStatus) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'offline':
        return <WifiOff className="h-3 w-3 text-red-600" />;
      case 'connecting':
      case 'syncing':
        return <RefreshCw className="h-3 w-3 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-600" />;
      default:
        return <Clock className="h-3 w-3 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: ConnectionStatus) => {
    switch (status) {
      case 'online':
        return 'default' as const;
      case 'offline':
      case 'error':
        return 'destructive' as const;
      case 'connecting':
      case 'syncing':
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
  };

  const getStatusText = (status: ConnectionStatus, type: string) => {
    switch (status) {
      case 'online':
        return type === 'sync' ? `Synced ${formatTime(lastSync)}` : 'Online';
      case 'offline':
        return 'Offline';
      case 'connecting':
        return 'Connecting...';
      case 'syncing':
        return 'Syncing...';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="flex items-center space-x-2 text-xs">
      {showConnectionStatus && (
        <Badge variant={getStatusVariant(connectionStatus)} className="text-xs">
          {connectionStatus === 'online' ? 
            <Wifi className="h-3 w-3 mr-1" /> : 
            <WifiOff className="h-3 w-3 mr-1" />
          }
          {getStatusText(connectionStatus, 'connection')}
        </Badge>
      )}

      {showSyncStatus && (
        <Badge variant={getStatusVariant(syncStatus)} className="text-xs">
          {syncStatus === 'syncing' ? 
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : 
            <Cloud className="h-3 w-3 mr-1" />
          }
          {getStatusText(syncStatus, 'sync')}
        </Badge>
      )}

      {showServerStatus && (
        <Badge variant={getStatusVariant(serverStatus)} className="text-xs">
          <Server className="h-3 w-3 mr-1" />
          Server {serverStatus === 'online' ? 'Online' : 'Offline'}
        </Badge>
      )}

      {customStatuses.map((customStatus, index) => (
        <Badge key={index} variant={getStatusVariant(customStatus.status)} className="text-xs">
          {customStatus.icon || getStatusIcon(customStatus.status)}
          <span className="ml-1">{customStatus.label}</span>
          {customStatus.timestamp && (
            <span className="ml-1 opacity-75">
              {formatTime(customStatus.timestamp)}
            </span>
          )}
        </Badge>
      ))}
    </div>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'now';
  if (minutes === 1) return '1m ago';
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return '1h ago';
  if (hours < 24) return `${hours}h ago`;
  
  return date.toLocaleDateString();
}

export function SystemStatus() {
  const [systemHealth, setSystemHealth] = useState({
    database: 'online' as ConnectionStatus,
    ai: 'online' as ConnectionStatus,
    email: 'online' as ConnectionStatus,
    storage: 'online' as ConnectionStatus,
  });

  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        const response = await fetch('/api/system-health');
        if (response.ok) {
          const health = await response.json();
          setSystemHealth(health);
        }
      } catch (error) {
        console.error('Failed to check system health:', error);
      }
    };

    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">System Status</h3>
          <Activity className="h-4 w-4 text-gray-500" />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Database</span>
            <Badge variant={getStatusVariant(systemHealth.database)} className="text-xs">
              <Database className="h-3 w-3 mr-1" />
              {systemHealth.database === 'online' ? 'Online' : 'Offline'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">AI Services</span>
            <Badge variant={getStatusVariant(systemHealth.ai)} className="text-xs">
              <RefreshCw className="h-3 w-3 mr-1" />
              {systemHealth.ai === 'online' ? 'Online' : 'Offline'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Email</span>
            <Badge variant={getStatusVariant(systemHealth.email)} className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              {systemHealth.email === 'online' ? 'Online' : 'Offline'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Storage</span>
            <Badge variant={getStatusVariant(systemHealth.storage)} className="text-xs">
              <Cloud className="h-3 w-3 mr-1" />
              {systemHealth.storage === 'online' ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}