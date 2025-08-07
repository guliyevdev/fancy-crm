import React, { useState, useEffect } from "react";
import { MessageCircle, Send } from "lucide-react";
import telegramMessageService from "../services/telegramMessageService"; // adjust path if needed

const TelegramOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [messages, setMessages] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [orders, setOrders] = useState([]);

  // Load orders on mount
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await telegramMessageService.getOrdersWithMessages();
        setOrders(data);
      } catch (err) {
        console.error("Error loading orders", err);
      }
    };
    loadOrders();
  }, []);

  // Load messages when selectedOrder changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedOrder) return;

      try {
        const data = await telegramMessageService.getMessagesByOrderId(
          selectedOrder.orderId
        );
        setMessages((prev) => ({
          ...prev,
          [selectedOrder.orderId]: data,
        }));
      } catch (err) {
        console.error("Error loading messages", err);
      }
    };

    loadMessages();
  }, [selectedOrder]);

  const sendMessage = () => {
    if (!inputValue.trim() || !selectedOrder) return;

    const newMessage = {
      text: inputValue,
      sender: "admin",
    };

    telegramMessageService
      .sendMessage(selectedOrder.orderId, newMessage)
      .then(() => {
        setMessages((prev) => ({
          ...prev,
          [selectedOrder.orderId]: [
            ...(prev[selectedOrder.orderId] || []),
            {
              ...newMessage,
              timestamp: new Date().toISOString(),
            },
          ],
        }));
        setInputValue("");
      });
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
      {/* LEFT PANEL */}
      <div className="w-full max-w-sm border-r dark:border-gray-700 overflow-y-auto">
        <div className="p-4 border-b dark:border-gray-700 flex items-center gap-2">
          <MessageCircle className="text-blue-600" />
          <h2 className="text-lg font-bold">Telegram</h2>
        </div>

        <div className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
          Focused
        </div>

        {orders.map((order) => (
          <div
            key={order.orderId}
            className={`flex items-center px-4 py-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-800 ${
              selectedOrder?.orderId === order.orderId
                ? "bg-blue-100 dark:bg-gray-800"
                : ""
            }`}
            onClick={() => setSelectedOrder(order)}
          >
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm mr-3">
              {order.telegramName
                .split(" ")
                .map((n) => n[1])
                .join("")}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{order.telegramName}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {order.design}
              </div>
            </div>
            <div className="text-xs text-gray-400">Jul 28</div>
          </div>
        ))}
      </div>

      {/* RIGHT PANEL */}
      {selectedOrder && (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm">
                {selectedOrder.telegramName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <div className="font-semibold">{selectedOrder.telegramName}</div>
                <div className="text-xs text-green-500">Available on mobile</div>
              </div>
            </div>
            <button
              className="text-sm text-blue-500 hover:underline"
              onClick={() => setSelectedOrder(null)}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-900">
            

            {/* Message thread */}
            {(Array.isArray(messages[selectedOrder.orderId]) ? messages[selectedOrder.orderId] : [])
  .slice() // avoid mutating original
  .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  .map((msg, idx) => (
    <div
      key={idx}
      className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
        msg.sender === "admin"
          ? "bg-blue-500 text-white self-end ml-auto"
          : "bg-gray-200 text-gray-800 self-start"
      }`}
    >
      {msg.text}
    </div>
  ))
}
          </div>

          {/* Input */}
          <div className="border-t dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Write a message..."
                className="flex-1 rounded-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm outline-none"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />

              <Send
                size={18}
                className="text-blue-500 cursor-pointer"
                onClick={sendMessage}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TelegramOrders;
