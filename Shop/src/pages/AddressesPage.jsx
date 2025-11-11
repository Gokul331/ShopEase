import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { addressAPI } from "../services/api";

const AddressesPage = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    label: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    phone: "",
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
      const res = await addressAPI.list();
      setAddresses(res.data);
    } catch (err) {
      console.error("Failed to load addresses", err);
      setError("Failed to load addresses");
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
      await addressAPI.create(form);
      setForm({
        label: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
        phone: "",
        is_default: false,
      });
      load();
    } catch (err) {
      console.error("Failed to create address", err);
      setError("Failed to create address");
    }
  };

  if (!user)
    return <div className="p-6">Please sign in to manage addresses.</div>;
  if (loading) return <div className="p-6">Loading addresses...</div>;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Your Addresses</h2>
        {addresses.length === 0 ? (
          <p className="text-gray-600 mb-4">No addresses saved yet.</p>
        ) : (
          <ul className="space-y-3 mb-6">
            {addresses.map((a) => (
              <li
                key={a.id}
                className="border p-3 rounded flex justify-between items-start"
              >
                <div>
                  <div className="font-medium">
                    {a.label || `${a.line1}, ${a.city}`}
                  </div>
                  <div className="text-sm text-gray-600">
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ""}
                    {` ${a.city} ${a.postal_code} ${a.country}`}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {a.is_default ? "Default" : ""}
                </div>
              </li>
            ))}
          </ul>
        )}

        <h3 className="font-semibold mb-2">Add New Address</h3>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Label (Home, Work)"
            value={form.label}
            onChange={(e) => handleChange("label", e.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Address line 1"
            value={form.line1}
            onChange={(e) => handleChange("line1", e.target.value)}
            required
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Address line 2"
            value={form.line2}
            onChange={(e) => handleChange("line2", e.target.value)}
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              className="border rounded px-3 py-2"
              placeholder="City"
              value={form.city}
              onChange={(e) => handleChange("city", e.target.value)}
              required
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="State"
              value={form.state}
              onChange={(e) => handleChange("state", e.target.value)}
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Postal code"
              value={form.postal_code}
              onChange={(e) => handleChange("postal_code", e.target.value)}
            />
          </div>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Country"
            value={form.country}
            onChange={(e) => handleChange("country", e.target.value)}
            required
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
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
              Save Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressesPage;
