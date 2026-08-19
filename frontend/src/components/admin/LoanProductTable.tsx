import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { api } from "../../utils/api";
import useAuth from "../../hooks/useAuth";

const LoanProductTable = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const fetchProducts = async () => {
    if (!tenantId) {
      setTableError("Please log in to view products.");
      return;
    }

    setLoading(true);
    setTableError(null);
    try {
      const res = await api.get(`/api/v1/products/${tenantId}`);
      setProducts(Array.isArray(res.data.data) ? res.data.data : []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setTableError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load products.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) {
      // We call an async function; setState happens after the request resolves,
      // so it's not synchronous. This lint warning can be safely ignored.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchProducts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  const handleDelete = async (id: string | number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await api.delete(`/api/v1/products/${tenantId}/delete/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return (
      <div className="p-6 text-center text-red-600">
        Please log in to manage loan products.
      </div>
    );
  }

  return (
    <article className="bg-white rounded shadow-sm overflow-x-auto">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            <strong>{products.length}</strong> product
            {products.length !== 1 && "s"}
          </div>
          {loading && <div className="text-sm text-gray-500">Loading...</div>}
        </div>
      </div>

      {tableError && (
        <div className="p-4 text-sm text-red-700 bg-red-50">{tableError}</div>
      )}

      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs text-gray-600 uppercase">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Interest Type</th>
            <th className="px-4 py-3">Base %</th>
            <th className="px-4 py-3">Min Amount</th>
            <th className="px-4 py-3">Max Amount</th>
            <th className="px-4 py-3">Term (days)</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.length === 0 && !loading ? (
            <tr>
              <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                No products found. Add a loan product to get started.
              </td>
            </tr>
          ) : (
            products.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{p.reference_title}</td>
                <td className="px-4 py-3">{p.interest_calculation_type}</td>
                <td className="px-4 py-3">{p.base_percentage}</td>
                <td className="px-4 py-3">{p.min_loan_amount}</td>
                <td className="px-4 py-3">{p.max_loan_amount}</td>
                <td className="px-4 py-3">{p.min_term_days}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert("Edit not implemented yet")}
                      className="px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-100">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                      className="inline-flex items-center gap-2 px-2 py-1 text-xs rounded bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 disabled:opacity-60">
                      <Trash2 size={14} />
                      {deletingId === p.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </article>
  );
};

export default LoanProductTable;
