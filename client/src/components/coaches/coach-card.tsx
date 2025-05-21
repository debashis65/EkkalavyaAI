import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarIcon } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { User } from "@/types";
import { Link } from "react-router-dom";

interface CoachCardProps {
  coach: User;
}

export function CoachCard({ coach }: CoachCardProps) {
  const { id, name, rating = 0, sports, students = 0, experience = "" } = coach;

  return (
    <Card className="overflow-hidden">
      <div className="bg-secondary h-24 relative"></div>
      <CardContent className="pt-0 -mt-12">
        <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center">
          <div className="avatar w-24 h-24 border-2 border-secondary bg-secondary/20 text-secondary-foreground mb-2">
            <span className="text-xl">{getInitials(name)}</span>
          </div>
          <div className="w-4 h-4 bg-success rounded-full -mt-3 border-2 border-white"></div>
          
          <h2 className="text-xl font-semibold mt-2">{name}</h2>
          <div className="flex items-center mt-1">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(rating) 
                      ? "text-yellow-400 fill-yellow-400" 
                      : i < rating 
                        ? "text-yellow-400 fill-yellow-400 opacity-50" 
                        : "text-muted stroke-muted"
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm">{rating.toFixed(1)} ({students})</span>
          </div>
          
          <p className="text-muted-foreground mt-1 text-center">
            {sports.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" & ")} Coach • Elite Level
          </p>
          
          <div className="flex justify-center space-x-6 mt-3 text-sm">
            <div className="flex items-center">
              <i className="far fa-clock text-secondary mr-1"></i>
              <span>{experience}</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-users text-secondary mr-1"></i>
              <span>{students} Athletes</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-certificate text-secondary mr-1"></i>
              <span>Certified</span>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2 w-full">
            <Button asChild variant="secondary" className="flex-1">
              <Link to={`/coach/${id}`}>View Profile</Link>
            </Button>
            <Button className="flex-1">
              Book Session
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
