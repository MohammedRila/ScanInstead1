import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Users, Calendar, TrendingUp, Target, MapPin } from "lucide-react";

export default function SalesmanDashboard() {
  const { id } = useParams<{ id: string }>();

  // Fetch salesman data and scan history
  const { data: salesman, isLoading: salesmanLoading, refetch: refetchSalesman } = useQuery({
    queryKey: [`/api/salesman/${id}`],
    enabled: !!id,
    refetchInterval: 10000, // Refetch every 10 seconds to update verification status
  });

  const { data: scanHistory, isLoading: scansLoading } = useQuery({
    queryKey: [`/api/salesman/${id}/scans`],
    enabled: !!id,
  });

  const { data: stats } = useQuery({
    queryKey: [`/api/salesman/${id}/stats`],
    enabled: !!id,
  });

  if (salesmanLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-gray-900 dark:via-orange-900/20 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-orange-200 border-t-orange-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BarChart className="h-8 w-8 text-orange-600 animate-pulse" />
            </div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!salesman) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Account Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300">Please register to access your dashboard.</p>
        </div>
      </div>
    );
  }

  const todayScans = stats?.todayScans || 0;
  const weekScans = stats?.weekScans || 0;
  const monthScans = stats?.monthScans || 0;
  const totalScans = salesman.totalScans || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-gray-900 dark:via-orange-900/20 dark:to-gray-800 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-12">
          <div className="mb-4 lg:mb-0">
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl w-16 h-16 flex items-center justify-center shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Welcome back, {salesman.firstName}!
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  {salesman.businessName} • {salesman.businessType}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className={`px-4 py-2 text-sm font-medium ${
              salesman.isVerified 
                ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" 
                : "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300"
            }`}>
              {salesman.isVerified ? "✅ Verified" : "⏳ Pending Verification"}
            </Badge>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{totalScans}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Scans</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl w-12 h-12 flex items-center justify-center shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{todayScans}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Today's Scans</div>
                </div>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">QR codes scanned today</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl w-12 h-12 flex items-center justify-center shadow-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">{weekScans}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">This Week</div>
                </div>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">Scans this week</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl w-12 h-12 flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{monthScans}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">This Month</div>
                </div>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Monthly performance</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl w-12 h-12 flex items-center justify-center shadow-lg">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{totalScans}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Scans</div>
                </div>
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">All-time total</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Scans */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Scans
            </CardTitle>
            <CardDescription>
              Your latest QR code scans and interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scansLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
                <p className="text-gray-600 dark:text-gray-300">Loading scan history...</p>
              </div>
            ) : scanHistory && scanHistory.length > 0 ? (
              <div className="space-y-4">
                {scanHistory.map((scan: any) => (
                  <div key={scan.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium">Scan #{scan.id.slice(-8)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(scan.scannedAt).toLocaleDateString()} at{' '}
                          {new Date(scan.scannedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {scan.location || "Location not recorded"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Scans Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Start scanning QR codes in your neighborhood to see your activity here.
                </p>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Find QR Codes to Scan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and helpful resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Target className="h-6 w-6" />
                <span>Scan QR Code</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <BarChart className="h-6 w-6" />
                <span>View Analytics</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Users className="h-6 w-6" />
                <span>Update Profile</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}