export interface Person {
  id: string;
  name: string;
  department?: string;
}

export interface Group {
  id: string;
  name: string;
  members: Person[];
}

export interface Winner {
  person: Person;
  timestamp: number;
  prize?: string;
}
