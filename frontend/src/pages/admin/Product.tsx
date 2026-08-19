import { useState, type ComponentType } from "react";
import { Plus, X } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import AddLoanProductFormRaw from "../../components/admin/AddLoanProductForm";
import LoanProductTable from "../../components/admin/LoanProductTable";

const AddLoanProductForm = AddLoanProductFormRaw as ComponentType<{
  onCreated: () => void;
}>;

const Product = () => {
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);

  const toggleLoanProductForm = () => {
    setShowAddForm((s) => !s);
  };

  const handleCreated = () => {
    setShowAddForm(false);
  };

  // If user is not logged in, show a message
  if (!user) {
    return (
      <div className="p-6 text-center text-red-600">
        Please log in to manage loan products.
      </div>
    );
  }

  return (
    <section className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-semibold text-2xl">Loan Products</h1>
          <p className="text-sm text-gray-600">
            Add and manage loan products clients can select and apply for.
          </p>
        </div>

        <div>
          <button
            onClick={toggleLoanProductForm}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-900 text-white rounded text-sm">
            <Plus size={16} /> Add Loan Product
          </button>
        </div>
      </div>

      {/* Modal Overlay */}
      {showAddForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
          onClick={toggleLoanProductForm}>
          <div
            className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button
              onClick={toggleLoanProductForm}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-ink/45 transition hover:bg-ink/5 hover:text-ink"
              type="button">
              <X className="h-5 w-5" />
            </button>
            {/* The form itself will scroll inside this container if needed */}
            <AddLoanProductForm onCreated={handleCreated} />
          </div>
        </div>
      )}

      <LoanProductTable />
    </section>
  );
};

export default Product;