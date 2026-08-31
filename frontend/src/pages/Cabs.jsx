import { useEffect, useState } from "react";
import { Car, Plus, Pencil, Trash2, X, Phone, MapPin, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

const emptyForm = {
  name: "",
  cab_number: "",
  mobile: "",
  active: true,
  payment_per_month: 500,
  area: "",
  note: "",
};

export default function Cabs() {
  const [cabs, setCabs] = useState([]);
  const [totalCabs, setTotalCabs] = useState(0);
  const [totalMonthlyPayment, setTotalMonthlyPayment] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingCab, setEditingCab] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadCabs = async () => {
    try {
      setLoading(true);

      const response = await api.get("/cabs");
      const data = response.data || {};

      setCabs(data.cabs || []);
      setTotalCabs(data.total_cabs || 0);
      setTotalMonthlyPayment(data.total_monthly_payment || 0);
    } catch (error) {
      console.error("Failed to load cabs:", error);
      alert("Failed to load cab data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCabs();
  }, []);

  const openAddForm = () => {
    setEditingCab(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (cab) => {
    setEditingCab(cab);

    setForm({
      name: cab.name || "",
      cab_number: cab.cab_number || "",
      mobile: cab.mobile || "",
      active: cab.active !== false,
      payment_per_month: cab.payment_per_month ?? 500,
      area: cab.area || "",
      note: cab.note || "",
    });

    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingCab(null);
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter the cab driver's name.");
      return;
    }

    if (!form.cab_number.trim()) {
      alert("Please enter the cab number.");
      return;
    }

    if (!form.mobile.trim()) {
      alert("Please enter the mobile number.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        cab_number: form.cab_number.trim(),
        mobile: form.mobile.trim(),
        active: Boolean(form.active),
        payment_per_month: Number(form.payment_per_month) || 500,
        area: form.area.trim(),
        note: form.note.trim(),
      };

      if (editingCab) {
        await api.put(`/cabs/${editingCab.id}`, payload);
      } else {
        await api.post("/cabs", payload);
      }

      await loadCabs();
      closeForm();
    } catch (error) {
      console.error("Failed to save cab:", error);

      const message =
        error?.response?.data?.detail ||
        "Failed to save cab details.";

      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cab) => {
    const confirmed = window.confirm(
      `Delete ${cab.name} (${cab.cab_number})?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/cabs/${cab.id}`);
      await loadCabs();
    } catch (error) {
      console.error("Failed to delete cab:", error);

      const message =
        error?.response?.data?.detail ||
        "Failed to delete cab.";

      alert(message);
    }
  };

  const activeCabs = cabs.filter((cab) => cab.active !== false).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Car className="h-6 w-6" />
            </div>

            <div>
              <h1 className="font-heading text-2xl font-extrabold text-slate-900">
                Cabs
              </h1>
              <p className="text-sm text-slate-500">
                Manage onboarded cab drivers and monthly payouts.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={openAddForm}
          className="gap-2 rounded-xl shadow-lift"
        >
          <Plus className="h-4 w-4" />
          Add Cab
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Total Cabs"
          value={totalCabs}
          icon={<Car className="h-5 w-5" />}
        />

        <SummaryCard
          title="Active Cabs"
          value={activeCabs}
          icon={<Car className="h-5 w-5" />}
        />

        <SummaryCard
          title="Monthly Payout"
          value={`₹${Number(totalMonthlyPayment || 0).toLocaleString("en-IN")}`}
          icon={<IndianRupee className="h-5 w-5" />}
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-soft">
        <div className="border-b border-purple-100 px-5 py-4">
          <h2 className="font-heading text-lg font-bold text-slate-900">
            Onboarded Cabs
          </h2>
          <p className="text-sm text-slate-500">
            Basic cab driver information and payment details.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[250px] items-center justify-center text-sm text-slate-500">
            Loading cabs...
          </div>
        ) : cabs.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-50 text-primary">
              <Car className="h-7 w-7" />
            </div>

            <h3 className="font-heading text-lg font-bold text-slate-900">
              No cabs added yet
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              Add the cab drivers who have been onboarded with QwickAds screens.
            </p>

            <Button
              onClick={openAddForm}
              className="mt-5 gap-2 rounded-xl"
            >
              <Plus className="h-4 w-4" />
              Add First Cab
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-sm">
              <thead>
                <tr className="border-b border-purple-100 bg-purple-50/40 text-left">
                  <th className="px-5 py-3 font-semibold text-slate-600">
                    Driver
                  </th>
                  <th className="px-5 py-3 font-semibold text-slate-600">
                    Cab No.
                  </th>
                  <th className="px-5 py-3 font-semibold text-slate-600">
                    Mobile
                  </th>
                  <th className="px-5 py-3 font-semibold text-slate-600">
                    Area
                  </th>
                  <th className="px-5 py-3 font-semibold text-slate-600">
                    Status
                  </th>
                  <th className="px-5 py-3 font-semibold text-slate-600">
                    ₹ / Month
                  </th>
                  <th className="px-5 py-3 font-semibold text-slate-600">
                    Note
                  </th>
                  <th className="px-5 py-3 text-right font-semibold text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {cabs.map((cab) => (
                  <tr
                    key={cab.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-purple-50/30"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">
                        {cab.name}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-medium text-slate-700">
                        {cab.cab_number}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <a
                        href={`tel:${cab.mobile}`}
                        className="flex items-center gap-2 text-slate-700 hover:text-primary"
                      >
                        <Phone className="h-4 w-4" />
                        {cab.mobile}
                      </a>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-slate-700">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        {cab.area || "—"}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {cab.active !== false ? (
                        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-800">
                      ₹{Number(cab.payment_per_month || 0).toLocaleString("en-IN")}
                    </td>

                    <td className="max-w-[220px] px-5 py-4">
                      <span
                        className="block truncate text-slate-500"
                        title={cab.note || ""}
                      >
                        {cab.note || "—"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditForm(cab)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-primary transition-colors hover:bg-purple-100"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(cab)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-purple-100 px-6 py-4">
              <div>
                <h2 className="font-heading text-xl font-bold text-slate-900">
                  {editingCab ? "Edit Cab" : "Add Cab"}
                </h2>

                <p className="text-sm text-slate-500">
                  {editingCab
                    ? "Update cab driver details."
                    : "Add a new onboarded cab driver."}
                </p>
              </div>

              <button
                onClick={closeForm}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Driver Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh Patil"
                  required
                />

                <Field
                  label="Cab Number"
                  name="cab_number"
                  value={form.cab_number}
                  onChange={handleChange}
                  placeholder="e.g. MH12AB1234"
                  required
                />

                <Field
                  label="Mobile Number"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  required
                />

                <Field
                  label="Area"
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  placeholder="e.g. Pune / Mumbai"
                />

                <Field
                  label="Payment / Month"
                  name="payment_per_month"
                  type="number"
                  value={form.payment_per_month}
                  onChange={handleChange}
                  placeholder="500"
                />

                <div className="flex items-end">
                  <label className="flex h-11 w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4">
                    <input
                      type="checkbox"
                      name="active"
                      checked={form.active}
                      onChange={handleChange}
                      className="h-4 w-4 accent-purple-600"
                    />

                    <span className="text-sm font-medium text-slate-700">
                      Active Cab
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Note
                </label>

                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Any useful note about this cab..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl"
                >
                  {saving
                    ? "Saving..."
                    : editingCab
                    ? "Save Changes"
                    : "Add Cab"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 font-heading text-2xl font-extrabold text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={type === "number" ? 0 : undefined}
        className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
      />
    </div>
  );
}
