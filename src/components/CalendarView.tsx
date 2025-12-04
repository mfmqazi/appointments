"use client";

import React, { useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CalendarEvent, Person } from '@/lib/types';
import { Plus, Stethoscope, Sparkles, Calendar as CalendarIcon, Upload, List, LogOut } from 'lucide-react';
import { useSession, signOut } from "next-auth/react";
import { clsx } from 'clsx';
import ImportModal from './ImportModal';
import UpcomingEvents from './UpcomingEvents';
import EventDetailsModal from './EventDetailsModal';
import CreateEventModal from './CreateEventModal';
import EditEventModal from './EditEventModal';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface CalendarViewProps {
    initialEvents: CalendarEvent[];
}

export default function CalendarView({ initialEvents }: CalendarViewProps) {
    const { data: session } = useSession();
    const [events, setEvents] = useState<CalendarEvent[]>([]); // Start empty, fetch from DB
    const [view, setView] = useState<View>(Views.MONTH);
    const [date, setDate] = useState(new Date());
    const [filterPerson, setFilterPerson] = useState<Person | 'All'>('All');
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newEventSlot, setNewEventSlot] = useState<{ start: Date; end: Date } | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
    const [showMobileList, setShowMobileList] = useState(false);

    const fetchEvents = useCallback(async () => {
        try {
            const res = await fetch('/api/events');
            if (res.ok) {
                const dbEvents = await res.json();
                // Ensure dates are Date objects
                const formattedEvents = dbEvents.map((e: any) => ({
                    ...e,
                    start: new Date(e.start),
                    end: new Date(e.end)
                }));
                setEvents(formattedEvents);
            }
        } catch (error) {
            console.error("Failed to fetch events", error);
        }
    }, []);

    React.useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleSelectSlot = useCallback(
        ({ start, end }: { start: Date; end: Date }) => {
            setNewEventSlot({ start, end });
            setIsCreateModalOpen(true);
        },
        []
    );

    const handleSaveNewEvent = async (eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
        // Optimistic update - add event immediately to UI with temporary ID
        const tempId = `temp-${Date.now()}`;
        const optimisticEvent: CalendarEvent = {
            ...eventData,
            id: tempId,
        };

        setEvents(prev => [...prev, optimisticEvent]);

        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData),
            });

            if (res.ok) {
                // Replace the optimistic event with the real one from the database
                await fetchEvents();
            } else {
                // Remove optimistic event on failure
                setEvents(prev => prev.filter(e => e.id !== tempId));
                alert('Failed to save event');
            }
        } catch (error) {
            // Remove optimistic event on error
            setEvents(prev => prev.filter(e => e.id !== tempId));
            console.error("Failed to save event", error);
            alert('Failed to save event');
        }
    };

    const handleImport = async (importedEvents: CalendarEvent[]) => {
        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(importedEvents),
            });
            if (res.ok) {
                fetchEvents();
                setIsImportOpen(false);
            }
        } catch (error) {
            console.error("Failed to save imported events", error);
        }
    };

    const handleEditEvent = (event: CalendarEvent) => {
        setEventToEdit(event);
        setIsEditModalOpen(true);
    };

    const handleUpdateEvent = async (updatedEvent: CalendarEvent) => {
        try {
            const res = await fetch(`/api/events/${updatedEvent.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedEvent),
            });
            if (res.ok) {
                await fetchEvents();
                setIsEditModalOpen(false);
                setEventToEdit(null);
            } else {
                alert('Failed to update event');
            }
        } catch (error) {
            console.error("Failed to update event", error);
            alert('Failed to update event');
        }
    };

    const handleDeleteEvent = async (eventId: string) => {
        try {
            const res = await fetch(`/api/events/${eventId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                await fetchEvents();
            } else {
                alert('Failed to delete event');
            }
        } catch (error) {
            console.error("Failed to delete event", error);
            alert('Failed to delete event');
        }
    };


    const handleSelectEvent = useCallback(
        (event: CalendarEvent) => {
            setSelectedEvent(event);
        },
        []
    );

    const handleDoubleClickEvent = useCallback(
        (event: CalendarEvent) => {
            setSelectedEvent(event);
        },
        []
    );

    const eventStyleGetter = (event: CalendarEvent) => {
        let backgroundColor = '#3174ad';
        if (event.person === 'Fatima') {
            backgroundColor = '#d53f8c'; // Pink/Purple
        } else {
            backgroundColor = '#3182ce'; // Blue
        }

        if (event.type === 'massage') {
            backgroundColor = event.person === 'Fatima' ? '#97266d' : '#2c5282';
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '5px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block',
            },
        };
    };

    const filteredEvents = events.filter(
        (e) => filterPerson === 'All' || e.person === filterPerson
    );

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10 relative">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="w-6 h-6 text-indigo-600" />
                    <h1 className="text-xl font-bold text-gray-800">Qazi Family Calendar</h1>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterPerson('All')}
                        className={clsx(
                            "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                            filterPerson === 'All' ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        )}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterPerson('Musaddique')}
                        className={clsx(
                            "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                            filterPerson === 'Musaddique' ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        )}
                    >
                        Musaddique
                    </button>
                    <button
                        onClick={() => setFilterPerson('Fatima')}
                        className={clsx(
                            "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                            filterPerson === 'Fatima' ? "bg-pink-600 text-white" : "bg-pink-100 text-pink-700 hover:bg-pink-200"
                        )}
                    >
                        Fatima
                    </button>
                </div>

                <div className="flex gap-2 items-center">
                    {session?.user && (
                        <span className="text-sm font-medium text-gray-600 mr-2 hidden md:block">
                            Hi, {session.user.name}
                        </span>
                    )}
                    <button
                        onClick={() => signOut()}
                        className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors shadow-md"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Sign Out</span>
                    </button>
                    <button
                        onClick={() => setIsImportOpen(true)}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-md"
                    >
                        <Upload className="w-4 h-4" />
                        Import
                    </button>
                    <button
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                        onClick={() => {
                            setNewEventSlot({
                                start: new Date(),
                                end: new Date(new Date().getTime() + 60 * 60 * 1000)
                            });
                            setIsCreateModalOpen(true);
                        }}
                    >
                        <Plus className="w-4 h-4" />
                        Add Event
                    </button>
                </div>
            </header>

            <ImportModal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
                onImport={handleImport}
            />

            <CreateEventModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setNewEventSlot(null);
                }}
                onSave={handleSaveNewEvent}
                initialStart={newEventSlot?.start}
                initialEnd={newEventSlot?.end}
            />

            <EditEventModal
                isOpen={isEditModalOpen}
                event={eventToEdit}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEventToEdit(null);
                }}
                onSave={handleUpdateEvent}
            />

            <EventDetailsModal
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
            />

            {/* Mobile View Toggle */}
            <div className="lg:hidden fixed bottom-4 right-4 z-20">
                <button
                    onClick={() => setShowMobileList(!showMobileList)}
                    className={clsx(
                        "p-4 rounded-full shadow-lg transition-colors",
                        showMobileList ? "bg-gray-800 text-white" : "bg-indigo-600 text-white"
                    )}
                >
                    {showMobileList ? <CalendarIcon className="w-6 h-6" /> : <List className="w-6 h-6" />}
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar for Upcoming Events - Desktop: always visible, Mobile: toggleable */}
                <div className={clsx(
                    "w-full lg:w-80 p-4 border-r border-gray-200 bg-white overflow-y-auto",
                    "lg:block", // Always show on desktop
                    showMobileList ? "block" : "hidden" // Toggle on mobile
                )}>
                    <UpcomingEvents
                        events={filteredEvents}
                        onEdit={handleEditEvent}
                        onDelete={handleDeleteEvent}
                    />
                </div>

                {/* Calendar Area - Desktop: always visible, Mobile: hidden when list is shown */}
                <div className={clsx(
                    "flex-1 p-4 overflow-hidden",
                    "lg:block", // Always show on desktop
                    showMobileList ? "hidden" : "block" // Hide on mobile when list is shown
                )}>
                    <div className="bg-white rounded-xl shadow-lg p-4 h-full border border-gray-100">
                        <Calendar
                            localizer={localizer}
                            events={filteredEvents}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%' }}
                            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                            view={view}
                            onView={setView}
                            date={date}
                            onNavigate={setDate}
                            selectable
                            onSelectSlot={handleSelectSlot}
                            onSelectEvent={handleSelectEvent}
                            onDoubleClickEvent={handleDoubleClickEvent}
                            eventPropGetter={eventStyleGetter}
                            components={{
                                event: ({ event }: { event: CalendarEvent }) => (
                                    <div className="flex items-center gap-1">
                                        {event.type === 'doctor' && <Stethoscope className="w-3 h-3" />}
                                        {event.type === 'massage' && <Sparkles className="w-3 h-3" />}
                                        <span className="text-xs font-semibold">{event.title}</span>
                                    </div>
                                )
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
