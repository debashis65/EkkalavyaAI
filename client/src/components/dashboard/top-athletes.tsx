import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInitials, formatPerformanceChange } from "@/lib/utils";
import { AthletePerformance } from "@/types";
import { Link } from "react-router-dom";

interface TopAthletesProps {
  athletes: AthletePerformance[];
}

export function TopAthletes({ athletes }: TopAthletesProps) {
  // Sort athletes by improvement (highest first)
  const sortedAthletes = [...athletes].sort((a, b) => b.improvement - a.improvement);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Top Athletes This Week</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedAthletes.map((athlete, index) => (
          <div className="flex items-center mb-3" key={athlete.id}>
            <div className="avatar w-10 h-10 mr-3 bg-secondary/10 text-secondary-foreground relative">
              <span>{getInitials(athlete.athlete.name)}</span>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-secondary rounded-full text-white text-xs flex items-center justify-center">
                {index + 1}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{athlete.athlete.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{athlete.sport}</div>
                </div>
                <div className="text-xs text-primary font-medium">
                  {formatPerformanceChange(athlete.improvement)}
                </div>
              </div>
              <div className="mt-1 h-1 bg-muted rounded-full">
                <div
                  className="h-1 bg-primary rounded-full"
                  style={{ width: `${Math.min(100, 70 + athlete.improvement)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
        <Link
          to="/analytics"
          className="mt-4 block py-2 text-center text-sm text-secondary border border-secondary/30 rounded-lg hover:bg-secondary/10"
        >
          Explore All Athletes
        </Link>
      </CardContent>
    </Card>
  );
}
