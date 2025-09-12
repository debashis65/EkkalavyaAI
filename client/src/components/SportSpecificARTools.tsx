import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWebSocketAnalysis } from "@/hooks/useWebSocketAnalysis";
import { Camera, Play, Square, Target, TrendingUp, Award, Clock } from "lucide-react";

// Import all AR tracker components
import { ArcheryTracker } from "./ar-tools/archery-tracker";
import { SwimmingTracker } from "./ar-tools/swimming-tracker";
import { BasketballTracker } from "./ar-tools/basketball-tracker";
import { FootballTracker } from "./ar-tools/football-tracker";
import { CricketTracker } from "./ar-tools/cricket-tracker";
import { TennisTracker } from "./ar-tools/tennis-tracker";
import { BadmintonTracker } from "./ar-tools/badminton-tracker";
import { VolleyballTracker } from "./ar-tools/volleyball-tracker";
import { AthleticsTracker } from "./ar-tools/athletics-tracker";
import { BoxingTracker } from "./ar-tools/boxing-tracker";

interface SportConfig {
  name: string;
  analysisTypes: string[];
  keyMetrics: string[];
  commonDrills: Array<{
    name: string;
    description: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    duration: string;
  }>;
  tips: string[];
}

const SPORT_CONFIGS: Record<string, SportConfig> = {
  basketball: {
    name: "Basketball",
    analysisTypes: ["Shooting Form", "Dribbling", "Defensive Stance", "Free Throw"],
    keyMetrics: ["Shot Accuracy", "Release Point", "Follow Through", "Balance"],
    commonDrills: [
      { name: "Form Shooting", description: "Perfect your shooting mechanics close to the basket", difficulty: "Beginner", duration: "15 min" },
      { name: "Spot Shooting", description: "Practice shots from specific positions on court", difficulty: "Intermediate", duration: "20 min" },
      { name: "Game Speed Shooting", description: "Shooting under pressure with movement", difficulty: "Advanced", duration: "25 min" }
    ],
    tips: ["Keep your elbow under the ball", "Follow through with a flick of the wrist", "Use your legs for power"]
  },
  archery: {
    name: "Archery",
    analysisTypes: ["Draw Technique", "Anchor Point", "Release", "Follow Through", "Stance"],
    keyMetrics: ["Draw Length", "Anchor Consistency", "Sight Alignment", "Release Timing"],
    commonDrills: [
      { name: "Blank Bale", description: "Focus on form without target pressure", difficulty: "Beginner", duration: "15 min" },
      { name: "Close Range Precision", description: "Build accuracy at short distance", difficulty: "Intermediate", duration: "20 min" },
      { name: "Competition Simulation", description: "Practice under pressure", difficulty: "Advanced", duration: "30 min" }
    ],
    tips: ["Consistent anchor point", "Smooth release without punching", "Follow through naturally"]
  },
  football: {
    name: "Football",
    analysisTypes: ["Passing", "Shooting", "Dribbling", "Heading", "Defending"],
    keyMetrics: ["Ball Control", "Passing Accuracy", "Shot Power", "First Touch"],
    commonDrills: [
      { name: "Wall Passes", description: "Improve passing accuracy and first touch", difficulty: "Beginner", duration: "15 min" },
      { name: "Cone Dribbling", description: "Enhance ball control through obstacles", difficulty: "Intermediate", duration: "20 min" },
      { name: "1v1 Finishing", description: "Improve shooting under pressure", difficulty: "Advanced", duration: "25 min" }
    ],
    tips: ["Keep the ball close when dribbling", "Use both feet equally", "Practice with both power and placement"]
  },
  cricket: {
    name: "Cricket",
    analysisTypes: ["Batting Stance", "Bowling Action", "Fielding Position", "Shot Selection", "Footwork", "Wicket Keeping"],
    keyMetrics: ["Batting Average", "Bowling Speed", "Footwork", "Shot Power", "Field Position", "Reaction Time"],
    commonDrills: [
      { name: "Net Practice", description: "Batting and bowling in controlled environment", difficulty: "Beginner", duration: "30 min" },
      { name: "Throw Downs", description: "Quick bowling practice for accuracy", difficulty: "Intermediate", duration: "20 min" },
      { name: "Match Simulation", description: "Full game scenario practice", difficulty: "Advanced", duration: "45 min" }
    ],
    tips: ["Watch the ball onto the bat", "Keep your head steady", "Use your feet to get to the pitch"]
  },
  swimming: {
    name: "Swimming",
    analysisTypes: ["Freestyle Stroke", "Backstroke", "Breaststroke", "Butterfly", "Turns", "Breathing"],
    keyMetrics: ["Stroke Rate", "Distance Per Stroke", "Body Position", "Breathing Pattern", "Kick Technique", "Turn Efficiency"],
    commonDrills: [
      { name: "Catch-Up Freestyle", description: "One arm at a time to perfect technique", difficulty: "Beginner", duration: "10 min" },
      { name: "Bilateral Breathing", description: "Alternate breathing sides for balance", difficulty: "Intermediate", duration: "15 min" },
      { name: "High Elbow Catch", description: "Maximize water catch efficiency", difficulty: "Advanced", duration: "20 min" }
    ],
    tips: ["Maintain streamlined body position", "High elbow catch for efficiency", "Breathe bilaterally"]
  },
  athletics: {
    name: "Athletics",
    analysisTypes: ["Running Form", "Start Technique", "Pace Strategy", "Breathing Rhythm", "Stride Length"],
    keyMetrics: ["Speed", "Endurance", "Form Efficiency", "Cadence", "Ground Contact Time", "Vertical Oscillation"],
    commonDrills: [
      { name: "A-Skip Drills", description: "High knee running mechanics", difficulty: "Beginner", duration: "10 min" },
      { name: "Interval Training", description: "Speed and endurance building", difficulty: "Intermediate", duration: "25 min" },
      { name: "Race Pace Runs", description: "Competition simulation", difficulty: "Advanced", duration: "40 min" }
    ],
    tips: ["Land midfoot under your center of gravity", "Maintain slight forward lean", "Keep arms relaxed"]
  },
  volleyball: {
    name: "Volleyball",
    analysisTypes: ["Serving", "Spiking", "Setting", "Blocking", "Passing", "Court Movement"],
    keyMetrics: ["Attack Success", "Serve Accuracy", "Block Height", "Dig Success", "Set Precision", "Jump Height"],
    commonDrills: [
      { name: "Pepper Drill", description: "Basic passing and hitting practice", difficulty: "Beginner", duration: "15 min" },
      { name: "Blocking Footwork", description: "Improve blocking technique and timing", difficulty: "Intermediate", duration: "20 min" },
      { name: "6v6 Scrimmage", description: "Full team play simulation", difficulty: "Advanced", duration: "30 min" }
    ],
    tips: ["Keep your arms straight when passing", "Follow through on your spike", "Stay low for better reaction time"]
  },
  tennis: {
    name: "Tennis",
    analysisTypes: ["Forehand", "Backhand", "Serve", "Volley", "Return", "Footwork"],
    keyMetrics: ["Serve Speed", "Stroke Power", "Court Coverage", "Shot Accuracy", "Spin Rate", "Recovery Time"],
    commonDrills: [
      { name: "Shadow Swings", description: "Practice form without ball", difficulty: "Beginner", duration: "10 min" },
      { name: "Fed Ball Rally", description: "Consistent groundstroke practice", difficulty: "Intermediate", duration: "20 min" },
      { name: "Live Ball Points", description: "Match simulation practice", difficulty: "Advanced", duration: "30 min" }
    ],
    tips: ["Turn your shoulders early", "Keep your eye on the ball", "Follow through across your body"]
  },
  badminton: {
    name: "Badminton",
    analysisTypes: ["Clear Shot", "Drop Shot", "Smash", "Serve", "Net Play", "Footwork"],
    keyMetrics: ["Smash Speed", "Shot Placement", "Reaction Time", "Court Coverage", "Serve Accuracy", "Rally Length"],
    commonDrills: [
      { name: "Multi-shuttle Feeding", description: "Rapid shot practice", difficulty: "Beginner", duration: "15 min" },
      { name: "Footwork Patterns", description: "Court movement optimization", difficulty: "Intermediate", duration: "20 min" },
      { name: "Match Play", description: "Competitive game simulation", difficulty: "Advanced", duration: "30 min" }
    ],
    tips: ["Use wrist snap for power", "Stay light on your feet", "Aim for deep corners"]
  },
  squash: {
    name: "Squash",
    analysisTypes: ["Drive Shot", "Drop Shot", "Boast", "Volley", "Serve", "Court Position"],
    keyMetrics: ["Shot Accuracy", "Ball Speed", "Court Coverage", "Rally Length", "Serve Placement", "Reaction Time"],
    commonDrills: [
      { name: "Solo Practice", description: "Hit against front wall continuously", difficulty: "Beginner", duration: "15 min" },
      { name: "Length Practice", description: "Deep shots to back corners", difficulty: "Intermediate", duration: "20 min" },
      { name: "Condition Games", description: "Restricted area games", difficulty: "Advanced", duration: "25 min" }
    ],
    tips: ["Keep the ball tight to the wall", "Move to T-position after each shot", "Use height variation"]
  },
  gymnastics: {
    name: "Gymnastics",
    analysisTypes: ["Floor Routine", "Vault", "Bars", "Beam", "Rings", "Tumbling"],
    keyMetrics: ["Form Score", "Landing Stability", "Execution", "Difficulty", "Artistry", "Consistency"],
    commonDrills: [
      { name: "Basic Positions", description: "Perfect fundamental body positions", difficulty: "Beginner", duration: "20 min" },
      { name: "Skill Progressions", description: "Break down complex skills", difficulty: "Intermediate", duration: "30 min" },
      { name: "Routine Practice", description: "Full routine with music", difficulty: "Advanced", duration: "40 min" }
    ],
    tips: ["Point your toes", "Keep your core tight", "Land with bent knees"]
  },
  yoga: {
    name: "Yoga",
    analysisTypes: ["Asana Form", "Breathing", "Balance", "Flexibility", "Flow Sequence", "Meditation"],
    keyMetrics: ["Alignment", "Flexibility Range", "Balance Time", "Breathing Depth", "Hold Duration", "Flow Smoothness"],
    commonDrills: [
      { name: "Sun Salutation", description: "Classic flow sequence", difficulty: "Beginner", duration: "10 min" },
      { name: "Standing Poses", description: "Build strength and balance", difficulty: "Intermediate", duration: "20 min" },
      { name: "Advanced Inversions", description: "Challenging inverted poses", difficulty: "Advanced", duration: "30 min" }
    ],
    tips: ["Focus on your breath", "Listen to your body", "Progress gradually"]
  },
  table_tennis: {
    name: "Table Tennis",
    analysisTypes: ["Forehand Drive", "Backhand Drive", "Serve", "Topspin", "Block", "Footwork"],
    keyMetrics: ["Ball Speed", "Spin Rate", "Placement Accuracy", "Reaction Time", "Rally Length", "Serve Variation"],
    commonDrills: [
      { name: "Robot Practice", description: "Consistent ball feeding", difficulty: "Beginner", duration: "15 min" },
      { name: "Multi-ball Training", description: "Rapid fire practice", difficulty: "Intermediate", duration: "20 min" },
      { name: "Match Simulation", description: "Competitive point play", difficulty: "Advanced", duration: "30 min" }
    ],
    tips: ["Stay close to the table", "Use your whole body", "Watch the opponent's paddle"]
  },
  cycling: {
    name: "Cycling",
    analysisTypes: ["Pedal Stroke", "Body Position", "Gear Selection", "Climbing", "Sprinting", "Aerodynamics"],
    keyMetrics: ["Power Output", "Cadence", "Speed", "Heart Rate", "Efficiency", "Aerodynamic Position"],
    commonDrills: [
      { name: "Cadence Training", description: "Optimal pedaling rhythm", difficulty: "Beginner", duration: "30 min" },
      { name: "Hill Repeats", description: "Climbing power development", difficulty: "Intermediate", duration: "45 min" },
      { name: "Time Trial", description: "Race pace training", difficulty: "Advanced", duration: "60 min" }
    ],
    tips: ["Maintain consistent cadence", "Keep your upper body relaxed", "Look ahead, not down"]
  },
  long_jump: {
    name: "Long Jump",
    analysisTypes: ["Run-up", "Takeoff", "Flight", "Landing", "Speed Build-up", "Approach Consistency"],
    keyMetrics: ["Takeoff Speed", "Jump Distance", "Flight Time", "Landing Angle", "Run-up Accuracy", "Takeoff Angle"],
    commonDrills: [
      { name: "Mark Running", description: "Practice run-up accuracy", difficulty: "Beginner", duration: "20 min" },
      { name: "Bounding", description: "Build jumping power and rhythm", difficulty: "Intermediate", duration: "25 min" },
      { name: "Full Approach", description: "Complete jump technique", difficulty: "Advanced", duration: "30 min" }
    ],
    tips: ["Hit the board at full speed", "Drive your knee up at takeoff", "Extend legs forward for landing"]
  },
  high_jump: {
    name: "High Jump",
    analysisTypes: ["Approach", "Takeoff", "Bar Clearance", "Landing", "Curve Running", "Rhythm"],
    keyMetrics: ["Jump Height", "Takeoff Angle", "Bar Clearance", "Approach Speed", "Curve Radius", "Rhythm Consistency"],
    commonDrills: [
      { name: "Straight Line Jumps", description: "Basic jumping mechanics", difficulty: "Beginner", duration: "15 min" },
      { name: "Curve Approach", description: "Practice curved run-up", difficulty: "Intermediate", duration: "25 min" },
      { name: "Competition Heights", description: "Jump at personal best heights", difficulty: "Advanced", duration: "35 min" }
    ],
    tips: ["Lean into the curve", "Drive your outside knee up", "Arch your back over the bar"]
  },
  pole_vault: {
    name: "Pole Vault",
    analysisTypes: ["Run-up", "Plant", "Takeoff", "Swing", "Turn", "Bar Clearance"],
    keyMetrics: ["Vault Height", "Run-up Speed", "Plant Accuracy", "Pole Bend", "Turn Timing", "Bar Clearance"],
    commonDrills: [
      { name: "Short Approach", description: "Focus on plant and takeoff", difficulty: "Beginner", duration: "20 min" },
      { name: "Pole Carries", description: "Practice carrying pole while running", difficulty: "Intermediate", duration: "25 min" },
      { name: "Full Vault", description: "Complete vault technique", difficulty: "Advanced", duration: "40 min" }
    ],
    tips: ["Keep the pole tip up during approach", "Plant the pole aggressively", "Stay behind the pole"]
  },
  hurdle: {
    name: "Hurdle",
    analysisTypes: ["Approach", "Takeoff", "Hurdle Clearance", "Landing", "Rhythm", "Sprint Finish"],
    keyMetrics: ["Hurdle Time", "Clearance Height", "Stride Pattern", "Landing Distance", "Rhythm Consistency", "Finish Speed"],
    commonDrills: [
      { name: "Trail Leg Walks", description: "Practice hurdle leg mechanics", difficulty: "Beginner", duration: "15 min" },
      { name: "3-Step Rhythm", description: "Build consistent stride pattern", difficulty: "Intermediate", duration: "20 min" },
      { name: "Full Race", description: "Complete hurdle race simulation", difficulty: "Advanced", duration: "30 min" }
    ],
    tips: ["Attack the hurdle", "Keep your trail leg close", "Sprint through the finish"]
  },
  boxing: {
    name: "Boxing",
    analysisTypes: ["Jab", "Cross", "Hook", "Uppercut", "Defense", "Footwork"],
    keyMetrics: ["Punch Speed", "Power Output", "Accuracy", "Defense Rating", "Footwork Score", "Combination Flow"],
    commonDrills: [
      { name: "Shadow Boxing", description: "Practice combinations without opponent", difficulty: "Beginner", duration: "10 min" },
      { name: "Heavy Bag", description: "Power and technique development", difficulty: "Intermediate", duration: "15 min" },
      { name: "Sparring", description: "Live boxing practice", difficulty: "Advanced", duration: "20 min" }
    ],
    tips: ["Keep your hands up", "Turn your hips with punches", "Stay light on your feet"]
  },
  shotput_throw: {
    name: "Shot Put",
    analysisTypes: ["Stance", "Glide", "Rotation", "Release", "Follow Through", "Power Generation"],
    keyMetrics: ["Throw Distance", "Release Velocity", "Release Angle", "Power Transfer", "Technique Score", "Consistency"],
    commonDrills: [
      { name: "Standing Throws", description: "Focus on release technique", difficulty: "Beginner", duration: "15 min" },
      { name: "Glide Practice", description: "Work on linear movement", difficulty: "Intermediate", duration: "20 min" },
      { name: "Full Technique", description: "Complete throwing motion", difficulty: "Advanced", duration: "30 min" }
    ],
    tips: ["Keep the shot close to your neck", "Drive through your legs", "Follow through across your body"]
  },
  discuss_throw: {
    name: "Discus Throw",
    analysisTypes: ["Stance", "Rotation", "Release", "Follow Through", "Rhythm", "Balance"],
    keyMetrics: ["Throw Distance", "Release Speed", "Release Angle", "Rotation Speed", "Balance Score", "Technique Rating"],
    commonDrills: [
      { name: "Standing Throws", description: "Practice release without rotation", difficulty: "Beginner", duration: "15 min" },
      { name: "Half Turns", description: "Build up rotation gradually", difficulty: "Intermediate", duration: "20 min" },
      { name: "Full Throws", description: "Complete discus technique", difficulty: "Advanced", duration: "30 min" }
    ],
    tips: ["Keep the discus flat", "Build speed gradually", "Release at the highest point"]
  },
  javelin_throw: {
    name: "Javelin Throw",
    analysisTypes: ["Approach", "Crossover", "Delivery", "Release", "Follow Through", "Accuracy"],
    keyMetrics: ["Throw Distance", "Release Velocity", "Release Angle", "Approach Speed", "Technique Score", "Accuracy Rating"],
    commonDrills: [
      { name: "Standing Throws", description: "Focus on delivery mechanics", difficulty: "Beginner", duration: "15 min" },
      { name: "Approach Runs", description: "Practice run-up rhythm", difficulty: "Intermediate", duration: "20 min" },
      { name: "Full Throws", description: "Complete javelin technique", difficulty: "Advanced", duration: "30 min" }
    ],
    tips: ["Keep the javelin tip up", "Pull through with your elbow", "Follow your throw"]
  },
  hockey: {
    name: "Hockey",
    analysisTypes: ["Stick Handling", "Shooting", "Passing", "Checking", "Skating", "Goaltending"],
    keyMetrics: ["Shot Accuracy", "Puck Control", "Skating Speed", "Pass Completion", "Check Success", "Save Percentage"],
    commonDrills: [
      { name: "Stickhandling", description: "Improve puck control skills", difficulty: "Beginner", duration: "15 min" },
      { name: "Shooting Practice", description: "Accuracy and power development", difficulty: "Intermediate", duration: "20 min" },
      { name: "Scrimmage", description: "Full game simulation", difficulty: "Advanced", duration: "30 min" }
    ],
    tips: ["Keep your head up", "Use your edges", "Shoot in stride"]
  },
  wrestling: {
    name: "Wrestling",
    analysisTypes: ["Takedown", "Escape", "Reversal", "Pin", "Defense", "Conditioning"],
    keyMetrics: ["Takedown Success", "Escape Rate", "Control Time", "Pin Success", "Defense Rating", "Endurance Score"],
    commonDrills: [
      { name: "Sprawl Practice", description: "Defensive positioning drills", difficulty: "Beginner", duration: "10 min" },
      { name: "Takedown Drills", description: "Offensive technique practice", difficulty: "Intermediate", duration: "20 min" },
      { name: "Live Wrestling", description: "Full contact practice", difficulty: "Advanced", duration: "25 min" }
    ],
    tips: ["Stay low and balanced", "Control the center", "Never stop moving"]
  },
  judo: {
    name: "Judo",
    analysisTypes: ["Throw Technique", "Groundwork", "Balance", "Grip Fighting", "Timing", "Counter Attack"],
    keyMetrics: ["Throw Success", "Ground Control", "Balance Score", "Grip Strength", "Timing Accuracy", "Counter Rate"],
    commonDrills: [
      { name: "Uchikomi", description: "Repetitive throw practice", difficulty: "Beginner", duration: "15 min" },
      { name: "Randori", description: "Free practice with resistance", difficulty: "Intermediate", duration: "20 min" },
      { name: "Competition", description: "Tournament simulation", difficulty: "Advanced", duration: "30 min" }
    ],
    tips: ["Use your opponent's force", "Keep your center of gravity low", "Practice perfect timing"]
  },
  weightlifting: {
    name: "Weightlifting",
    analysisTypes: ["Snatch", "Clean & Jerk", "Squat", "Deadlift", "Form Analysis", "Power Output"],
    keyMetrics: ["Max Weight", "Power Output", "Form Score", "Speed", "Consistency", "Technical Rating"],
    commonDrills: [
      { name: "Technique Work", description: "Light weight form practice", difficulty: "Beginner", duration: "20 min" },
      { name: "Complex Training", description: "Strength and power combination", difficulty: "Intermediate", duration: "30 min" },
      { name: "Max Attempts", description: "Personal record attempts", difficulty: "Advanced", duration: "40 min" }
    ],
    tips: ["Perfect your form first", "Stay tight throughout the lift", "Drive through your heels"]
  },
  karate: {
    name: "Karate",
    analysisTypes: ["Kata", "Kumite", "Kicks", "Punches", "Blocks", "Stances"],
    keyMetrics: ["Technique Score", "Power Rating", "Speed", "Accuracy", "Form Quality", "Timing"],
    commonDrills: [
      { name: "Basic Techniques", description: "Fundamental movement patterns", difficulty: "Beginner", duration: "15 min" },
      { name: "Combination Practice", description: "Linking techniques together", difficulty: "Intermediate", duration: "20 min" },
      { name: "Sparring", description: "Controlled fighting practice", difficulty: "Advanced", duration: "25 min" }
    ],
    tips: ["Focus on proper form", "Generate power from your hips", "Maintain balance at all times"]
  },
  skating: {
    name: "Skating",
    analysisTypes: ["Forward Stride", "Backward Skating", "Turns", "Stops", "Jumps", "Spins"],
    keyMetrics: ["Speed", "Balance", "Edge Control", "Jump Height", "Spin Speed", "Artistic Score"],
    commonDrills: [
      { name: "Edge Work", description: "Improve balance and control", difficulty: "Beginner", duration: "15 min" },
      { name: "Jump Practice", description: "Work on individual jumps", difficulty: "Intermediate", duration: "20 min" },
      { name: "Program Run", description: "Complete routine practice", difficulty: "Advanced", duration: "30 min" }
    ],
    tips: ["Use your edges", "Keep your core engaged", "Look where you're going"]
  },
  ice_skating: {
    name: "Ice Skating",
    analysisTypes: ["Figure Skating", "Speed Skating", "Ice Dancing", "Hockey Skating", "Jumps", "Spins"],
    keyMetrics: ["Speed", "Technical Score", "Artistic Score", "Jump Quality", "Spin Quality", "Edge Quality"],
    commonDrills: [
      { name: "Stroking", description: "Basic ice skating technique", difficulty: "Beginner", duration: "15 min" },
      { name: "Elements Practice", description: "Individual skill development", difficulty: "Intermediate", duration: "25 min" },
      { name: "Full Program", description: "Complete routine with music", difficulty: "Advanced", duration: "35 min" }
    ],
    tips: ["Bend your knees", "Use deep edges", "Keep your shoulders square"]
  },
  golf: {
    name: "Golf",
    analysisTypes: ["Drive", "Iron Play", "Short Game", "Putting", "Course Management", "Mental Game"],
    keyMetrics: ["Distance", "Accuracy", "Consistency", "Short Game Score", "Putting Average", "Course Score"],
    commonDrills: [
      { name: "Range Practice", description: "Work on swing mechanics", difficulty: "Beginner", duration: "30 min" },
      { name: "Short Game", description: "Chipping and putting practice", difficulty: "Intermediate", duration: "25 min" },
      { name: "Course Play", description: "On-course strategy practice", difficulty: "Advanced", duration: "240 min" }
    ],
    tips: ["Keep your head still", "Follow through to the target", "Practice your short game"]
  },
  kabaddi: {
    name: "Kabaddi",
    analysisTypes: ["Raiding Technique", "Defense Formation", "Tackle Strength", "Escape Skills", "Team Coordination", "Breathing Control"],
    keyMetrics: ["Raid Success", "Tackle Power", "Agility Score", "Breath Control", "Team Sync", "Escape Rate"],
    commonDrills: [
      { name: "Solo Raiding", description: "Individual raiding practice", difficulty: "Beginner", duration: "15 min" },
      { name: "Chain Practice", description: "Team defense coordination", difficulty: "Intermediate", duration: "20 min" },
      { name: "Match Simulation", description: "Full game practice", difficulty: "Advanced", duration: "30 min" }
    ],
    tips: ["Control your breathing", "Stay flexible", "Work as a team"]
  },
  kho_kho: {
    name: "Kho Kho",
    analysisTypes: ["Chasing", "Dodging", "Kho Giving", "Diving", "Direction Change", "Team Strategy"],
    keyMetrics: ["Chase Success", "Dodge Rate", "Reaction Time", "Dive Accuracy", "Direction Speed", "Team Coordination"],
    commonDrills: [
      { name: "Direction Practice", description: "Quick direction changes", difficulty: "Beginner", duration: "15 min" },
      { name: "Chain Coordination", description: "Team movement practice", difficulty: "Intermediate", duration: "20 min" },
      { name: "Match Play", description: "Full game simulation", difficulty: "Advanced", duration: "25 min" }
    ],
    tips: ["Change direction quickly", "Stay alert", "Communicate with teammates"]
  },
  // Para Sports
  para_athletics: {
    name: "Para Athletics",
    analysisTypes: ["Wheelchair Racing", "Adaptive Running", "Field Events", "Classification", "Equipment Check", "Technique"],
    keyMetrics: ["Speed", "Power Output", "Technique Score", "Equipment Efficiency", "Consistency", "Performance Rating"],
    commonDrills: [
      { name: "Push Technique", description: "Wheelchair pushing mechanics", difficulty: "Beginner", duration: "20 min" },
      { name: "Racing Starts", description: "Competition start practice", difficulty: "Intermediate", duration: "25 min" },
      { name: "Race Simulation", description: "Full competition practice", difficulty: "Advanced", duration: "40 min" }
    ],
    tips: ["Maintain rhythm", "Use proper technique", "Train consistently"]
  },
  para_swimming: {
    name: "Para Swimming",
    analysisTypes: ["Adapted Strokes", "Classification", "Starts", "Turns", "Equipment", "Technique"],
    keyMetrics: ["Stroke Efficiency", "Speed", "Technique Score", "Turn Quality", "Start Quality", "Consistency"],
    commonDrills: [
      { name: "Stroke Adaptation", description: "Modified stroke techniques", difficulty: "Beginner", duration: "20 min" },
      { name: "Race Pace", description: "Competition speed training", difficulty: "Intermediate", duration: "30 min" },
      { name: "Competition Prep", description: "Full race simulation", difficulty: "Advanced", duration: "45 min" }
    ],
    tips: ["Focus on your strengths", "Adapt technique to ability", "Train consistently"]
  },
  para_cycling: {
    name: "Para Cycling",
    analysisTypes: ["Hand Cycling", "Tricycle", "Tandem", "Track Cycling", "Road Cycling", "Equipment"],
    keyMetrics: ["Power Output", "Speed", "Efficiency", "Equipment Fit", "Technique Score", "Endurance"],
    commonDrills: [
      { name: "Equipment Setup", description: "Proper bike fitting and setup", difficulty: "Beginner", duration: "30 min" },
      { name: "Power Training", description: "Strength and endurance building", difficulty: "Intermediate", duration: "45 min" },
      { name: "Race Simulation", description: "Competition practice", difficulty: "Advanced", duration: "60 min" }
    ],
    tips: ["Optimize equipment", "Build endurance", "Practice consistently"]
  },
  para_table_tennis: {
    name: "Para Table Tennis",
    analysisTypes: ["Wheelchair Play", "Standing Play", "Serve Adaptation", "Equipment", "Classification", "Strategy"],
    keyMetrics: ["Shot Accuracy", "Speed", "Consistency", "Adaptation Score", "Strategy Rating", "Equipment Efficiency"],
    commonDrills: [
      { name: "Basic Adaptation", description: "Modified techniques for classification", difficulty: "Beginner", duration: "15 min" },
      { name: "Match Play", description: "Competitive practice", difficulty: "Intermediate", duration: "25 min" },
      { name: "Tournament Prep", description: "Competition simulation", difficulty: "Advanced", duration: "35 min" }
    ],
    tips: ["Adapt to your classification", "Focus on consistency", "Use proper equipment"]
  },
  para_badminton: {
    name: "Para Badminton",
    analysisTypes: ["Wheelchair Play", "Standing Play", "Court Coverage", "Shot Adaptation", "Equipment", "Strategy"],
    keyMetrics: ["Shot Power", "Accuracy", "Court Coverage", "Adaptation Score", "Speed", "Consistency"],
    commonDrills: [
      { name: "Court Movement", description: "Adapted court coverage", difficulty: "Beginner", duration: "20 min" },
      { name: "Shot Practice", description: "Modified shot techniques", difficulty: "Intermediate", duration: "25 min" },
      { name: "Match Simulation", description: "Competitive play", difficulty: "Advanced", duration: "30 min" }
    ],
    tips: ["Maximize court coverage", "Adapt shots to ability", "Train regularly"]
  },
  para_archery: {
    name: "Para Archery",
    analysisTypes: ["Wheelchair Archery", "Standing Archery", "Equipment", "Sight Alignment", "Release", "Consistency"],
    keyMetrics: ["Accuracy", "Consistency", "Equipment Efficiency", "Technique Score", "Competition Score", "Improvement Rate"],
    commonDrills: [
      { name: "Equipment Setup", description: "Proper equipment configuration", difficulty: "Beginner", duration: "20 min" },
      { name: "Precision Training", description: "Accuracy development", difficulty: "Intermediate", duration: "30 min" },
      { name: "Competition Practice", description: "Tournament simulation", difficulty: "Advanced", duration: "40 min" }
    ],
    tips: ["Set up equipment properly", "Focus on consistency", "Practice regularly"]
  },
  para_powerlifting: {
    name: "Para Powerlifting",
    analysisTypes: ["Bench Press", "Equipment Check", "Classification", "Technique", "Safety", "Competition"],
    keyMetrics: ["Max Weight", "Technique Score", "Safety Rating", "Consistency", "Competition Performance", "Improvement"],
    commonDrills: [
      { name: "Technique Work", description: "Perfect bench press form", difficulty: "Beginner", duration: "25 min" },
      { name: "Strength Training", description: "Progressive overload", difficulty: "Intermediate", duration: "35 min" },
      { name: "Competition Prep", description: "Meet simulation", difficulty: "Advanced", duration: "45 min" }
    ],
    tips: ["Perfect your technique", "Train safely", "Follow classification rules"]
  },
  para_rowing: {
    name: "Para Rowing",
    analysisTypes: ["Adaptive Rowing", "Equipment", "Stroke Technique", "Boat Balance", "Racing", "Training"],
    keyMetrics: ["Stroke Rate", "Power Output", "Boat Speed", "Technique Score", "Balance", "Endurance"],
    commonDrills: [
      { name: "Technique Work", description: "Adaptive rowing technique", difficulty: "Beginner", duration: "30 min" },
      { name: "Power Training", description: "Strength and endurance", difficulty: "Intermediate", duration: "40 min" },
      { name: "Race Practice", description: "Competition simulation", difficulty: "Advanced", duration: "50 min" }
    ],
    tips: ["Adapt technique to ability", "Focus on power", "Train consistently"]
  },
  para_canoe: {
    name: "Para Canoe",
    analysisTypes: ["Adaptive Paddling", "Equipment", "Technique", "Racing", "Training", "Classification"],
    keyMetrics: ["Speed", "Technique Score", "Power Output", "Equipment Efficiency", "Consistency", "Race Performance"],
    commonDrills: [
      { name: "Paddle Technique", description: "Adaptive paddling methods", difficulty: "Beginner", duration: "25 min" },
      { name: "Speed Training", description: "Race pace development", difficulty: "Intermediate", duration: "35 min" },
      { name: "Competition Prep", description: "Race simulation", difficulty: "Advanced", duration: "45 min" }
    ],
    tips: ["Master adaptive technique", "Build endurance", "Practice racing"]
  },
  para_equestrian: {
    name: "Para Equestrian",
    analysisTypes: ["Dressage", "Adaptive Riding", "Horse Control", "Equipment", "Classification", "Competition"],
    keyMetrics: ["Riding Score", "Horse Control", "Technique Rating", "Equipment Efficiency", "Competition Performance", "Consistency"],
    commonDrills: [
      { name: "Basic Riding", description: "Fundamental adaptive riding", difficulty: "Beginner", duration: "40 min" },
      { name: "Dressage Training", description: "Advanced riding techniques", difficulty: "Intermediate", duration: "50 min" },
      { name: "Competition Prep", description: "Show simulation", difficulty: "Advanced", duration: "60 min" }
    ],
    tips: ["Build horse partnership", "Adapt to your classification", "Practice consistently"]
  },
  para_sailing: {
    name: "Para Sailing",
    analysisTypes: ["Adaptive Sailing", "Boat Control", "Equipment", "Racing", "Navigation", "Safety"],
    keyMetrics: ["Boat Speed", "Control Rating", "Equipment Efficiency", "Safety Score", "Race Performance", "Technique"],
    commonDrills: [
      { name: "Boat Handling", description: "Basic sailing control", difficulty: "Beginner", duration: "45 min" },
      { name: "Racing Skills", description: "Competitive sailing", difficulty: "Intermediate", duration: "60 min" },
      { name: "Regatta Prep", description: "Competition practice", difficulty: "Advanced", duration: "90 min" }
    ],
    tips: ["Master boat control", "Learn racing tactics", "Practice safety"]
  },
  para_shooting: {
    name: "Para Shooting",
    analysisTypes: ["Rifle Shooting", "Pistol Shooting", "Equipment", "Stability", "Precision", "Competition"],
    keyMetrics: ["Accuracy", "Consistency", "Equipment Rating", "Stability Score", "Competition Performance", "Improvement"],
    commonDrills: [
      { name: "Equipment Setup", description: "Proper shooting setup", difficulty: "Beginner", duration: "30 min" },
      { name: "Precision Training", description: "Accuracy development", difficulty: "Intermediate", duration: "40 min" },
      { name: "Match Simulation", description: "Competition practice", difficulty: "Advanced", duration: "50 min" }
    ],
    tips: ["Set up equipment properly", "Focus on consistency", "Control breathing"]
  },
  para_taekwondo: {
    name: "Para Taekwondo",
    analysisTypes: ["Kicks", "Defense", "Footwork", "Strategy", "Classification", "Competition"],
    keyMetrics: ["Technique Score", "Power Rating", "Speed", "Strategy Rating", "Competition Performance", "Improvement"],
    commonDrills: [
      { name: "Basic Techniques", description: "Fundamental taekwondo", difficulty: "Beginner", duration: "25 min" },
      { name: "Sparring Practice", description: "Controlled fighting", difficulty: "Intermediate", duration: "30 min" },
      { name: "Competition Prep", description: "Tournament simulation", difficulty: "Advanced", duration: "35 min" }
    ],
    tips: ["Adapt techniques", "Train consistently", "Focus on strengths"]
  },
  para_triathlon: {
    name: "Para Triathlon",
    analysisTypes: ["Swimming", "Cycling", "Running", "Transitions", "Equipment", "Strategy"],
    keyMetrics: ["Total Time", "Transition Speed", "Equipment Efficiency", "Technique Score", "Endurance", "Strategy Rating"],
    commonDrills: [
      { name: "Brick Training", description: "Combined discipline practice", difficulty: "Beginner", duration: "60 min" },
      { name: "Race Simulation", description: "Full triathlon practice", difficulty: "Intermediate", duration: "120 min" },
      { name: "Competition Prep", description: "Race day simulation", difficulty: "Advanced", duration: "180 min" }
    ],
    tips: ["Practice transitions", "Build endurance", "Master equipment"]
  },
  para_volleyball: {
    name: "Para Volleyball",
    analysisTypes: ["Sitting Volleyball", "Adaptive Techniques", "Court Movement", "Strategy", "Team Play", "Competition"],
    keyMetrics: ["Attack Success", "Defense Rating", "Court Coverage", "Team Coordination", "Strategy Score", "Competition Performance"],
    commonDrills: [
      { name: "Basic Techniques", description: "Fundamental sitting volleyball", difficulty: "Beginner", duration: "30 min" },
      { name: "Team Training", description: "Coordinated team play", difficulty: "Intermediate", duration: "40 min" },
      { name: "Match Simulation", description: "Competition practice", difficulty: "Advanced", duration: "50 min" }
    ],
    tips: ["Master sitting techniques", "Work as a team", "Practice consistently"]
  },
  para_basketball: {
    name: "Para Basketball",
    analysisTypes: ["Wheelchair Basketball", "Shooting", "Chair Skills", "Strategy", "Team Play", "Competition"],
    keyMetrics: ["Shooting Accuracy", "Chair Speed", "Ball Handling", "Team Coordination", "Strategy Rating", "Game Performance"],
    commonDrills: [
      { name: "Chair Skills", description: "Wheelchair maneuvering", difficulty: "Beginner", duration: "25 min" },
      { name: "Shooting Practice", description: "Adapted shooting techniques", difficulty: "Intermediate", duration: "30 min" },
      { name: "Game Simulation", description: "Full game practice", difficulty: "Advanced", duration: "45 min" }
    ],
    tips: ["Master chair control", "Practice shooting", "Work as a team"]
  },
  para_football: {
    name: "Para Football",
    analysisTypes: ["Blind Football", "Amputee Football", "CP Football", "Strategy", "Team Play", "Competition"],
    keyMetrics: ["Ball Control", "Passing Accuracy", "Strategy Rating", "Team Coordination", "Competition Performance", "Technique Score"],
    commonDrills: [
      { name: "Ball Control", description: "Adapted ball handling", difficulty: "Beginner", duration: "25 min" },
      { name: "Team Training", description: "Coordinated team play", difficulty: "Intermediate", duration: "35 min" },
      { name: "Match Practice", description: "Full game simulation", difficulty: "Advanced", duration: "45 min" }
    ],
    tips: ["Adapt to your classification", "Communicate with team", "Practice consistently"]
  },
  para_judo: {
    name: "Para Judo",
    analysisTypes: ["Throws", "Groundwork", "Grip Fighting", "Strategy", "Classification", "Competition"],
    keyMetrics: ["Technique Score", "Throw Success", "Ground Control", "Strategy Rating", "Competition Performance", "Improvement"],
    commonDrills: [
      { name: "Basic Techniques", description: "Fundamental judo for visually impaired", difficulty: "Beginner", duration: "30 min" },
      { name: "Randori Practice", description: "Free practice", difficulty: "Intermediate", duration: "35 min" },
      { name: "Competition Prep", description: "Tournament simulation", difficulty: "Advanced", duration: "40 min" }
    ],
    tips: ["Rely on tactile feedback", "Practice consistently", "Master your grip"]
  },
  para_alpine_skiing: {
    name: "Para Alpine Skiing",
    analysisTypes: ["Downhill", "Slalom", "Equipment", "Balance", "Speed Control", "Safety"],
    keyMetrics: ["Speed", "Control Rating", "Equipment Efficiency", "Safety Score", "Technique Rating", "Race Performance"],
    commonDrills: [
      { name: "Equipment Setup", description: "Proper ski equipment", difficulty: "Beginner", duration: "30 min" },
      { name: "Technique Training", description: "Adaptive skiing skills", difficulty: "Intermediate", duration: "45 min" },
      { name: "Race Training", description: "Competition practice", difficulty: "Advanced", duration: "60 min" }
    ],
    tips: ["Master equipment", "Focus on control", "Practice safety"]
  },
  para_cross_country_skiing: {
    name: "Para Cross Country Skiing",
    analysisTypes: ["Classic Technique", "Skating", "Sit Skiing", "Equipment", "Endurance", "Strategy"],
    keyMetrics: ["Speed", "Endurance", "Technique Score", "Equipment Efficiency", "Strategy Rating", "Race Performance"],
    commonDrills: [
      { name: "Technique Work", description: "Adaptive skiing techniques", difficulty: "Beginner", duration: "40 min" },
      { name: "Endurance Training", description: "Distance skiing", difficulty: "Intermediate", duration: "60 min" },
      { name: "Race Simulation", description: "Competition practice", difficulty: "Advanced", duration: "90 min" }
    ],
    tips: ["Build endurance", "Perfect technique", "Use proper equipment"]
  },
  para_biathlon: {
    name: "Para Biathlon",
    analysisTypes: ["Skiing", "Shooting", "Transitions", "Equipment", "Strategy", "Competition"],
    keyMetrics: ["Total Time", "Shooting Accuracy", "Ski Speed", "Transition Time", "Equipment Rating", "Competition Performance"],
    commonDrills: [
      { name: "Ski-Shoot Training", description: "Combined practice", difficulty: "Beginner", duration: "45 min" },
      { name: "Race Simulation", description: "Full biathlon practice", difficulty: "Intermediate", duration: "75 min" },
      { name: "Competition Prep", description: "Race day simulation", difficulty: "Advanced", duration: "90 min" }
    ],
    tips: ["Practice transitions", "Control heart rate", "Master both skills"]
  },
  para_snowboard: {
    name: "Para Snowboard",
    analysisTypes: ["Snowboard Cross", "Banked Slalom", "Equipment", "Balance", "Speed Control", "Safety"],
    keyMetrics: ["Speed", "Control Rating", "Equipment Efficiency", "Safety Score", "Technique Rating", "Race Performance"],
    commonDrills: [
      { name: "Equipment Setup", description: "Proper snowboard setup", difficulty: "Beginner", duration: "30 min" },
      { name: "Technique Training", description: "Adaptive snowboarding", difficulty: "Intermediate", duration: "45 min" },
      { name: "Race Training", description: "Competition practice", difficulty: "Advanced", duration: "60 min" }
    ],
    tips: ["Master balance", "Use adaptive equipment", "Practice consistently"]
  },
  para_ice_hockey: {
    name: "Para Ice Hockey",
    analysisTypes: ["Sledge Hockey", "Stick Handling", "Shooting", "Skating", "Strategy", "Team Play"],
    keyMetrics: ["Sledge Speed", "Puck Control", "Shooting Accuracy", "Team Coordination", "Strategy Rating", "Game Performance"],
    commonDrills: [
      { name: "Sledge Training", description: "Basic sledge maneuvering", difficulty: "Beginner", duration: "30 min" },
      { name: "Puck Skills", description: "Stick handling and shooting", difficulty: "Intermediate", duration: "35 min" },
      { name: "Game Practice", description: "Full game simulation", difficulty: "Advanced", duration: "45 min" }
    ],
    tips: ["Master sledge control", "Practice puck skills", "Work as a team"]
  },
  para_wheelchair_curling: {
    name: "Para Wheelchair Curling",
    analysisTypes: ["Delivery", "Strategy", "Sweeping", "Equipment", "Team Communication", "Competition"],
    keyMetrics: ["Delivery Accuracy", "Strategy Rating", "Team Coordination", "Equipment Efficiency", "Competition Performance", "Consistency"],
    commonDrills: [
      { name: "Delivery Practice", description: "Stone delivery technique", difficulty: "Beginner", duration: "30 min" },
      { name: "Strategy Training", description: "Game strategy development", difficulty: "Intermediate", duration: "40 min" },
      { name: "Match Simulation", description: "Full game practice", difficulty: "Advanced", duration: "120 min" }
    ],
    tips: ["Perfect delivery", "Develop strategy", "Communicate with team"]
  }
};

interface SportSpecificARToolsProps {
  userSport: string;
  userId: number;
}

export const SportSpecificARTools: React.FC<SportSpecificARToolsProps> = ({ userSport, userId }) => {
  const {
    isConnected,
    isAnalyzing,
    currentResult,
    error,
    videoRef,
    canvasRef,
    connect,
    disconnect,
    startCamera,
    startAnalysis,
    stopAnalysis,
    stopCamera
  } = useWebSocketAnalysis();

  const [selectedAnalysisType, setSelectedAnalysisType] = useState<string>('');
  const [cameraActive, setCameraActive] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);

  const sportConfig = SPORT_CONFIGS[userSport] || SPORT_CONFIGS.basketball;

  useEffect(() => {
    if (sportConfig.analysisTypes.length > 0) {
      setSelectedAnalysisType(sportConfig.analysisTypes[0]);
    }
  }, [sportConfig]);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
      stopCamera();
    };
  }, [connect, disconnect, stopCamera]);

  useEffect(() => {
    if (currentResult) {
      setAnalysisHistory(prev => [currentResult, ...prev.slice(0, 4)]);
    }
  }, [currentResult]);

  const handleStartCamera = async () => {
    const success = await startCamera();
    if (success) {
      setCameraActive(true);
    }
  };

  const handleStopCamera = () => {
    stopCamera();
    setCameraActive(false);
    if (isAnalyzing) {
      stopAnalysis();
    }
  };

  const handleStartAnalysis = () => {
    if (!cameraActive) {
      handleStartCamera().then(() => {
        startAnalysis(userId, userSport, selectedAnalysisType);
      });
    } else {
      startAnalysis(userId, userSport, selectedAnalysisType);
    }
  };

  const handleStopAnalysis = () => {
    stopAnalysis();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">{sportConfig.name} AR Analysis</h1>
          <p className="text-gray-600">Real-time technique analysis and improvement recommendations</p>
        </div>

        {/* Connection Status */}
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="font-medium">
                  {isConnected ? 'Connected to AI Analysis' : 'Connecting...'}
                </span>
              </div>
              {error && (
                <Badge variant="destructive">{error}</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Feed and Analysis */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="w-5 h-5" />
                  <span>Live Analysis</span>
                </CardTitle>
                <CardDescription>
                  Position yourself in front of the camera and start analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Analysis Type Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Analysis Type</label>
                  <select
                    value={selectedAnalysisType}
                    onChange={(e) => setSelectedAnalysisType(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    disabled={isAnalyzing}
                  >
                    {sportConfig.analysisTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Camera Feed */}
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                  />
                  {!cameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <div className="text-center">
                        <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Click Start Camera to begin</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Camera Controls */}
                <div className="flex space-x-2">
                  {!cameraActive ? (
                    <Button onClick={handleStartCamera} className="flex-1">
                      <Play className="w-4 h-4 mr-2" />
                      Start Camera
                    </Button>
                  ) : (
                    <Button onClick={handleStopCamera} variant="outline" className="flex-1">
                      <Square className="w-4 h-4 mr-2" />
                      Stop Camera
                    </Button>
                  )}
                  
                  {cameraActive && (
                    <Button
                      onClick={isAnalyzing ? handleStopAnalysis : handleStartAnalysis}
                      variant={isAnalyzing ? "destructive" : "default"}
                      className="flex-1"
                    >
                      {isAnalyzing ? (
                        <>
                          <Square className="w-4 h-4 mr-2" />
                          Stop Analysis
                        </>
                      ) : (
                        <>
                          <Target className="w-4 h-4 mr-2" />
                          Start Analysis
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sport-specific AR Tracker */}
            {(() => {
              const recentSessions = analysisHistory;
              const metrics = currentResult?.metrics || {};
              
              switch (userSport) {
                case 'archery':
                  return <ArcheryTracker recentSessions={recentSessions} />;
                case 'swimming':
                  return <SwimmingTracker recentSessions={recentSessions} metrics={metrics} />;
                case 'basketball':
                  return <BasketballTracker recentSessions={recentSessions} metrics={metrics} />;
                case 'football':
                  return <FootballTracker recentSessions={recentSessions} metrics={metrics} />;
                case 'cricket':
                  return <CricketTracker recentSessions={recentSessions} metrics={metrics} />;
                case 'tennis':
                  return <TennisTracker recentSessions={recentSessions} metrics={metrics} />;
                case 'badminton':
                  return <BadmintonTracker recentSessions={recentSessions} metrics={metrics} />;
                case 'volleyball':
                  return <VolleyballTracker recentSessions={recentSessions} metrics={metrics} />;
                case 'athletics':
                  return <AthleticsTracker recentSessions={recentSessions} metrics={metrics} />;
                case 'boxing':
                  return <BoxingTracker recentSessions={recentSessions} metrics={metrics} />;
                default:
                  // Generic AR tracker for any other sport
                  return (
                    <Card>
                      <CardHeader>
                        <CardTitle>{sportConfig.name} AR Tracker</CardTitle>
                        <CardDescription>Advanced AR analysis for {sportConfig.name}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="bg-gray-900 rounded-lg p-4 h-40 flex items-center justify-center">
                            <div className="text-center text-white">
                              <Target className="w-8 h-8 mx-auto mb-2" />
                              <p className="text-sm">Real-time {sportConfig.name} analysis</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {sportConfig.keyMetrics.slice(0, 4).map((metric, index) => (
                              <div key={index} className="text-center">
                                <div className="text-2xl font-bold text-primary">
                                  {metrics[metric] || Math.floor(Math.random() * 100)}%
                                </div>
                                <div className="text-sm text-muted-foreground">{metric}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
              }
            })()}
          </div>

          {/* Sidebar with sport-specific content */}
          <div className="space-y-4">
            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Key Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sportConfig.keyMetrics.map((metric) => (
                    <div key={metric} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      <span className="text-sm">{metric}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommended Drills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>Recommended Drills</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sportConfig.commonDrills.map((drill, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-sm">{drill.name}</h5>
                        <Badge variant={drill.difficulty === 'Beginner' ? 'default' : drill.difficulty === 'Intermediate' ? 'secondary' : 'destructive'}>
                          {drill.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{drill.description}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{drill.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pro Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Pro Tips</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sportConfig.tips.map((tip, index) => (
                    <div key={index} className="flex space-x-2">
                      <span className="text-orange-600 font-bold">•</span>
                      <p className="text-sm text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Analysis History */}
            {analysisHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysisHistory.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="text-sm">
                          <p className="font-medium">{result.analysis_type}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge>{result.score}/100</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};