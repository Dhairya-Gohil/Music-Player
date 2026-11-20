import React, { useState } from 'react';
import { X, CheckSquare, Square, Trash2, Plus, ListTodo } from 'lucide-react';

export default function TodoListDialog({ isOpen, onClose, todos, onAddTodo, onToggleTodo, onDeleteTodo }) {
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onAddTodo(inputText.trim());
    setInputText('');
  };

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        style={{
          width: '90%',
          maxWidth: '460px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
          backgroundColor: '#ffffff',
          borderRadius: '24px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0, 0, 0, 0.06)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-pink-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ListTodo size={20} color="var(--accent-pink)" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Song Goals & Tasks</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                {completedCount} of {todos.length} completed
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Input field */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text"
            placeholder="Add a new song goal, practice target, or task..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '14px',
              border: '1.5px solid var(--border-search)',
              backgroundColor: '#faf8f5',
              color: 'var(--text-main)',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            className="btn-red-action"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} /> Add
          </button>
        </form>

        {/* List of Tasks */}
        <div style={{
          maxHeight: '320px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          paddingRight: '4px'
        }}>
          {todos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '13px' }}>
              No song goals yet. Add one above to keep track of your listening and music goals!
            </div>
          ) : (
            todos.map(todo => (
              <div 
                key={todo.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  backgroundColor: todo.completed ? '#f7f6f4' : '#faf8f5',
                  border: '1px solid rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div 
                  onClick={() => onToggleTodo(todo.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1, minWidth: 0 }}
                >
                  {todo.completed ? (
                    <CheckSquare size={18} color="var(--accent-pink)" style={{ flexShrink: 0 }} />
                  ) : (
                    <Square size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                  )}
                  <span style={{
                    fontSize: '14px',
                    color: todo.completed ? 'var(--text-muted)' : 'var(--text-main)',
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {todo.text}
                  </span>
                </div>

                <button
                  onClick={() => onDeleteTodo(todo.id)}
                  title="Delete goal"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-dim)',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
