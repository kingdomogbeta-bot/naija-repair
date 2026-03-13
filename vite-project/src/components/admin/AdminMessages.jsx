import { useState } from 'react';
import { useMessages } from '../../context/MessagesContext';
import { MessageCircle, User, X, Trash2, Flag, AlertTriangle } from 'lucide-react';

export default function AdminMessages() {
  const { conversations } = useMessages();

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="text-center py-12">
        <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">All Messages</h3>
        <p className="text-gray-600">User conversations will appear here</p>
        <p className="text-sm text-gray-500 mt-2">{conversations?.length || 0} total conversations</p>
      </div>
    </div>
  );
}
