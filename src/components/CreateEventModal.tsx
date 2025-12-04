"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CalendarEvent, Person, EventType } from '@/lib/types';

interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
    initialStart?: Date;
    initialEnd?: Date;
}

export default function CreateEventModal({ isOpen, onClose, onSave, initialStart, initialEnd }: CreateEventModalProps) {
    const [title, setTitle] = useState('');
    const [start, setStart] = useState(initialStart || new Date());
    const [end, setEnd] = useState(initialEnd || new Date(new Date().getTime() + 60 * 60 * 1000));
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [type, setType] = useState<EventType>('other');
    const [person, setPerson] = useState<Person>('Musaddique');

    React.useEffect(() => {
        if (initialStart) {
            setStart(initialStart);
            // Set end time to 1 hour after start if no initialEnd provided
            setEnd(initialEnd || new Date(initialStart.getTime() + 60 * 60 * 1000));
        }
    }, [initialStart, initialEnd]);

    // Helper function to safely format date for datetime-local input
    const formatDateTimeLocal = (date: Date): string => {
        if (!date || isNaN(date.getTime())) {
            return '';
        }
        // Format as YYYY-MM-DDTHH:mm for datetime-local input
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Update end time when start time changes to ensure end is always after start
    const handleStartChange = (dateTimeString: string) => {
        if (!dateTimeString) return;

        // Parse the datetime-local string as local time
        const newStart = new Date(dateTimeString);

        // Validate the date
        if (isNaN(newStart.getTime())) {
            return; // Don't update if invalid date
        }

        setStart(newStart);

        // If end is before or equal to new start, adjust end to be 1 hour after new start
        if (end <= newStart) {
            setEnd(new Date(newStart.getTime() + 60 * 60 * 1000));
        }
    };

    const handleEndChange = (dateTimeString: string) => {
        if (!dateTimeString) return;

        // Parse the datetime-local string as local time
        const newEnd = new Date(dateTimeString);

        // Validate the date
        if (isNaN(newEnd.getTime())) {
            return; // Don't update if invalid date
        }

        setEnd(newEnd);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            alert('Please enter an event title');
            return;
        }

        if (end <= start) {
            alert('End time must be after start time');
            return;
        }

        onSave({
            title: title.trim(),
            start,
            end,
            description: description.trim() || undefined,
            location: location.trim() || undefined,
            type,
            person,
            source: 'manual'
        });

        // Reset form
        setTitle('');
        setDescription('');
        setLocation('');
        setType('other');
        setPerson('Musaddique');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="bg-indigo-600 p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Create New Event</h2>
                    <button onClick={onClose} className="text-white hover:bg-indigo-700 p-1 rounded">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Event Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="e.g., Doctor Appointment"
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date & Time
                            </label>
                            <input
                                type="datetime-local"
                                value={formatDateTimeLocal(start)}
                                onChange={(e) => handleStartChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date & Time
                            </label>
                            <input
                                type="datetime-local"
                                value={formatDateTimeLocal(end)}
                                onChange={(e) => handleEndChange(e.target.value)}
                                min={formatDateTimeLocal(start)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Person
                        </label>
                        <select
                            value={person}
                            onChange={(e) => setPerson(e.target.value as Person)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="Musaddique">Musaddique</option>
                            <option value="Fatima">Fatima</option>
                            <option value="Mahjabeen">Mahjabeen</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type
                        </label>
                        <div className="flex gap-6">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    value="doctor"
                                    checked={type === 'doctor'}
                                    onChange={(e) => setType(e.target.value as EventType)}
                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Doctor</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    value="massage"
                                    checked={type === 'massage'}
                                    onChange={(e) => setType(e.target.value as EventType)}
                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Massage</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    value="other"
                                    checked={type === 'other'}
                                    onChange={(e) => setType(e.target.value as EventType)}
                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Other</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                        </label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="e.g., Mayo Clinic"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Additional notes..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                        >
                            Create Event
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
