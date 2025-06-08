import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";
import { User } from "@/types";
import { StarIcon } from "lucide-react";

interface CoachLeaderboardProps {
  coaches: User[];
}

export function CoachLeaderboard({ coaches }: CoachLeaderboardProps) {
  // Sort coaches by rating (highest first)
  const sortedCoaches = [...coaches].sort((a, b) => {
    if (a.rating && b.rating) {
      return b.rating - a.rating;
    }
    return 0;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Coaches Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedCoaches.slice(0, 4).map((coach, index) => (
          <div className="flex items-center py-3 border-b last:border-0" key={coach.id}>
            <div className="text-sm font-bold w-6 text-center">{index + 1}</div>
            <div className="avatar w-10 h-10 bg-muted-foreground/10 ml-2 mr-3">
              {getInitials(coach.name)}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{coach.name}</div>
              <div className="text-xs text-muted-foreground capitalize">
                {coach.sports[0]}
              </div>
            </div>
            <div className="flex items-center">
              <StarIcon className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
              <span className="text-sm font-semibold">{coach.rating?.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground ml-1">
                {coach.students} athletes
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
