import CalendarView from '@/components/CalendarView';
import { CalendarEvent } from '@/lib/types';

// Dummy data for initial render
const dummyEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Dr. Smith (Cardiology)',
    start: new Date(2025, 10, 29, 10, 0), // Nov 29, 2025
    end: new Date(2025, 10, 29, 11, 0),
    type: 'doctor',
    person: 'Musaddique',
    source: 'google',
    description: 'Annual checkup'
  },
  {
    id: '2',
    title: 'Massage Therapy',
    start: new Date(2025, 10, 30, 14, 0),
    end: new Date(2025, 10, 30, 15, 0),
    type: 'massage',
    person: 'Fatima',
    source: 'purplepass',
    description: 'Relaxation massage'
  },
  {
    id: '3',
    title: 'Dr. Jones (Pediatrics)',
    start: new Date(2025, 11, 5, 9, 30),
    end: new Date(2025, 11, 5, 10, 30),
    type: 'doctor',
    person: 'Fatima',
    source: 'google',
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <CalendarView initialEvents={dummyEvents} />
    </main>
  );
}
