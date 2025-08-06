import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Image, 
  Code, 
  Search, 
  Activity, 
  Shield, 
  Monitor,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Performance test function
const runPerformanceTest = async (url: string) => {
  const start = performance.now();
  
  try {
    const response = await fetch(url);
    const loadTime = performance.now() - start;
    
    return {
      success: true,
      loadTime: Math.round(loadTime),
      status: response.status,
      size: response.headers.get('content-length') || 'unknown'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      loadTime: null
    };
  }
};

export default function AdminPerformance() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testResults, setTestResults] = useState(null);
  const [isTestingPerformance, setIsTestingPerformance] = useState(false);

  // Fetch current performance settings
  const { data: performanceSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/performance-settings"],
    queryFn: async () => {
      const response = await fetch('/api/performance-settings');
      if (!response.ok) throw new Error('Failed to fetch performance settings');
      return response.json();
    },
  });

  // Fetch performance metrics history
  const { data: metricsHistory } = useQuery({
    queryKey: ["/api/performance-metrics"],
    queryFn: async () => {
      const response = await fetch('/api/performance-metrics?limit=10');
      if (!response.ok) throw new Error('Failed to fetch performance metrics');
      return response.json();
    },
  });

  // Update performance settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      return apiRequest("/api/performance-settings", {
        method: "PATCH",
        body: JSON.stringify(settings),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/performance-settings"] });
      toast({
        title: "Performance instellingen bijgewerkt",
        description: "De wijzigingen zijn opgeslagen.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Fout bij opslaan",
        description: error.message || "Er is een fout opgetreden bij het opslaan.",
      });
    },
  });

  // Record performance metrics mutation
  const recordMetricsMutation = useMutation({
    mutationFn: async (metrics: any) => {
      return apiRequest("/api/performance-metrics", {
        method: "POST",
        body: JSON.stringify(metrics),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/performance-metrics"] });
    },
  });

  const handleSettingChange = (key: string, value: any) => {
    const updatedSettings = { ...performanceSettings, [key]: value };
    updateSettingsMutation.mutate({ [key]: value });
  };

  const runPerformanceTestSuite = async () => {
    setIsTestingPerformance(true);
    
    try {
      const testUrl = window.location.origin;
      const result = await runPerformanceTest(testUrl);
      
      setTestResults(result);
      
      // Record metrics in database
      if (result.success) {
        recordMetricsMutation.mutate({
          url: testUrl,
          loadTime: result.loadTime,
          testType: 'manual',
          userAgent: navigator.userAgent,
          notes: 'Manual performance test from admin panel'
        });
      }
      
      toast({
        title: result.success ? "Performance test voltooid" : "Performance test gefaald",
        description: result.success 
          ? `Laadtijd: ${result.loadTime}ms` 
          : result.error,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Test fout",
        description: "Er is een fout opgetreden tijdens de performance test.",
      });
    } finally {
      setIsTestingPerformance(false);
    }
  };

  if (settingsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Instellingen</h1>
          <p className="text-gray-600 mt-2">
            Configureer website snelheid, caching en optimalisaties
          </p>
        </div>
        <Button 
          onClick={runPerformanceTestSuite}
          disabled={isTestingPerformance}
          className="flex items-center gap-2"
        >
          <Activity className="h-4 w-4" />
          {isTestingPerformance ? "Testen..." : "Performance Test"}
        </Button>
      </div>

      {/* Performance Test Results */}
      {testResults && (
        <Card className={testResults.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {testResults.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              Performance Test Resultaat
            </CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.success ? (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Laadtijd</Label>
                  <div className="text-2xl font-bold text-green-600">
                    {testResults.loadTime}ms
                  </div>
                </div>
                <div>
                  <Label>HTTP Status</Label>
                  <Badge variant="outline">{testResults.status}</Badge>
                </div>
                <div>
                  <Label>Grootte</Label>
                  <div className="text-sm">{testResults.size} bytes</div>
                </div>
              </div>
            ) : (
              <div className="text-red-600">
                <strong>Fout:</strong> {testResults.error}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="caching" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="caching" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Caching
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Afbeeldingen
          </TabsTrigger>
          <TabsTrigger value="code" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Code
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Monitoring
          </TabsTrigger>
        </TabsList>

        {/* Caching Settings */}
        <TabsContent value="caching" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Browser Caching
              </CardTitle>
              <CardDescription>
                Configureer hoe lang browsers bestanden mogen cachen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Static Asset Caching</Label>
                  <p className="text-sm text-gray-600">Cache CSS, JS, en afbeeldingen</p>
                </div>
                <Switch
                  checked={performanceSettings?.enableStaticCaching || false}
                  onCheckedChange={(checked) => handleSettingChange('enableStaticCaching', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Cache Duur (seconden)</Label>
                <div className="px-3">
                  <Slider
                    value={[performanceSettings?.browserCacheDuration || 31536000]}
                    onValueChange={(value) => handleSettingChange('browserCacheDuration', value[0])}
                    max={31536000}
                    min={3600}
                    step={3600}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 uur</span>
                    <span>{Math.round((performanceSettings?.browserCacheDuration || 31536000) / 86400)} dagen</span>
                    <span>1 jaar</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Image Optimization */}
        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Afbeelding Optimalisatie
              </CardTitle>
              <CardDescription>
                Configureer afbeelding compressie en laadgedrag
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Lazy Loading</Label>
                  <p className="text-sm text-gray-600">Laad afbeeldingen alleen wanneer zichtbaar</p>
                </div>
                <Switch
                  checked={performanceSettings?.enableLazyLoading || false}
                  onCheckedChange={(checked) => handleSettingChange('enableLazyLoading', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>WebP Conversie</Label>
                  <p className="text-sm text-gray-600">Gebruik moderne afbeelding formaten</p>
                </div>
                <Switch
                  checked={performanceSettings?.enableWebpConversion || false}
                  onCheckedChange={(checked) => handleSettingChange('enableWebpConversion', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Compressie Level (1-100)</Label>
                <div className="px-3">
                  <Slider
                    value={[performanceSettings?.imageCompressionLevel || 80]}
                    onValueChange={(value) => handleSettingChange('imageCompressionLevel', value[0])}
                    max={100}
                    min={1}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Hoogste compressie</span>
                    <span>{performanceSettings?.imageCompressionLevel || 80}%</span>
                    <span>Beste kwaliteit</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Code Optimization */}
        <TabsContent value="code" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Code Optimalisatie
              </CardTitle>
              <CardDescription>
                JavaScript en CSS optimalisaties
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Minification</Label>
                  <p className="text-sm text-gray-600">Comprimeer CSS en JavaScript</p>
                </div>
                <Switch
                  checked={performanceSettings?.enableMinification || false}
                  onCheckedChange={(checked) => handleSettingChange('enableMinification', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Gzip Compressie</Label>
                  <p className="text-sm text-gray-600">Comprimeer alle tekstbestanden</p>
                </div>
                <Switch
                  checked={performanceSettings?.enableGzipCompression || false}
                  onCheckedChange={(checked) => handleSettingChange('enableGzipCompression', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Code Splitting</Label>
                  <p className="text-sm text-gray-600">Splits JavaScript bundles voor snellere loading</p>
                </div>
                <Switch
                  checked={performanceSettings?.enableCodeSplitting || false}
                  onCheckedChange={(checked) => handleSettingChange('enableCodeSplitting', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Settings */}
        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                SEO Optimalisaties
              </CardTitle>
              <CardDescription>
                Structured data en social media optimalisaties
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Structured Data</Label>
                  <p className="text-sm text-gray-600">JSON-LD schema voor Google</p>
                </div>
                <Switch
                  checked={performanceSettings?.enableStructuredData || false}
                  onCheckedChange={(checked) => handleSettingChange('enableStructuredData', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Open Graph Tags</Label>
                  <p className="text-sm text-gray-600">Facebook en social media previews</p>
                </div>
                <Switch
                  checked={performanceSettings?.enableOpenGraph || false}
                  onCheckedChange={(checked) => handleSettingChange('enableOpenGraph', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Twitter Cards</Label>
                  <p className="text-sm text-gray-600">Twitter-specifieke previews</p>
                </div>
                <Switch
                  checked={performanceSettings?.enableTwitterCards || false}
                  onCheckedChange={(checked) => handleSettingChange('enableTwitterCards', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Headers */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Headers
              </CardTitle>
              <CardDescription>
                Beveiligingsinstellingen en headers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>HSTS (HTTP Strict Transport Security)</Label>
                  <p className="text-sm text-gray-600">Forceer HTTPS verbindingen</p>
                </div>
                <Switch
                  checked={performanceSettings?.enableHsts || false}
                  onCheckedChange={(checked) => handleSettingChange('enableHsts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Content Security Policy</Label>
                  <p className="text-sm text-gray-600">Bescherming tegen XSS aanvallen</p>
                </div>
                <Switch
                  checked={performanceSettings?.enableCsp || false}
                  onCheckedChange={(checked) => handleSettingChange('enableCsp', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>X-Frame-Options</Label>
                  <p className="text-sm text-gray-600">Clickjacking bescherming</p>
                </div>
                <Switch
                  checked={performanceSettings?.enableXFrameOptions || false}
                  onCheckedChange={(checked) => handleSettingChange('enableXFrameOptions', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Monitoring */}
        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Performance Monitoring
              </CardTitle>
              <CardDescription>
                Bewaking van website snelheid en prestaties
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Performance Monitoring</Label>
                  <p className="text-sm text-gray-600">Track laadtijden en Core Web Vitals</p>
                </div>
                <Switch
                  checked={performanceSettings?.enablePerformanceMonitoring || false}
                  onCheckedChange={(checked) => handleSettingChange('enablePerformanceMonitoring', checked)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>PageSpeed Drempel</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={performanceSettings?.pagespeedThreshold || 80}
                    onChange={(e) => handleSettingChange('pagespeedThreshold', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-gray-600">Alert bij score onder deze waarde</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Laadtijd Drempel (ms)</Label>
                  <Input
                    type="number"
                    min="500"
                    max="10000"
                    value={performanceSettings?.loadTimeThreshold || 3000}
                    onChange={(e) => handleSettingChange('loadTimeThreshold', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-gray-600">Alert bij laadtijd boven deze waarde</p>
                </div>
              </div>

              {/* Performance History */}
              {metricsHistory && metricsHistory.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Recente Performance Tests
                  </h4>
                  <div className="space-y-2">
                    {metricsHistory.slice(0, 5).map((metric: any) => (
                      <div key={metric.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{metric.url}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(metric.createdAt).toLocaleString('nl-NL')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{metric.loadTime}ms</div>
                          {metric.pagespeedScore && (
                            <Badge variant={metric.pagespeedScore >= 80 ? "default" : "destructive"}>
                              {metric.pagespeedScore}/100
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}