import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { getInitials, getTimeAgo } from "@/lib/utils";
import { Review } from "@/types";
import { StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CoachReviewsProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  distributionPercentages: number[];
}

export function CoachReviews({ 
  reviews, 
  averageRating, 
  totalReviews,
  distributionPercentages
}: CoachReviewsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Ratings & Reviews</CardTitle>
        <div className="flex items-center">
          <StarIcon className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
          <span className="text-sm font-semibold">{averageRating.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground ml-1">({totalReviews} reviews)</span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Rating distribution bars */}
        {[5, 4, 3, 2, 1].map((rating) => (
          <div className="flex items-center mb-1" key={rating}>
            <div className="w-3 text-xs text-right mr-2">{rating}</div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-yellow-400 h-2 rounded-full" 
                style={{ width: `${distributionPercentages[5-rating]}%` }}
              />
            </div>
            <div className="w-8 text-xs ml-2">{distributionPercentages[5-rating]}%</div>
          </div>
        ))}

        <h3 className="font-medium text-sm mt-6 mb-4">Recent Reviews</h3>
        
        {/* Reviews list */}
        {reviews.map((review) => (
          <div className="mb-4" key={review.id}>
            <div className="flex items-center mb-2">
              <div className="avatar w-8 h-8 bg-muted mr-2">
                {getInitials(review.reviewer.name)}
              </div>
              <div>
                <div className="font-medium">{review.reviewer.name}</div>
                <div className="text-xs text-muted-foreground">{getTimeAgo(review.date)}</div>
              </div>
              <div className="ml-auto flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-3 w-3 ${
                      i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted stroke-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm">{review.text}</p>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          View All Reviews
        </Button>
      </CardFooter>
    </Card>
  );
}
