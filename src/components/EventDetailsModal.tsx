"use client";

import React from 'react';
import { X, Calendar, MapPin, User, Stethoscope, Sparkles, AlignLeft, Edit2, Trash2 } from 'lucide-react';
import { CalendarEvent } from '@/lib/types';
import { format } from 'date-fns';

interface EventDetailsModalProps {
    event: CalendarEvent | null;
    onClose: () => void;
    onEdit?: (event: CalendarEvent) => void;
    onDelete?: (eventId: string) => void;
}

export default function EventDetailsModal({ event, onClose, onEdit, onDelete }: EventDetailsModalProps) {
    if (!event) return null;

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
            onDelete?.(event.id);
            onClose();
        }
    };

    const handleEdit = () => {
        onEdit?.(event);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all">
                {/* Header with Color Coding */}
                <div className={`h-4 w-full ${event.person === 'Fatima' ? 'bg-pink-500' : 'bg-blue-500'}`} />

                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                            {event.title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Time */}
                        <div className="flex items-start gap-3 text-gray-600">
                            <Calendar className="w-5 h-5 mt-0.5 text-indigo-500" />
                            <div>
                                <p className="font-medium text-gray-800">
                                    {format(event.start, 'EEEE, MMMM d, yyyy')}
                                </p>
                                <p className="text-sm">
                                    {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                                </p>
                            </div>
                        </div>

                        {/* Person & Type */}
                        <div className="flex items-center gap-3 text-gray-600">
                            <User className="w-5 h-5 text-indigo-500" />
                            <div className="flex gap-2">
                                <span className={`px-2 py-1 rounded-md text-xs font-semibold ${event.person === 'Fatima' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {event.person}
                                </span>
                                {event.type === 'doctor' && (
                                    <span className="px-2 py-1 rounded-md text-xs font-semibold bg-indigo-100 text-indigo-700 flex items-center gap-1">
                                        <Stethoscope className="w-3 h-3" /> Doctor
                                    </span>
                                )}
                                {event.type === 'massage' && (
                                    <span className="px-2 py-1 rounded-md text-xs font-semibold bg-purple-100 text-purple-700 flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> Massage
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Location */}
                        {event.location && (
                            <div className="flex items-start gap-3 text-gray-600">
                                <MapPin className="w-5 h-5 mt-0.5 text-indigo-500" />
                                <p className="text-sm">{event.location}</p>
                            </div>
                        )}

                        {/* Description */}
                        {event.description && (
                            <div className="flex items-start gap-3 text-gray-600">
                                <AlignLeft className="w-5 h-5 mt-0.5 text-indigo-500" />
                                <p className="text-sm whitespace-pre-wrap">{event.description}</p>
                            </div>
                        )}

                        {/* Source */}
                        <div className="pt-4 mt-4 border-t border-gray-100 text-xs text-gray-400 flex justify-end">
                            Source: {event.source}
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-3 flex justify-between">
                    <div className="flex gap-2">
                        {onEdit && (
                            <button
                                onClick={handleEdit}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm flex items-center gap-2"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
