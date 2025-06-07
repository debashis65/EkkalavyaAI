import { Card, CardContent } from "@/components/ui/card";
import { formatPerformanceChange } from "@/lib/utils";
import { Stat } from "@/types";

interface StatsCardProps {
  stat: Stat;
}

export function StatsCard({ stat }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                stat.changeType === 'increase' ? 'bg-primary/10 text-primary' :
                stat.changeType === 'decrease' ? 'bg-danger/10 text-danger' :
                'bg-accent/10 text-accent'
              }`}
            >
              <i className={`fas ${stat.icon}`}></i>
            </div>
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </div>
          
          {stat.change !== 0 && (
            <div className={`text-xs font-medium ${
              stat.changeType === 'increase' ? 'text-primary' :
              stat.changeType === 'decrease' ? 'text-danger' :
              'text-accent'
            }`}>
              <i className={`fas fa-arrow-${stat.changeType === 'increase' ? 'up' : 'down'} mr-1`}></i>
              {formatPerformanceChange(stat.change)}
            </div>
          )}
        </div>
        
        <div className="text-2xl font-semibold">{stat.value}</div>
      </CardContent>
    </Card>
  );
}
