import React, { useMemo } from 'react';
import { CalendarEvent } from '@/lib/types';
import { format, compareAsc } from 'date-fns';
import { Stethoscope, Sparkles, Calendar as CalendarIcon, Edit2, Trash2 } from 'lucide-react';

interface UpcomingEventsProps {
    events: CalendarEvent[];
    onEdit?: (event: CalendarEvent) => void;
    onDelete?: (eventId: string) => void;
}

export default function UpcomingEvents({ events, onEdit, onDelete }: UpcomingEventsProps) {
    const upcomingEvents = useMemo(() => {
        const now = new Date();
        return events
            .filter((event) => event.start >= now)
            .sort((a, b) => compareAsc(a.start, b.start));
        // Removed .slice(0, 5) to show all upcoming events
    }, [events]);

    if (upcomingEvents.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-4 h-full border border-gray-100 flex flex-col items-center justify-center text-gray-500">
                <CalendarIcon className="w-8 h-8 mb-2 opacity-50" />
                <p>No upcoming events</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 h-full border border-gray-100 flex flex-col">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-indigo-600" />
                    Upcoming
                </div>
                <span className="text-xs font-normal bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                    {upcomingEvents.length} {upcomingEvents.length === 1 ? 'event' : 'events'}
                </span>
            </h2>
            <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                {upcomingEvents.map((event) => (
                    <div
                        key={event.id}
                        className="p-3 rounded-lg border border-gray-100 hover:shadow-md transition-shadow bg-gray-50"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 text-sm">{event.title}</h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    {format(event.start, 'MMM d, yyyy')} • {format(event.start, 'h:mm a')}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${event.person === 'Fatima' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {event.person}
                                    </span>
                                    {event.type === 'doctor' && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full flex items-center gap-1"><Stethoscope className="w-3 h-3" /> Doctor</span>}
                                    {event.type === 'massage' && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles className="w-3 h-3" /> Massage</span>}
                                </div>
                            </div>
                            {(onEdit || onDelete) && (
                                <div className="flex gap-1 ml-2">
                                    {onEdit && (
                                        <button
                                            onClick={() => onEdit(event)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                            title="Edit event"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={() => {
                                                if (confirm('Are you sure you want to delete this event?')) {
                                                    onDelete(event.id);
                                                }
                                            }}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                            title="Delete event"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
