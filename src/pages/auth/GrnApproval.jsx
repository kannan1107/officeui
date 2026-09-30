import { useMemo, useState } from "react";
import {
  useGetItemsQuery,
  useUpdateItemMutation,
} from "../../features/ApplicationApi";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

function GrnApproval() {
  const { data, isLoading, isError, refetch } = useGetItemsQuery();
  const [updateItem, { isLoading: isUpdating }] = useUpdateItemMutation();
  const [view, setView] = useState("pending");
  const [search, setSearch] = useState("");
  const [actionError, setActionError] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const items = Array.isArray(data) ? data : data?.items || data?.data || [];
  const submissions = items.filter(
    (item) =>
      !item.approvalStatus ||
      item.approvalStatus === "pending" ||
      item.approvalStatus === "approved" ||
      item.approvalStatus === "rejected",
  );
  const pendingCount = submissions.filter(
    (item) => !item.approvalStatus || item.approvalStatus === "pending",
  ).length;
  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return submissions
      .filter(
        (item) =>
          view === "all" ||
          !item.approvalStatus ||
          item.approvalStatus === "pending",
      )
      .filter((item) =>
        [
          item.itemname,
          item.partno,
          item.location,
          item.place,
          item.addedBy,
        ].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(query),
        ),
      )
      .sort((a, b) => {
        const aPending = !a.approvalStatus || a.approvalStatus === "pending";
        const bPending = !b.approvalStatus || b.approvalStatus === "pending";
        return (
          Number(bPending) - Number(aPending) ||
          new Date(b.addedDate) - new Date(a.addedDate)
        );
      });
  }, [submissions, view, search]);
  const visiblePendingItems = visibleItems.filter(
    (item) => !item.approvalStatus || item.approvalStatus === "pending",
  );
  const selectedPendingItems = visiblePendingItems.filter((item) =>
    selectedIds.includes(item._id),
  );
  const allVisiblePendingSelected =
    visiblePendingItems.length > 0 &&
    visiblePendingItems.every((item) => selectedIds.includes(item._id));

  const toggleSelectAll = (checked) => {
    const visiblePendingIds = visiblePendingItems.map((item) => item._id);
    setSelectedIds((current) =>
      checked
        ? [...new Set([...current, ...visiblePendingIds])]
        : current.filter((id) => !visiblePendingIds.includes(id)),
    );
  };

  const toggleSelected = (itemId, checked) => {
    setSelectedIds((current) =>
      checked
        ? [...new Set([...current, itemId])]
        : current.filter((id) => id !== itemId),
    );
  };

  const handleAction = async (item, approvalStatus) => {
    setActionError("");
    try {
      await updateItem({
        itemId: item._id,
        updatedData: { approvalStatus },
      }).unwrap();
      setSelectedIds((current) => current.filter((id) => id !== item._id));
      await refetch();
      if (approvalStatus === "approved") setView("all");
    } catch (error) {
      setActionError(
        error?.data?.message || "Could not update this GRN. Please try again.",
      );
    }
  };

  const handleBulkApprove = async () => {
    if (!selectedPendingItems.length) return;

    setActionError("");
    try {
      for (const item of selectedPendingItems) {
        await updateItem({
          itemId: item._id,
          updatedData: { approvalStatus: "approved" },
        }).unwrap();
      }
      setSelectedIds([]);
      await refetch();
      setView("all");
    } catch (error) {
      setActionError(
        error?.data?.message ||
          "Some GRNs could not be approved. Please review the list and try again.",
      );
      await refetch();
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-10 pt-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
              Inventory
            </p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              GRN Approvals
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Review and approve goods received submissions.
            </p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <span className="text-2xl font-bold text-amber-800">
              {pendingCount}
            </span>
            <span className="ml-2 text-sm text-amber-800">
              pending approval
            </span>
          </div>
        </header>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              {[
                [
                  "pending",
                  `Pending${pendingCount ? ` (${pendingCount})` : ""}`,
                ],
                ["all", "All submissions"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setView(key);
                    setSelectedIds([]);
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold ${view === key ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  {label}
                </button>
              ))}
              {selectedPendingItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleBulkApprove}
                  disabled={isUpdating}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isUpdating
                    ? "Approving..."
                    : `Approve selected (${selectedPendingItems.length})`}
                </button>
              )}
            </div>
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setSelectedIds([]);
              }}
              placeholder="Search item, part no, location..."
              aria-label="Search GRN submissions"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:max-w-xs"
            />
          </div>

          {actionError && (
            <p
              role="alert"
              className="m-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {actionError}
            </p>
          )}
          {isLoading ? (
            <p className="p-10 text-center text-sm text-slate-500">
              Loading GRN submissions...
            </p>
          ) : isError ? (
            <div className="p-10 text-center">
              <p className="text-sm text-red-700">
                Unable to load GRN submissions.
              </p>
              <button
                type="button"
                onClick={refetch}
                className="mt-3 text-sm font-semibold text-blue-700 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="w-12 px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label="Select all visible pending GRNs"
                        checked={allVisiblePendingSelected}
                        disabled={!visiblePendingItems.length || isUpdating}
                        onChange={(event) =>
                          toggleSelectAll(event.target.checked)
                        }
                        className="h-4 w-4 accent-emerald-600"
                      />
                    </th>
                    {[
                      "Item",
                      "Part No",
                      "Quantity",
                      "Location",
                      "Place",
                      "Submitted By",
                      "Date",
                      "Status",
                      "Action",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="whitespace-nowrap px-4 py-3 font-semibold"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-4 py-12 text-center text-slate-500"
                      >
                        {view === "pending"
                          ? "No GRN submissions are waiting for approval."
                          : "No GRN submissions found."}
                      </td>
                    </tr>
                  ) : (
                    visibleItems.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          {(!item.approvalStatus ||
                            item.approvalStatus === "pending") && (
                            <input
                              type="checkbox"
                              aria-label={`Select ${item.itemname || "item"} for approval`}
                              checked={selectedIds.includes(item._id)}
                              disabled={isUpdating}
                              onChange={(event) =>
                                toggleSelected(item._id, event.target.checked)
                              }
                              className="h-4 w-4 accent-emerald-600"
                            />
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-800">
                          {item.itemname || "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                          {item.partno || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {item.quantity ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                          {item.location || "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                          {item.place || "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                          {item.addedBy || "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                          {item.addedDate
                            ? new Date(item.addedDate).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[item.approvalStatus || "pending"] || "bg-slate-100 text-slate-600"}`}
                          >
                            {item.approvalStatus || "pending"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {!item.approvalStatus ||
                          item.approvalStatus === "pending" ? (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleAction(item, "approved")}
                                disabled={isUpdating}
                                className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAction(item, "rejected")}
                                disabled={isUpdating}
                                className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400">Reviewed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default GrnApproval;
