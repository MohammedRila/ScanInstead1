import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Users, Calendar, TrendingUp, Target, MapPin } from "lucide-react";

export default function SalesmanDashboard() {
  const { id } = useParams<{ id: string }>();

  // Fetch salesman data and scan history
  const { data: salesman, isLoading: salesmanLoading } = useQuery({
    queryKey: [`/api/salesman/${id}`],
    enabled: !!id,
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto mb-4"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {salesman.firstName}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {salesman.businessName} • {salesman.businessType}
            </p>
          </div>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            {salesman.isVerified ? "Verified" : "Pending Verification"}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Scans</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayScans}</div>
              <p className="text-xs text-muted-foreground">QR codes scanned today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{weekScans}</div>
              <p className="text-xs text-muted-foreground">Scans this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthScans}</div>
              <p className="text-xs text-muted-foreground">Scans this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalScans}</div>
              <p className="text-xs text-muted-foreground">All-time scans</p>
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