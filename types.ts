
export enum SkillLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export interface Player {
  id: string;
  name: string;
  skill: SkillLevel;
  clubId: string;
  wins: number;
  losses: number;
  joinedDate: string;
}

export interface Club {
  id: string;
  name: string;
  location: string;
  username: string;
  password: string;
}

export type UserRole = 'SUPER_ADMIN' | 'CLUB_ADMIN';

export interface AuthSession {
  role: UserRole;
  clubId?: string;
  name: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  team1Ids: string[];
  team2Ids: string[];
  score1: number;
  score2: number;
  isCompleted: boolean;
  round: number;
  type: 'ROUND_ROBIN' | 'QUALIFIER_1' | 'ELIMINATOR' | 'QUALIFIER_2' | 'FINAL';
}

export interface Tournament {
  id: string;
  name: string;
  clubId: string;
  status: 'ONGOING' | 'COMPLETED';
  teams: string[][];
  playerIds: string[];
}

export interface Standing {
  teamId: string;
  playerName: string;
  matchesPlayed: number;
  won: number;
  loss: number;
  points: number;
  setsWon: number;
  setsLost: number;
  setDifference: number;
}
