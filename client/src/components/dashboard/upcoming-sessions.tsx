import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTime } from "@/lib/utils";
import { Session } from "@/types";

interface UpcomingSessionsProps {
  sessions: Session[];
}

export function UpcomingSessions({ sessions }: UpcomingSessionsProps) {
  // Group sessions by day (today, tomorrow, future)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const groupedSessions = sessions.reduce(
    (acc, session) => {
      const sessionDate = new Date(session.startTime);
      sessionDate.setHours(0, 0, 0, 0);
      
      if (sessionDate.getTime() === today.getTime()) {
        acc.today.push(session);
      } else if (sessionDate.getTime() === tomorrow.getTime()) {
        acc.tomorrow.push(session);
      } else {
        const day = sessionDate.toLocaleDateString("en-US", {
          weekday: "short",
          day: "numeric",
          month: "short",
        });
        
        if (!acc.future[day]) {
          acc.future[day] = [];
        }
        
        acc.future[day].push(session);
      }
      
      return acc;
    },
    { today: [] as Session[], tomorrow: [] as Session[], future: {} as Record<string, Session[]> }
  );

  return (
    <Card>
      <CardHeader className="flex justify-between items-center pb-2">
        <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
        <a href="/schedule" className="text-xs text-primary">
          Full Calendar <i className="fas fa-chevron-right ml-1"></i>
        </a>
      </CardHeader>
      <CardContent>
        {groupedSessions.today.length > 0 && (
          <>
            <h4 className="text-xs font-medium uppercase text-muted-foreground mb-2">Today</h4>
            {groupedSessions.today.map((session) => (
              <SessionItem key={session.id} session={session} />
            ))}
          </>
        )}
        
        {groupedSessions.tomorrow.length > 0 && (
          <>
            <h4 className="text-xs font-medium uppercase text-muted-foreground mb-2 mt-4">Tomorrow</h4>
            {groupedSessions.tomorrow.map((session) => (
              <SessionItem key={session.id} session={session} />
            ))}
          </>
        )}
        
        {Object.entries(groupedSessions.future).map(([day, daySessions]) => (
          <div key={day}>
            <h4 className="text-xs font-medium uppercase text-muted-foreground mb-2 mt-4">{day}</h4>
            {daySessions.map((session) => (
              <SessionItem key={session.id} session={session} />
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SessionItem({ session }: { session: Session }) {
  return (
    <div className="flex mb-4 border-l-2 border-secondary pl-2">
      <div className="flex-1">
        <div className="font-medium text-sm">
          {formatTime(session.startTime)} - {session.title}
        </div>
        <div className="text-xs text-muted-foreground">
          {session.athlete.name}
        </div>
      </div>
      <button className="text-muted hover:text-foreground">
        <i className="far fa-eye"></i>
      </button>
    </div>
  );
}
