"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CalendarEvent, Person, EventType } from '@/lib/types';

interface AddEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
    initialDate?: Date;
}

export default function AddEventModal({ isOpen, onClose, onSave, initialDate }: AddEventModalProps) {
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState(initialDate ? initialDate.toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16));
    const [endDate, setEndDate] = useState(initialDate ? new Date(initialDate.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16) : new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16));
    const [person, setPerson] = useState<Person>('Musaddique');
    const [type, setType] = useState<EventType>('other');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            alert('Please enter an event title');
            return;
        }

        onSave({
            title: title.trim(),
            start: new Date(startDate),
            end: new Date(endDate),
            person,
            type,
            description: description.trim() || undefined,
            location: location.trim() || undefined,
            source: 'manual',
        });

        // Reset form
        setTitle('');
        setDescription('');
        setLocation('');
        setType('other');
        setPerson('Musaddique');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Add New Event</h2>
                    <button onClick={onClose} className="hover:bg-indigo-700 p-1 rounded">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="e.g., Doctor Appointment"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Person *</label>
                            <select
                                value={person}
                                onChange={(e) => setPerson(e.target.value as Person)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="Musaddique">Musaddique</option>
                                <option value="Fatima">Fatima</option>
                                <option value="Mahjabeen">Mahjabeen</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as EventType)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="doctor">Doctor</option>
                                <option value="massage">Massage</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time *</label>
                        <input
                            type="datetime-local"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time *</label>
                        <input
                            type="datetime-local"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="e.g., Mayo Clinic"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            rows={3}
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
                            Save Event
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
