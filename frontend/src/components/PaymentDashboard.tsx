import { useCallback, useEffect, useState } from "react";
import { apiClient } from "~/lib/api-client";
import type { TransactionResponse } from "~/types/transaction";
import type { UserResponse } from "~/types/user";

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function PaymentDashboard() {
  const [me, setMe] = useState<UserResponse | null>(null);
  const [contacts, setContacts] = useState<UserResponse[]>([]);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedContact, setSelectedContact] = useState<UserResponse | null>(null);
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [meData, contactsData, txData] = await Promise.all([
        apiClient.get<UserResponse>("/api/me"),
        apiClient.get<UserResponse[]>("/api/contacts"),
        apiClient.get<TransactionResponse[]>("/api/transactions?limit=20"),
      ]);
      setMe(meData);
      setContacts(contactsData);
      setTransactions(txData);
    } catch (err) {
      setNotification({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to load data",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact) return;

    const amountCents = Math.round(parseFloat(amount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) {
      setNotification({ type: "error", text: "Enter a valid dollar amount" });
      return;
    }

    setIsSending(true);
    setNotification(null);
    try {
      await apiClient.post("/api/transactions", {
        recipientId: selectedContact.id,
        amountCents,
        memo: memo || undefined,
      });
      setNotification({
        type: "success",
        text: `Sent ${formatCents(amountCents)} to ${selectedContact.name}!`,
      });
      setAmount("");
      setMemo("");
      setSelectedContact(null);
      void fetchAll();
    } catch (err) {
      setNotification({
        type: "error",
        text: err instanceof Error ? err.message : "Transfer failed",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header + Balance */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-500">{me?.handle}</p>
          </div>
          <div className="rounded-xl bg-white px-6 py-4 shadow-lg">
            <p className="text-sm font-medium text-gray-500">Available Balance</p>
            <p className="text-3xl font-bold text-green-600">
              {me ? formatCents(me.balanceCents) : "—"}
            </p>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`mb-6 rounded-md border p-4 ${
              notification.type === "success"
                ? "border-green-400 bg-green-50 text-green-700"
                : "border-red-400 bg-red-50 text-red-700"
            }`}
          >
            {notification.text}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Contacts */}
          <div className="rounded-xl bg-white p-6 shadow-lg lg:col-span-1">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Contacts</h2>
            <div className="space-y-2">
              {contacts.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-400">No contacts</p>
              ) : (
                contacts.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedContact(c)}
                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                      selectedContact?.id === c.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                      {c.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-gray-900">{c.name}</p>
                      <p className="text-sm text-gray-500">{c.handle}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Send Money Form */}
          <div className="rounded-xl bg-white p-6 shadow-lg lg:col-span-2">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Send Money</h2>
            {selectedContact ? (
              <form onSubmit={(e) => void handleSend(e)} className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                    {selectedContact.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedContact.name}</p>
                    <p className="text-sm text-gray-500">{selectedContact.handle}</p>
                  </div>
                </div>

                <div>
                  <label htmlFor="amount" className="mb-1 block text-sm font-medium text-gray-700">
                    Amount (USD)
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      $
                    </span>
                    <input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="memo" className="mb-1 block text-sm font-medium text-gray-700">
                    Memo (optional)
                  </label>
                  <input
                    id="memo"
                    type="text"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="Lunch, rent, etc."
                    maxLength={255}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {isSending ? "Sending..." : "Send Payment"}
                </button>
              </form>
            ) : (
              <p className="py-8 text-center text-gray-400">
                Select a contact to send money
              </p>
            )}
          </div>
        </div>

        {/* Transaction History */}
        <div className="mt-6 rounded-xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Transaction History</h2>
          {transactions.length === 0 ? (
            <p className="py-8 text-center text-gray-400">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => {
                const isSent = tx.senderId === me?.id;
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isSent
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {isSent ? "Sent" : "Received"}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {isSent ? tx.recipientName : tx.senderName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {isSent ? tx.recipientHandle : tx.senderHandle}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${isSent ? "text-red-600" : "text-green-600"}`}
                      >
                        {isSent ? "−" : "+"}{formatCents(tx.amountCents)}
                      </p>
                      {tx.memo && (
                        <p className="text-sm text-gray-400">{tx.memo}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
