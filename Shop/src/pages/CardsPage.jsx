import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { cardAPI } from "../services/api";

const CardsPage = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    cardholder_name: "",
    brand: "",
    last4: "",
    exp_month: "",
    exp_year: "",
    token: "",
    is_default: false,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await cardAPI.list();
      setCards(res.data);
    } catch (err) {
      console.error("Failed to load cards", err);
      setError("Failed to load cards");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // In real app, you'd create a token via payment provider. Here we accept token/last4 for demo.
      await cardAPI.create(form);
      setForm({
        cardholder_name: "",
        brand: "",
        last4: "",
        exp_month: "",
        exp_year: "",
        token: "",
        is_default: false,
      });
      load();
    } catch (err) {
      console.error("Failed to save card", err);
      setError("Failed to save card");
    }
  };

  if (!user) return <div className="p-6">Please sign in to manage cards.</div>;
  if (loading) return <div className="p-6">Loading cards...</div>;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Saved Cards</h2>
        {cards.length === 0 ? (
          <p className="text-gray-600 mb-4">No cards saved yet.</p>
        ) : (
          <ul className="space-y-3 mb-6">
            {cards.map((c) => (
              <li
                key={c.id}
                className="border p-3 rounded flex justify-between items-start"
              >
                <div>
                  <div className="font-medium">
                    {c.cardholder_name} {c.brand ? `(${c.brand})` : ""}
                  </div>
                  <div className="text-sm text-gray-600">
                    **** **** **** {c.last4} · Expires {c.exp_month}/
                    {c.exp_year}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {c.is_default ? "Default" : ""}
                </div>
              </li>
            ))}
          </ul>
        )}

        <h3 className="font-semibold mb-2">Add Card (demo)</h3>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Cardholder name"
            value={form.cardholder_name}
            onChange={(e) => handleChange("cardholder_name", e.target.value)}
            required
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Brand (Visa/Mastercard)"
            value={form.brand}
            onChange={(e) => handleChange("brand", e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              className="border rounded px-3 py-2"
              placeholder="Last 4 digits"
              value={form.last4}
              onChange={(e) => handleChange("last4", e.target.value)}
              required
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Exp month"
              value={form.exp_month}
              onChange={(e) => handleChange("exp_month", e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              className="border rounded px-3 py-2"
              placeholder="Exp year"
              value={form.exp_year}
              onChange={(e) => handleChange("exp_year", e.target.value)}
              required
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Token (demo)"
              value={form.token}
              onChange={(e) => handleChange("token", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => handleChange("is_default", e.target.checked)}
              />{" "}
              Set as default
            </label>
            <button className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded">
              Save Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CardsPage;
