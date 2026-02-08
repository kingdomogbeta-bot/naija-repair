import { useState } from 'react';
import { DollarSign, Heart } from 'lucide-react';

export default function TipTasker({ booking, onTipAdded }) {
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);
  const [customTip, setCustomTip] = useState('');

  const suggestedTips = [500, 1000, 2000, 5000];

  const handleAddTip = () => {
    const finalTip = customTip ? parseInt(customTip) : tipAmount;
    if (finalTip > 0) {
      onTipAdded(booking.id, finalTip);
      setShowTipModal(false);
      setTipAmount(0);
      setCustomTip('');
    }
  };

  return (
    <>
      <button
        onClick={() => setShowTipModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-all font-medium"
      >
        <Heart className="w-4 h-4" />
        Add Tip
      </button>

      {showTipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add a Tip</h3>
              <button
                onClick={() => setShowTipModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Show your appreciation for {booking.taskerName}'s great work!
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {suggestedTips.map(amount => (
                  <button
                    key={amount}
                    onClick={() => {
                      setTipAmount(amount);
                      setCustomTip('');
                    }}
                    className={`p-4 border-2 rounded-xl font-semibold transition-all ${
                      tipAmount === amount && !customTip
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 hover:border-teal-200'
                    }`}
                  >
                    ₦{amount.toLocaleString()}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                  <input
                    type="number"
                    value={customTip}
                    onChange={(e) => {
                      setCustomTip(e.target.value);
                      setTipAmount(0);
                    }}
                    placeholder="Enter amount"
                    className="w-full border-2 border-gray-200 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Task Total</span>
                <span className="font-semibold">₦{booking.totalPrice?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tip</span>
                <span className="font-semibold text-teal-600">
                  ₦{(customTip ? parseInt(customTip) : tipAmount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t text-lg font-bold">
                <span>New Total</span>
                <span className="text-teal-600">
                  ₦{((booking.totalPrice || 0) + (customTip ? parseInt(customTip) : tipAmount)).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowTipModal(false)}
                className="flex-1 border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTip}
                disabled={!tipAmount && !customTip}
                className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Tip
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
