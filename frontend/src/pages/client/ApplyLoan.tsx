import { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "../../hooks/useAuth"; // Reusing your existing auth hook
import ApplyLoanCard from "../../components/client/ApplyLoanCard";

// Matching backend layout structure
interface LoanProduct {
  id?: string;
  reference_title: string;
  interest_calculation_type: "flat" | "reducing_balance" | "compound";
  base_percentage: string;
  min_loan_amount: string;
  max_loan_amount: string;
  max_term_days: number;
}

const api = axios.create({
  baseURL:
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

const ApplyLoan = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllProducts = async () => {
      if (!tenantId) return;

      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/api/v1/products/${tenantId}`);
        const data = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setProducts(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Error loading products catalog:", err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load available loan plans.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, [tenantId]);

  // Auth Guard layout check
  if (!tenantId) {
    return (
      <section className="mx-4 my-5 max-w-xl text-center bg-yellow-50 border border-yellow-200 p-6 rounded-xl">
        <h2 className="font-bold text-yellow-800">Authentication Required</h2>
        <p className="text-sm text-yellow-700 mt-1">
          Please log in to view and browse available financial products.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-4 my-5">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Apply Loan
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Browse our collection of customized loan products designed exactly for
          your financial needs.
        </p>
      </div>

      {/* Loading State Feedback */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mb-2"></div>
          <p className="text-gray-400 text-sm">Fetching catalog plans...</p>
        </div>
      )}

      {/* Error Message Layout */}
      {error && !loading && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-800 rounded-xl max-w-md">
          <p className="font-semibold text-sm">{error}</p>
        </div>
      )}

      {/* Empty State Catalog Layout */}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-12 bg-gray-50 border border-dashed rounded-2xl border-gray-200">
          <p className="text-gray-400 text-sm">
            No loan products are active at this moment.
          </p>
        </div>
      )}

      {/* Dynamic Render Product Grid Grid */}
      {!loading && !error && products.length > 0 && (
        <article className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
          {products.map((product) => (
            <ApplyLoanCard
              key={product.id || product.reference_title}
              tenantId={tenantId}
              productId={product.id || ""}
            />
          ))}
        </article>
      )}
    </section>
  );
};

export default ApplyLoan;
