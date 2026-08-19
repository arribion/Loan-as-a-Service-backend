import { useState, useEffect } from "react";
import axios from "axios";

// Define the shape of your product data from the previous step
interface LoanProduct {
  id?: string;
  reference_title: string;
  interest_calculation_type: "flat" | "reducing_balance" | "compound";
  base_percentage: string; // base_percentage comes as string from backend `.toFixed(4)`
  min_loan_amount: string;
  max_loan_amount: string;
  max_term_days: number;
}

interface ApplyLoanCardProps {
  tenantId: string;
  productId: string; // Pass this to find the specific product from the array
}

const api = axios.create({
  baseURL:
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

const ApplyLoanCard = ({ tenantId, productId }: ApplyLoanCardProps) => {
  // Config states
  const [loanConfig, setLoanConfig] = useState<LoanProduct | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState<boolean>(true);

  // Form states
  const [amount, setAmount] = useState<number>(0);
  const [days, setDays] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch product rules from the API on mount
  useEffect(() => {
    const getLoanDetails = async () => {
      try {
        setPageLoading(true);
        setFetchError(null);
        const response = await api.get(`/api/v1/products/${tenantId}`);
        const products: LoanProduct[] = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        // Match the correct product or fallback to the first active choice
        const targetProduct =
          products.find((p) => p.id === productId) || products[0];

        if (!targetProduct) {
          throw new Error("No loan products available for this tenant.");
        }

        setLoanConfig(targetProduct);
        // Initialize interactive inputs based on fetched config limits
        setAmount(Number(targetProduct.min_loan_amount));
        setDays(
          targetProduct.max_term_days > 15 ? 15 : targetProduct.max_term_days,
        );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("Error fetching loan products:", error);
        setFetchError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load products.",
        );
      } finally {
        setPageLoading(false);
      }
    };

    if (tenantId) {
      getLoanDetails();
    }
  }, [tenantId, productId]);

  // Handle Loading or Error layout safely before calculation logic
  if (pageLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow border max-w-md mx-auto">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
        <p className="text-gray-500 text-sm">Loading loan configurations...</p>
      </div>
    );
  }

  if (fetchError || !loanConfig) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-800 rounded-2xl max-w-md mx-auto">
        <h3 className="font-bold">Initialization Error</h3>
        <p className="text-sm mt-1">{fetchError || "Configuration missing."}</p>
      </div>
    );
  }

  // Safe numerical calculations after ensuring config data exists
  const basePercentageNum = Number(loanConfig.base_percentage) || 0;
  const minAmountNum = Number(loanConfig.min_loan_amount) || 0;
  const maxAmountNum = Number(loanConfig.max_loan_amount) || 0;

  const interest = amount * (basePercentageNum / 100) * (days / 360);
  const totalRepayable = amount + interest;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const applicationPayload = {
      tenant_id: tenantId,
      loan_product: loanConfig.reference_title,
      requested_amount: Number(amount),
      term_days: Number(days),
      estimated_interest: Number(interest.toFixed(2)),
      total_repayment: Number(totalRepayable.toFixed(2)),
    };

    console.log("Submitting Loan Application:", applicationPayload);
    // Mimic API post delay
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full uppercase tracking-wider inline-block">
          {loanConfig.interest_calculation_type} Rate
        </span>
        <h2 className="text-2xl font-bold text-gray-900 mt-2">
          {loanConfig.reference_title}
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Borrow up to KES {maxAmountNum.toLocaleString()} at{" "}
          {basePercentageNum}% APR
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount Slider & Input */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-gray-700">
              Loan Amount
            </label>
            <span className="text-lg font-bold text-blue-600">
              KES {amount.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min={minAmountNum}
            max={maxAmountNum}
            step="100"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Min: KES {minAmountNum.toLocaleString()}</span>
            <span>Max: KES {maxAmountNum.toLocaleString()}</span>
          </div>
        </div>

        {/* Term Slider & Input */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-gray-700">
              Loan Term
            </label>
            <span className="text-lg font-bold text-blue-600">{days} Days</span>
          </div>
          <input
            type="range"
            min="15"
            max={loanConfig.max_term_days}
            step="1"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Min: 15 Days</span>
            <span>Max: {loanConfig.max_term_days} Days</span>
          </div>
        </div>

        {/* Breakdown Summary */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Principal Amount</span>
            <span className="font-medium">KES {amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Interest ({basePercentageNum}%)</span>
            <span className="font-medium">
              KES{" "}
              {interest.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
            <span className="text-base font-bold text-gray-900">
              Total Repayment
            </span>
            <span className="text-xl font-extrabold text-gray-900">
              KES{" "}
              {totalRepayable.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded transition duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center">
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            "Apply Now"
          )}
        </button>
      </form>
    </div>
  );
};

export default ApplyLoanCard;