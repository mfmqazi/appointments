export type EventType = 'doctor' | 'massage' | 'other';
export type Person = 'Musaddique' | 'Fatima';

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    type: EventType;
    person: Person;
    description?: string;
    location?: string;
    source: 'google' | 'purplepass' | 'manual';
}
