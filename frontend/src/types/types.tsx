// type definitions

export interface Team { 
    id: number; 
    name: string; 
    code: string; 
    city: string 
};
export interface Player { 
    id: number; 
    name: string; 
    number: number; 
    position: string; 
    teamId: number; 
    team: Team 
};
// properties need to create or update a team
// a subset of values defined in interface
export type TeamInput = Pick< 
    Team,
    "name" | "code" | "city"
>;
// Pick reuses the property definitions from interface
export type PlayerInput = Pick<
    Player,
    "name" | "number" | "position" | "teamId">