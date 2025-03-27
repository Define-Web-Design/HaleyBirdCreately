
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function UserAnalytics() {
  const { data: analyticsData } = useQuery({
    queryKey: ['/api/analytics'],
    enabled: true,
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Creative Journey Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData?.engagementTrends || []}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="creativePoints" fill="#8884d8" />
              <Bar dataKey="interactions" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
