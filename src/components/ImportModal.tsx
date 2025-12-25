"use client";

import React, { useState } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import ICAL from 'ical.js';
import Papa from 'papaparse';
import { CalendarEvent } from '@/lib/types';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (events: CalendarEvent[]) => void;
}

export default function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
    const [text, setText] = useState('');
    const [activeTab, setActiveTab] = useState<'text' | 'file' | 'google'>('file');
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(Array.from(e.target.files));
            setError(null);
        }
    };

    const parseICS = async (file: File): Promise<CalendarEvent[]> => {
        const text = await file.text();
        const jcalData = ICAL.parse(text);
        const comp = new ICAL.Component(jcalData);
        const vevents = comp.getAllSubcomponents('vevent');

        return vevents.map((vevent) => {
            const event = new ICAL.Event(vevent);
            return {
                id: Math.random().toString(),
                title: event.summary,
                start: event.startDate.toJSDate(),
                end: event.endDate.toJSDate(),
                type: 'other', // Default, user might need to categorize
                person: 'Musaddique', // Default, maybe infer from attendee?
                source: 'manual', // or 'import'
                description: event.description,
                location: event.location
            };
        });
    };

    const parseCSV = (file: File): Promise<CalendarEvent[]> => {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                complete: (results) => {
                    const events = results.data.map((row: any) => {
                        // Basic mapping - assumes standard headers like Subject, Start Date, etc.
                        // Adjust based on Outlook CSV export format
                        const title = row['Subject'] || row['Title'] || 'Untitled Event';
                        const startDate = row['Start Date'] || row['StartDate'];
                        const startTime = row['Start Time'] || row['StartTime'] || '00:00:00';
                        const endDate = row['End Date'] || row['EndDate'];
                        const endTime = row['End Time'] || row['EndTime'] || '00:00:00';

                        if (!startDate) return null; // Skip invalid rows

                        const start = new Date(`${startDate} ${startTime}`);
                        const end = endDate ? new Date(`${endDate} ${endTime}`) : new Date(start.getTime() + 3600000);

                        return {
                            id: Math.random().toString(),
                            title,
                            start,
                            end,
                            type: 'other',
                            person: 'Musaddique',
                            source: 'manual',
                            description: row['Description'],
                            location: row['Location']
                        } as CalendarEvent;
                    }).filter((e): e is CalendarEvent => e !== null);
                    resolve(events);
                },
                error: (err) => reject(err)
            });
        });
    };

    const handleImport = async () => {
        try {
            let importedEvents: CalendarEvent[] = [];
            if (activeTab === 'text') {
                // Text parsing logic (simple dummy for now)
                if (text) {
                    importedEvents.push({
                        id: Math.random().toString(),
                        title: 'Imported from Text',
                        start: new Date(),
                        end: new Date(new Date().getTime() + 3600000),
                        type: 'other',
                        person: 'Musaddique',
                        source: 'manual',
                        description: text
                    });
                }
            } else if (files.length > 0) {
                // Process all files
                for (const file of files) {
                    let fileEvents: CalendarEvent[] = [];
                    if (file.name.endsWith('.ics')) {
                        fileEvents = await parseICS(file);
                    } else if (file.name.endsWith('.csv')) {
                        fileEvents = await parseCSV(file);
                    } else {
                        setError(`Skipping unsupported file: ${file.name}. Please use .ics or .csv`);
                        continue;
                    }
                    importedEvents.push(...fileEvents);
                }
            }

            if (importedEvents.length === 0) {
                setError('No events found to import');
                return;
            }

            onImport(importedEvents);
            onClose();
            setText('');
            setFiles([]);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to parse file. Please check the format.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Import Events</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex gap-4 mb-4 border-b border-gray-200">
                    <button
                        className={`pb-2 px-1 ${activeTab === 'file' ? 'border-b-2 border-indigo-600 text-indigo-600 font-medium' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('file')}
                    >
                        File Upload
                    </button>
                    <button
                        className={`pb-2 px-1 ${activeTab === 'text' ? 'border-b-2 border-indigo-600 text-indigo-600 font-medium' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('text')}
                    >
                        Paste Text
                    </button>
                    <button
                        className={`pb-2 px-1 ${activeTab === 'google' ? 'border-b-2 border-indigo-600 text-indigo-600 font-medium' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('google')}
                    >
                        Google Sync
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                {activeTab === 'text' ? (
                    <>
                        <p className="text-sm text-gray-600 mb-2">
                            Paste event details here.
                        </p>
                        <textarea
                            className="w-full h-32 border border-gray-300 rounded-lg p-2 mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="e.g., Doctor Appointment on Nov 29 at 10am..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                    </>
                ) : activeTab === 'google' ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                        <div className="bg-blue-50 p-4 rounded-full">
                            <svg className="w-12 h-12 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Connect Google Calendar</h3>
                        <p className="text-sm text-gray-500 max-w-xs">
                            Authenticate with Google to allow dragging and dropping events directly from your browser.
                        </p>
                        <a
                            href="/api/auth/google"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                        >
                            Authorize Google
                        </a>
                    </div>
                ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center mb-4 hover:bg-gray-50 transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            accept=".ics,.csv"
                            multiple
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <FileText className="w-10 h-10 text-gray-400 mb-2" />
                        {files.length === 0 ? (
                            <>
                                <p className="text-sm text-gray-600 font-medium">
                                    Click to upload .ics or .csv files
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Supports multiple files, Outlook, Google Calendar exports
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-gray-600 font-medium mb-2">
                                    {files.length} file{files.length > 1 ? 's' : ''} selected
                                </p>
                                <div className="text-xs text-gray-500 max-h-20 overflow-y-auto w-full">
                                    {files.map((file, index) => (
                                        <div key={index} className="truncate">
                                            • {file.name}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={(!text && activeTab === 'text') || (files.length === 0 && activeTab === 'file')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Upload className="w-4 h-4" />
                        Import
                    </button>
                </div>
            </div>
        </div>
    );
}
