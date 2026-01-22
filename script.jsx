import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  X, 
  Copy, 
  Check,
  Calendar as CalendarIcon,
  Clock,
  StickyNote,
  Pencil,
  Save,
  Menu,
  Search,
  Settings,
  HelpCircle,
  ListTodo,
  Download,
  Upload,
  AlertCircle
} from 'lucide-react';

const App = () => {
  // Initialize state from localStorage
  const [items, setItems] = useState(() => {
    const savedItems = localStorage.getItem('local_list_manager_data');
    if (savedItems) {
      try {
        return JSON.parse(savedItems);
      } catch (e) {
        return [];
      }
    }
    return [
      { id: '1', text: 'Welcome to Local List', note: 'No sign-in required. Data stays on your device.', date: new Date().toISOString().split('T')[0], timestamp: Date.now() }
    ];
  });

  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [noteValue, setNoteValue] = useState('');
  const [dateValue, setDateValue] = useState(new Date().toISOString().split('T')[0]);
  const [sortOrder, setSortOrder] = useState('date-asc'); 
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef(null);
  
  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({ text: '', note: '', date: '' });

  // Persistent storage effect
  useEffect(() => {
    localStorage.setItem('local_list_manager_data', JSON.stringify(items));
  }, [items]);

  const addItem = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const newItem = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      note: noteValue.trim(),
      date: dateValue,
      timestamp: Date.now()
    };
    
    setItems([...items, newItem]);
    setInputValue('');
    setNoteValue('');
    setShowInput(false);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditFields({ text: item.text, note: item.note, date: item.date });
  };

  const saveEdit = (id) => {
    if (!editFields.text.trim()) return;
    setItems(items.map(item => item.id === id ? { ...item, ...editFields } : item));
    setEditingId(null);
  };

  const sortedItems = useMemo(() => {
    let filtered = items.filter(item => 
      item.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.note.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortOrder === 'asc') return filtered.sort((a, b) => a.text.localeCompare(b.text));
    if (sortOrder === 'desc') return filtered.sort((a, b) => b.text.localeCompare(a.text));
    if (sortOrder === 'date-asc') return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    if (sortOrder === 'date-desc') return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    return filtered;
  }, [items, sortOrder, searchQuery]);

  const copyToClipboard = () => {
    const textToCopy = sortedItems.map(item => `${item.date}: ${item.text}${item.note ? ` (${item.note})` : ''}`).join('\n');
    const textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    document.body.removeChild(textArea);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(items, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'my-list-backup.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (Array.isArray(json)) {
          setItems(json);
          setShowSettings(false);
        }
      } catch (err) {
        alert("Invalid file format.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-[#3c4043]">
      {/* Top Navbar - Cleaned up to remove profile/account vibes */}
      <header className="h-16 border-b border-[#dadce0] flex items-center justify-between px-4 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 ml-1">
            <div className="w-10 h-10 flex items-center justify-center">
              <ListTodo size={28} className="text-[#4285f4]" />
            </div>
            <span className="text-xl text-[#5f6368] font-normal tracking-tight">Local List</span>
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-8 hidden md:block">
          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5f6368]" />
            <input 
              type="text" 
              placeholder="Search your items..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f1f3f4] border-transparent focus:bg-white focus:shadow-md py-3 pl-12 pr-4 rounded-lg outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 hover:bg-gray-100 rounded-full text-[#5f6368] ${showSettings ? 'bg-gray-100' : ''}`}
            title="Storage Settings"
          >
            <Settings size={22} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Settings Panel (Overlay Sidebar) */}
        {showSettings && (
          <aside className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl border-l border-[#dadce0] z-20 p-6 animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-medium text-lg">Storage Settings</h3>
              <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20}/></button>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex gap-2 text-blue-700 mb-2">
                  <AlertCircle size={18} />
                  <span className="text-xs font-bold uppercase">Privacy Note</span>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Everything is stored locally in your browser. No data is sent to a server.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase">Backup</p>
                <button 
                  onClick={exportData}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 rounded-md border border-gray-200"
                >
                  <Download size={16} /> Export as JSON
                </button>
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 rounded-md border border-gray-200"
                >
                  <Upload size={16} /> Import from File
                </button>
                <input type="file" ref={fileInputRef} onChange={importData} className="hidden" accept=".json" />
              </div>

              <div className="pt-4 border-t">
                <button 
                  onClick={() => { if(confirm("This will permanently delete your local data. Proceed?")) setItems([]); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                >
                  <Trash2 size={16} /> Wipe All Data
                </button>
              </div>
            </div>
          </aside>
        )}

        <main className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-4xl mx-auto p-4 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-normal">My List</h2>
                <div className="flex items-center border border-[#dadce0] rounded-md px-1 py-1">
                  <button onClick={() => setSortOrder('date-asc')} className={`px-3 py-1 text-xs rounded ${sortOrder === 'date-asc' ? 'bg-[#1a73e8] text-white' : 'hover:bg-gray-100'}`}>Date</button>
                  <button onClick={() => setSortOrder('asc')} className={`px-3 py-1 text-xs rounded ${sortOrder === 'asc' ? 'bg-[#1a73e8] text-white' : 'hover:bg-gray-100'}`}>A-Z</button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowInput(true)}
                  className="flex items-center gap-2 py-2 px-4 rounded-full shadow-sm border border-[#dadce0] hover:shadow-md transition-shadow text-sm font-medium bg-white"
                >
                  <Plus size={20} className="text-blue-500" />
                  <span>Add Item</span>
                </button>
                <button onClick={copyToClipboard} title="Copy list" className="p-2 hover:bg-gray-100 rounded-full text-[#5f6368]">
                  {copied ? <Check size={20} className="text-green-600" /> : <Copy size={20} />}
                </button>
              </div>
            </div>

            {/* Modal for adding items */}
            {showInput && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px] p-4">
                <form onSubmit={addItem} className="bg-white rounded-lg shadow-2xl border border-[#dadce0] w-full max-w-md animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                  <div className="bg-[#f8f9fa] px-4 py-2 border-b flex justify-between items-center">
                    <span className="text-sm font-medium">New Entry</span>
                    <button type="button" onClick={() => setShowInput(false)} className="p-1 hover:bg-gray-200 rounded-full"><X size={18}/></button>
                  </div>
                  <div className="p-6 space-y-4">
                    <input
                      autoFocus
                      placeholder="Title"
                      className="text-xl w-full border-b-2 border-transparent focus:border-blue-500 outline-none pb-2 transition-colors"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                    <div className="flex items-center gap-3 text-[#5f6368]">
                      <CalendarIcon size={18} />
                      <input 
                        type="date" 
                        value={dateValue}
                        onChange={(e) => setDateValue(e.target.value)}
                        className="outline-none focus:bg-gray-50 rounded p-1 flex-1"
                      />
                    </div>
                    <div className="flex items-start gap-3 text-[#5f6368]">
                      <StickyNote size={18} className="mt-1" />
                      <textarea 
                        placeholder="Notes (optional)"
                        className="w-full outline-none focus:bg-gray-50 rounded p-1 flex-1 resize-none h-24"
                        value={noteValue}
                        onChange={(e) => setNoteValue(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 flex justify-end gap-2">
                    <button type="button" onClick={() => setShowInput(false)} className="px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded transition-colors">Cancel</button>
                    <button type="submit" className="px-6 py-2 text-sm font-medium bg-[#1a73e8] text-white rounded hover:bg-[#1557b0] shadow transition-colors">Save</button>
                  </div>
                </form>
              </div>
            )}

            {/* Item List */}
            <div className="space-y-4 pb-20">
              {sortedItems.length === 0 ? (
                <div className="text-center py-24 text-[#70757a]">
                  <ListTodo size={64} className="mx-auto mb-4 opacity-10" />
                  <p className="text-lg">Your list is currently empty</p>
                  <p className="text-sm mt-1">Click "Add Item" to get started.</p>
                </div>
              ) : (
                sortedItems.map((item) => (
                  <div key={item.id} className="animate-in fade-in duration-300">
                    {editingId === item.id ? (
                      <div className="bg-white border-2 border-blue-500 rounded-lg p-5 shadow-lg space-y-4">
                        <input 
                          className="w-full text-lg font-medium outline-none border-b border-gray-100 pb-2" 
                          value={editFields.text} 
                          onChange={e => setEditFields({...editFields, text: e.target.value})}
                          autoFocus
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <CalendarIcon size={14} />
                            <input type="date" value={editFields.date} onChange={e => setEditFields({...editFields, date: e.target.value})} className="border rounded px-2 py-1 flex-1" />
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <StickyNote size={14} />
                            <input placeholder="Note..." value={editFields.note} onChange={e => setEditFields({...editFields, note: e.target.value})} className="border rounded px-2 py-1 flex-1" />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button onClick={() => setEditingId(null)} className="text-xs font-bold px-4 py-2 rounded hover:bg-gray-100 border">Cancel</button>
                          <button onClick={() => saveEdit(item.id)} className="text-xs font-bold px-4 py-2 bg-blue-600 text-white rounded shadow-sm">Save Changes</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-4">
                        <div className="w-14 flex flex-col items-center pt-2 text-[#70757a] flex-shrink-0">
                          <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">
                            {new Date(item.date).toLocaleString('default', { month: 'short' })}
                          </span>
                          <span className="text-2xl font-light">
                            {new Date(item.date).getDate()}
                          </span>
                        </div>
                        <div className="flex-1 bg-white border border-[#dadce0] rounded-lg p-4 hover:shadow-md transition-all cursor-default group">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                                <h3 className="font-medium text-[16px] truncate">{item.text}</h3>
                              </div>
                              {item.note && (
                                <p className="text-sm text-[#5f6368] mt-2 ml-4 border-l-2 border-gray-100 pl-3 italic line-clamp-3">
                                  {item.note}
                                </p>
                              )}
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity ml-4">
                              <button onClick={() => startEdit(item)} className="p-2 hover:bg-gray-100 rounded-full text-[#5f6368]" title="Edit"><Pencil size={18}/></button>
                              <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="p-2 hover:bg-red-50 rounded-full text-red-400" title="Delete"><X size={18}/></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
