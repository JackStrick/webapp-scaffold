import { useEffect, useState } from "react";
import { apiClient } from "~/lib/api-client";
import type { MessageResponse } from "~/types/message";

export default function HelloWorldDashboard() {
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchMessages = async () => {
    try {
      const data = await apiClient.get<MessageResponse[]>(
        "/api/messages/latest?limit=10",
      );
      setMessages(data);
    } catch (err) {
      setNotification({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to fetch messages",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMessages();
  }, []);

  const handleCreateMessage = async () => {
    setIsCreating(true);
    setNotification(null);
    try {
      await apiClient.post("/api/messages");
      setNotification({ type: "success", text: "Message created successfully!" });
      void fetchMessages();
    } catch (err) {
      setNotification({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to create message",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Webapp Scaffold
          </h1>
          <p className="text-gray-600">Let's start hacking!</p>
        </div>

        {/* Create Message Card */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Create Message
          </h2>
          <button
            onClick={() => void handleCreateMessage()}
            disabled={isCreating}
            className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isCreating ? "Creating..." : "Create Hello World Message"}
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`mb-6 rounded-md border p-4 ${
              notification.type === "success"
                ? "border-green-400 bg-green-100 text-green-700"
                : "border-red-400 bg-red-100 text-red-700"
            }`}
          >
            {notification.text}
          </div>
        )}

        {/* Messages List */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Recent Messages
          </h3>
          {messages.length === 0 ? (
            <p className="py-8 text-center text-gray-500">No messages yet</p>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{msg.content}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
