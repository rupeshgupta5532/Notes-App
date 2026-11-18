import React, { useState, useEffect } from 'react';

const Notes = () => {
  const [noteName, setNoteName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState(() => {
    const items = localStorage.getItem('notes');
    try {
      return items ? JSON.parse(items) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const handleAddNote = (e) => {
    if (e) e.preventDefault();
    const trimmed = noteName.trim();
    if (!trimmed) {
      alert('Required Name');
      return;
    }

    const newNote = {
      id: Date.now(),
      name: trimmed,
      completed: false,
    };

    setNotes([...notes, newNote]);
    setNoteName('');
  };

  const handleDeleteNotes = (note) => {
    setNotes(notes.filter((item) => item.id !== note.id));
  };

  const handleEditNotes = (note) => {
    const updatedName = prompt('Edit note name:', note.name);
    if (!updatedName || updatedName.trim() === '') return;

    const completedInput = prompt(
      'Is note completed? (yes/no)',
      note.completed ? 'yes' : 'no'
    );
    
    if (completedInput === null) return;

    const isCompleted = completedInput.toLowerCase() === 'yes';
    setNotes(
      notes.map((item) =>
        item.id === note.id
          ? { ...item, name: updatedName.trim(), completed: isCompleted }
          : item
      )
    );
  };

  const handleToggleComplete = (id) => {
    setNotes(
      notes.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const filteredNotes = notes.filter((note) => {
    const query = searchQuery.toLowerCase().trim();
    return (note.name || '').toLowerCase().includes(query);
  });

  const completedCount = notes.filter((n) => n.completed).length;

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Notes App
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your daily tasks and ideas
          </p>
        </div>
        <div className="text-xs font-medium px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
          {completedCount} / {notes.length} Completed
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Add Note Form */}
      <form onSubmit={handleAddNote} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Enter Note Name..."
          value={noteName}
          onChange={(e) => setNoteName(e.target.value)}
          className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
        />
        <button
          type="submit"
          className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-sm transition-all whitespace-nowrap"
        >
          Add Note
        </button>
      </form>

      {/* Notes List */}
      <div className="space-y-2.5">
        {Array.isArray(filteredNotes) && filteredNotes.length > 0 ? (
          <ul className="space-y-2.5">
            {filteredNotes.map((note) => (
              <li
                key={note.id}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-150 ${
                  note.completed
                    ? 'bg-slate-50/80 border-slate-200/80'
                    : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-xs'
                }`}
              >
                {/* Note title and completion toggle */}
                <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                  <button
                    type="button"
                    onClick={() => handleToggleComplete(note.id)}
                    aria-label={
                      note.completed ? 'Mark incomplete' : 'Mark completed'
                    }
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                      note.completed
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-slate-300 hover:border-indigo-500 bg-white'
                    }`}
                  >
                    {note.completed && (
                      <svg
                        className="w-3.5 h-3.5 stroke-[3]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>

                  <span
                    onClick={() => handleToggleComplete(note.id)}
                    className={`text-sm cursor-pointer select-none break-words flex-1 ${
                      note.completed
                        ? 'line-through text-slate-400'
                        : 'text-slate-800 font-medium'
                    }`}
                  >
                    {note.name}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEditNotes(note)}
                    className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    EDIT
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteNotes(note)}
                    className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    DELETE
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-10 px-4 bg-slate-50/60 border border-dashed border-slate-200 rounded-xl">
            <p className="text-sm font-medium text-slate-600">
              {searchQuery ? 'No matching notes found' : 'No Notes Available'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {searchQuery
                ? 'Try searching with a different keyword.'
                : 'Add a new note above to get started.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
