import { useState } from "react";
import { api } from "../../utils/api";
import useAuth from "../../hooks/useAuth";

interface LoanProductFormData {
  reference_title: string;
  interest_calculation_type: "flat" | "reducing_balance" | "compound";
  base_percentage: string;
  min_loan_amount: string;
  max_loan_amount: string;
  max_term_days: number; // number
  grace_days: string;
  daily_penalty_rate: string;
  max_penalty_cap: string;
}

interface AddLoanProductFormProps {
  onCreated?: () => void;
}

const AddLoanProductForm = ({ onCreated }: AddLoanProductFormProps) => {
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  const [form, setForm] = useState<LoanProductFormData>({
    reference_title: "",
    interest_calculation_type: "flat",
    base_percentage: "1.0000",
    min_loan_amount: "0.00",
    max_loan_amount: "0.00",
    max_term_days: 30,
    grace_days: "",
    daily_penalty_rate: "",
    max_penalty_cap: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle change with correct type conversion for number inputs
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;

    // If it's an input with type="number", convert to number
    if (e.target instanceof HTMLInputElement && e.target.type === "number") {
      // If value is empty, set to empty string to avoid NaN, else parse float
      parsedValue = value === "" ? "" : parseFloat(value);
      // For max_term_days, we want integer; but we'll handle it as number anyway
      // We'll store as number if value is not empty
      if (value !== "") {
        parsedValue = parseFloat(value);
        // For integer fields (max_term_days) we could use parseInt, but parseFloat works too
      } else {
        parsedValue = ""; // but our state type expects number, so we need to handle
        // Since we have a number type, we might set to 0 or keep as number
        // Better to keep as number, but we can set to 0 if empty
        // However, for simplicity, we'll set to 0 if empty
        parsedValue = 0;
      }
    }

    setForm((s) => ({
      ...s,
      [name]: parsedValue,
    }));
  };

  // Build fine rules object
   // Build fine rules object
  const buildFineRules = () => {
    const rules: Record<string, number> = {};
    
    // Safely convert values to string before calling trim
    const graceDaysStr = String(form.grace_days ?? '').trim();
    const dailyPenaltyStr = String(form.daily_penalty_rate ?? '').trim();
    const maxPenaltyStr = String(form.max_penalty_cap ?? '').trim();

    if (graceDaysStr !== "") {
      const val = parseFloat(graceDaysStr);
      if (!isNaN(val) && val >= 0) rules.grace_days = val;
    }
    if (dailyPenaltyStr !== "") {
      const val = parseFloat(dailyPenaltyStr);
      if (!isNaN(val) && val >= 0) rules.daily_penalty_rate = val;
    }
    if (maxPenaltyStr !== "") {
      const val = parseFloat(maxPenaltyStr);
      if (!isNaN(val) && val >= 0) rules.max_penalty_cap = val;
    }
    return rules;
  };

  const validate = (): string | null => {
    if (!form.reference_title.trim()) return "Reference title is required.";
    if (
      !["flat", "reducing_balance", "compound"].includes(
        form.interest_calculation_type,
      )
    )
      return "Invalid interest calculation type.";
    if (
      isNaN(Number(form.base_percentage)) ||
      Number(form.base_percentage) <= 0
    )
      return "Base percentage must be a positive number.";
    if (
      isNaN(Number(form.min_loan_amount)) ||
      isNaN(Number(form.max_loan_amount))
    )
      return "Loan amounts must be numeric.";
    if (Number(form.min_loan_amount) < 0 || Number(form.max_loan_amount) < 0)
      return "Loan amounts must be non-negative.";
    if (Number(form.max_loan_amount) < Number(form.min_loan_amount))
      return "Max loan amount must be >= min loan amount.";

    // max_term_days is now a number, so check it
    if (!Number.isInteger(form.max_term_days) || form.max_term_days <= 0)
      return "Max term days must be a positive integer.";

    // Safely cast fine rules fields for string checks
    const graceDaysStr = String(form.grace_days ?? '').trim();
    const dailyPenaltyStr = String(form.daily_penalty_rate ?? '').trim();
    const maxPenaltyStr = String(form.max_penalty_cap ?? '').trim();

    // Validate fine rules fields if provided
    if (graceDaysStr !== "" && isNaN(Number(graceDaysStr)))
      return "Grace days must be a number.";
    if (
      dailyPenaltyStr !== "" &&
      isNaN(Number(dailyPenaltyStr))
    )
      return "Daily penalty rate must be a number.";
    if (
      maxPenaltyStr !== "" &&
      isNaN(Number(maxPenaltyStr))
    )
      return "Max penalty cap must be a number.";
    return null;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tenantId) {
      setError("You must be logged in to create a loan product.");
      return;
    }

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const fineRules = buildFineRules();

    const payload = {
      // tenant_id removed from body (it will be in the URL)
      reference_title: form.reference_title,
      interest_calculation_type: form.interest_calculation_type,
      base_percentage: Number(form.base_percentage).toFixed(4),
      fine_rules: fineRules,
      min_loan_amount: Number(form.min_loan_amount).toFixed(2),
      max_loan_amount: Number(form.max_loan_amount).toFixed(2),
      max_term_days: form.max_term_days,
    };

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      // ✅ Include tenantId in the URL path
      await api.post(`/api/v1/products/${tenantId}`, payload);
      setMessage("Loan product created successfully.");
      // Reset form...
      setForm({
        reference_title: "",
        interest_calculation_type: "flat",
        base_percentage: "1.0000",
        min_loan_amount: "0.00",
        max_loan_amount: "0.00",
        max_term_days: 30,
        grace_days: "",
        daily_penalty_rate: "",
        max_penalty_cap: "",
      });
      if (onCreated) onCreated();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Request failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Preview table
  const fineRulesPreview = () => {
    const rules = buildFineRules();
    const entries = Object.entries(rules);
    if (entries.length === 0) {
      return <p className="text-gray-500 text-sm">No fine rules set.</p>;
    }
    return (
      <table className="min-w-full text-sm border border-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-2 py-1 border text-left">Rule</th>
            <th className="px-2 py-1 border text-left">Value</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, value]) => (
            <tr key={key}>
              <td className="px-2 py-1 border capitalize">
                {key.replace(/_/g, " ")}
              </td>
              <td className="px-2 py-1 border">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-md shadow-sm">
        <p className="text-red-600">Please log in to create a loan product.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-md shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Add Loan Product</h2>

      {message && (
        <div className="mb-4 p-3 bg-green-50 text-green-800 rounded">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-800 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Reference Title
          </label>
          <input
            name="reference_title"
            value={form.reference_title}
            onChange={handleChange}
            className="border-2 border-slate-300 rounded p-2 w-full my-2"
            placeholder="School fee Loan"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Interest Calculation Type
          </label>
          <select
            name="interest_calculation_type"
            value={form.interest_calculation_type}
            onChange={handleChange}
            className="border-2 border-slate-300 rounded p-2 w-full my-2">
            <option value="flat">Flat</option>
            <option value="reducing_balance">Reducing Balance</option>
            <option value="compound">Compound</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Base Percentage (%)
            </label>
            <input
              name="base_percentage"
              value={form.base_percentage}
              onChange={handleChange}
              className="border-2 border-slate-300 rounded p-2 w-full my-2"
              placeholder="12.5000"
              step="0.0001"
            />
            <p className="text-xs text-gray-500 mt-1">
              Numeric, up to 4 decimal places.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Max Term Days
            </label>
            <input
              name="max_term_days"
              type="number"
              value={form.max_term_days === 0 ? "" : form.max_term_days}
              onChange={handleChange}
              className="border-2 border-slate-300 rounded p-2 w-full my-2"
              placeholder="180"
              min={1}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Min Loan Amount
            </label>
            <input
              name="min_loan_amount"
              value={form.min_loan_amount}
              onChange={handleChange}
              className="border-2 border-slate-300 rounded p-2 w-full my-2"
              placeholder="500.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Max Loan Amount
            </label>
            <input
              name="max_loan_amount"
              value={form.max_loan_amount}
              onChange={handleChange}
              className="border-2 border-slate-300 rounded p-2 w-full my-2"
              placeholder="25000.00"
            />
          </div>
        </div>

        {/* Fine Rules */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fine Rules (optional)
          </label>
          <div className="grid grid-cols-3 gap-2 my-2">
            <div>
              <input
                name="grace_days"
                type="number"
                value={form.grace_days}
                onChange={handleChange}
                className="border-2 border-slate-300 rounded p-2 w-full"
                placeholder="Grace days"
                min="0"
                step="1"
              />
            </div>
            <div>
              <input
                name="daily_penalty_rate"
                type="number"
                value={form.daily_penalty_rate}
                onChange={handleChange}
                className="border-2 border-slate-300 rounded p-2 w-full"
                placeholder="Daily penalty rate"
                min="0"
                step="0.0001"
              />
            </div>
            <div>
              <input
                name="max_penalty_cap"
                type="number"
                value={form.max_penalty_cap}
                onChange={handleChange}
                className="border-2 border-slate-300 rounded p-2 w-full"
                placeholder="Max penalty cap"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Leave fields empty to skip fine rules. Values must be non‑negative
            numbers.
          </p>

          <div className="mt-3 p-3 border border-gray-200 rounded bg-gray-50">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
            {fineRulesPreview()}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60">
            {loading ? "Saving..." : "Create Loan Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLoanProductForm;
