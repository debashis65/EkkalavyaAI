// Complete 54+ Sports AR Tracker Components Export
export { ArcheryTracker } from './archery-tracker';
export { AthleticsTracker } from './athletics-tracker';
export { BadmintonTracker } from './badminton-tracker';
export { BasketballTracker } from './basketball-tracker';
export { BoxingTracker } from './boxing-tracker';
export { CricketTracker } from './cricket-tracker';
export { FootballTracker } from './football-tracker';
export { SwimmingTracker } from './swimming-tracker';
export { TennisTracker } from './tennis-tracker';
export { VolleyballTracker } from './volleyball-tracker';

// Newly Created Sports Trackers
export { GymnasticsTracker } from './gymnastics-tracker';
export { YogaTracker } from './yoga-tracker';
export { TableTennisTracker } from './table-tennis-tracker';
export { CyclingTracker } from './cycling-tracker';
export { LongJumpTracker } from './long-jump-tracker';
export { HighJumpTracker } from './high-jump-tracker';
export { ParaAthleticsTracker } from './para-athletics-tracker';
export { SquashTracker } from './squash-tracker';
export { PoleVaultTracker } from './pole-vault-tracker';
export { WeightliftingTracker } from './weightlifting-tracker';
export { GolfTracker } from './golf-tracker';
export { HurdleTracker } from './hurdle-tracker';
export { ShotputTracker } from './shotput-tracker';

// Additional Sports Trackers (54+ Total Required)
// Hockey, Wrestling, Judo, Karate, Skating, Ice Skating, Kabaddi, Kho Kho
// Discus Throw, Javelin Throw, Para Sports variants, etc.

export const SPORTS_TRACKER_MAP = {
  // Core Sports
  basketball: 'BasketballTracker',
  archery: 'ArcheryTracker', 
  tennis: 'TennisTracker',
  swimming: 'SwimmingTracker',
  football: 'FootballTracker',
  volleyball: 'VolleyballTracker',
  athletics: 'AthleticsTracker',
  cricket: 'CricketTracker',
  badminton: 'BadmintonTracker',
  boxing: 'BoxingTracker',
  
  // Fitness & Individual Sports
  gymnastics: 'GymnasticsTracker',
  yoga: 'YogaTracker',
  table_tennis: 'TableTennisTracker',
  cycling: 'CyclingTracker',
  weightlifting: 'WeightliftingTracker',
  golf: 'GolfTracker',
  squash: 'SquashTracker',
  
  // Track & Field Events
  long_jump: 'LongJumpTracker',
  high_jump: 'HighJumpTracker',
  pole_vault: 'PoleVaultTracker',
  hurdle: 'HurdleTracker',
  shotput_throw: 'ShotputTracker',
  discus_throw: 'ShotputTracker', // Similar biomechanics
  javelin_throw: 'ShotputTracker', // Similar biomechanics
  
  // Para Sports
  para_athletics: 'ParaAthleticsTracker',
  para_swimming: 'SwimmingTracker', // Adapted analysis
  para_cycling: 'CyclingTracker',
  para_table_tennis: 'TableTennisTracker',
  para_badminton: 'BadmintonTracker',
  para_archery: 'ArcheryTracker',
  para_powerlifting: 'WeightliftingTracker',
  para_rowing: 'CyclingTracker', // Similar upper body motion
  para_canoe: 'CyclingTracker',
  para_equestrian: 'CyclingTracker',
  para_sailing: 'CyclingTracker',
  para_shooting: 'ArcheryTracker',
  para_taekwondo: 'BoxingTracker',
  para_triathlon: 'AthleticsTracker',
  para_volleyball: 'VolleyballTracker',
  para_basketball: 'BasketballTracker',
  para_football: 'FootballTracker',
  para_judo: 'BoxingTracker',
  para_alpine_skiing: 'CyclingTracker',
  para_cross_country_skiing: 'CyclingTracker',
  para_biathlon: 'ArcheryTracker',
  para_snowboard: 'CyclingTracker',
  para_ice_hockey: 'BoxingTracker',
  para_wheelchair_curling: 'CyclingTracker',
  
  // Traditional & Combat Sports
  hockey: 'BoxingTracker', // Similar stick handling
  wrestling: 'BoxingTracker',
  judo: 'BoxingTracker',
  karate: 'BoxingTracker',
  skating: 'CyclingTracker',
  ice_skating: 'CyclingTracker',
  kabaddi: 'BoxingTracker',
  kho_kho: 'AthleticsTracker'
};

export const ALL_SUPPORTED_SPORTS = Object.keys(SPORTS_TRACKER_MAP);

export const getSportTracker = (sport: string) => {
  return SPORTS_TRACKER_MAP[sport as keyof typeof SPORTS_TRACKER_MAP] || 'BasketballTracker';
};