import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetItemsQuery } from "../../features/ApplicationApi";

function Spar() {
  const navigate = useNavigate();
  const { data: response, error, isLoading } = useGetItemsQuery();

  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [imageZoom, setImageZoom] = useState(1);

  const items = useMemo(
    () =>
      Array.isArray(response)
        ? response
        : response?.items || response?.data || [],
    [response],
  );

  // DEBUG: remove after fixing
  if (items.length)
    console.log("STATUS VALUES:", [...new Set(items.map((i) => i.status))]);

  const normalizeValue = (value) =>
    String(value ?? "")
      .trim()
      .toLowerCase();

  const viewItem = viewId ? items.find((i) => i._id === viewId) : null;

  const closeViewDetails = () => {
    setViewId(null);
    setImageZoom(1);
  };

  useEffect(() => {
    if (!viewId) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeViewDetails();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewId]);

  const getCertificateUrl = (item) => {
    if (typeof item?.certificate === "string") return item.certificate;
    return (
      item?.certificate?.secure_url ||
      item?.certificate?.url ||
      item?.certificateUrl ||
      ""
    );
  };

  const filteredItems = useMemo(() => {
    const searchTerm = normalizeValue(search);
    if (!searchTerm) return [];
    return items.filter((item) =>
      Object.values(item).some((value) =>
        normalizeValue(value).includes(searchTerm),
      ),
    );
  }, [items, search]);

  const placeGroups = useMemo(() => {
    const map = new Map();
    filteredItems.forEach((item) => {
      const key = `${normalizeValue(item.place)}__${normalizeValue(item.placeId)}`;
      if (!map.has(key)) {
        map.set(key, {
          place: item.place,
          placeId: item.placeId,
          location: item.location,
          locationId: item.locationId,
          availableQty: 0,
        });
      }
    });
    const searchedPartno = filteredItems[0]?.partno;
    items.forEach((item) => {
      const key = `${normalizeValue(item.place)}__${normalizeValue(item.placeId)}`;
      if (
        map.has(key) &&
        normalizeValue(item.partno) === normalizeValue(searchedPartno)
      ) {
        map.get(key).availableQty += Number(item.quantity) || 0;
      }
    });
    return Array.from(map.values());
  }, [filteredItems, items]);

  const totalAvailable = useMemo(() => {
    if (!filteredItems.length) return 0;
    const partno = normalizeValue(filteredItems[0].partno);
    return items
      .filter((i) => normalizeValue(i.partno) === partno)
      .reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
  }, [filteredItems, items]);

  const selectedItems = useMemo(() => {
    if (!selectedGroup || !filteredItems.length) return [];
    const searchedPartno = normalizeValue(filteredItems[0].partno);
    return items.filter(
      (i) =>
        normalizeValue(i.place) === normalizeValue(selectedGroup.place) &&
        normalizeValue(i.placeId) === normalizeValue(selectedGroup.placeId) &&
        normalizeValue(i.partno) === searchedPartno,
    );
  }, [selectedGroup, items, filteredItems]);

  if (isLoading)
    return (
      <div className="p-6 text-center">
        <p>Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="p-6 text-center text-red-600">
        <p>Error loading items</p>
      </div>
    );

  return (
    <div className="w-full p-6">
      <h2 className="mb-4 text-2xl font-bold">Search Items</h2>

      <div className="mb-6 w-full">
        <input
          type="text"
          placeholder="Search item, part number, location..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedGroup(null);
          }}
          className="w-full max-w-xl rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {search && filteredItems.length === 0 ? (
        <p className="text-gray-500">No items found</p>
      ) : (
        <div className="w-full">
          {filteredItems.length > 0 && (
            <>
              {/* Summary header */}
              <div className="mb-6 grid w-full grid-cols-1 gap-4 bg-white p-4 md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Description
                  </p>
                  <h1 className="text-3xl font-bold">
                    {filteredItems[0].itemname || "-"}
                  </h1>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Part Number
                  </p>
                  <h3 className="text-2xl font-semibold">
                    {filteredItems[0].partno || "-"}
                  </h3>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Total Available ({placeGroups.length} place
                    {placeGroups.length !== 1 ? "s" : ""})
                  </p>
                  <div className="flex h-16 w-full max-w-xs items-center justify-center rounded-lg bg-green-500 text-white shadow">
                    <h1 className="text-5xl font-bold">{totalAvailable}</h1>
                  </div>
                </div>
              </div>

              {/* Place cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {placeGroups.map((group) => (
                  <button
                    key={`${group.place}__${group.placeId}`}
                    type="button"
                    onClick={() =>
                      setSelectedGroup(
                        selectedGroup?.place === group.place &&
                          selectedGroup?.placeId === group.placeId
                          ? null
                          : group,
                      )
                    }
                    className={`flex flex-col items-center gap-1 rounded-lg border bg-white p-4 shadow-sm hover:opacity-90 ${
                      selectedGroup?.place === group.place &&
                      selectedGroup?.placeId === group.placeId
                        ? "border-blue-500 ring-2 ring-blue-400"
                        : "border-gray-200"
                    }`}
                  >
                    <span className="text-sm font-semibold">
                      {group.place || "Place"} ({group.placeId || "-"})
                    </span>
                    <span className="text-xs text-gray-400">
                      {group.location}
                      {group.locationId ? ` · ${group.locationId}` : ""}
                    </span>
                    <div className="flex h-16 w-full items-center justify-center rounded-lg bg-green-500 text-white shadow">
                      <span className="text-center">
                        <span className="block text-xs font-semibold">
                          Available Quantity
                        </span>
                        <span className="block text-3xl font-bold">
                          {group.availableQty}
                        </span>
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Item list panel */}
              {selectedGroup && (
                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-bold">
                      Items at {selectedGroup.place} ({selectedGroup.placeId})
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSelectedGroup(null)}
                      className="text-sm text-gray-500 hover:text-gray-800"
                    >
                      ✕ Close
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {selectedItems.map((item) => (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => setViewId(item._id)}
                        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm text-left hover:border-blue-400 hover:shadow-md transition-all"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-base font-bold">
                            {item.itemname || "-"}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                              normalizeValue(item.status) === "available"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {item.status || "-"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                          <span className="font-medium text-gray-400">
                            Part No
                          </span>
                          <span>{item.partno || "-"}</span>
                          <span className="font-medium text-gray-400">
                            Batch
                          </span>
                          <span>{item.batch || "-"}</span>
                          <span className="font-medium text-gray-400">
                            Quantity
                          </span>
                          <span className="font-bold text-green-600">
                            {item.quantity ?? "-"}
                          </span>
                          <span className="font-medium text-gray-400">
                            Location
                          </span>
                          <span>{item.location || "-"}</span>
                          <span className="font-medium text-gray-400">
                            Batch No
                          </span>
                          <span>{item.batch || "-"}</span>
                          <span className="font-medium text-gray-400">
                            S. No
                          </span>
                          <span>{item.sno || "-"}</span>
                        </div>
                        <p className="mt-2 text-xs text-blue-500 font-medium">
                          Click to view full details →
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* View Details Modal — same as Stores page */}
      {viewItem &&
        (() => {
          const getters = viewItem.outHistory || [];
          const totalGot = getters.reduce(
            (sum, g) => sum + Number(g.quantity),
            0,
          );
          const balance = Number(viewItem.quantity) || 0;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
                <div className="flex shrink-0 items-center justify-between gap-3 border-b px-6 py-4">
                  <h3 className="min-w-0 truncate text-xl font-bold">
                    {viewItem.itemname}
                  </h3>
                  <button
                    type="button"
                    onClick={closeViewDetails}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-2xl leading-none text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="overflow-y-auto px-6 py-4">
                  {viewItem.image && (
                    <div className="relative mb-4 h-48 overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={viewItem.image}
                        alt={viewItem.itemname}
                        onClick={() => {
                          const viewer = window.open(
                            "",
                            "store-image-viewer",
                            "width=900,height=700",
                          );
                          if (viewer) {
                            viewer.document.write(
                              `<!doctype html><html><body style="margin:0;background:#111;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${viewItem.image}" style="max-width:100%;max-height:100vh;object-fit:contain"></body></html>`,
                            );
                            viewer.document.close();
                          }
                        }}
                        className="w-full h-full object-contain cursor-pointer transition-transform duration-200"
                        style={{ transform: `scale(${imageZoom})` }}
                      />
                      <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-black/70 p-1 text-white">
                        <button
                          type="button"
                          onClick={() =>
                            setImageZoom((z) => Math.max(1, z - 0.25))
                          }
                          disabled={imageZoom === 1}
                          className="h-8 w-8 rounded text-xl leading-none hover:bg-white/20 disabled:opacity-40"
                        >
                          −
                        </button>
                        <span className="min-w-12 text-center text-xs">
                          {Math.round(imageZoom * 100)}%
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setImageZoom((z) => Math.min(3, z + 0.25))
                          }
                          disabled={imageZoom === 3}
                          className="h-8 w-8 rounded text-xl leading-none hover:bg-white/20 disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    {[
                      ["Item Name", viewItem.itemname],
                      ["Batch", viewItem.batch],
                      ["Part No", viewItem.partno],
                      ["Alternative Part", viewItem.alternativePart],
                      ["Category", viewItem.category],
                      ["Condition", viewItem.condition],
                      ["Quantity", viewItem.quantity],
                      ["Status", viewItem.status],
                      ["Location", viewItem.location],
                      ["Location ID", viewItem.locationId],
                      ["Place", viewItem.place],
                      ["Place ID", viewItem.placeId],
                      ["Self Life", viewItem.selfLife],
                      ["In History", (viewItem.inHistory || []).length],
                      ["Out History", (viewItem.outHistory || []).length],
                    ].map(([label, val]) =>
                      val ? (
                        <div
                          key={label}
                          className="bg-gray-50 rounded-lg px-3 py-2"
                        >
                          <p className="text-gray-400 text-xs">{label}</p>
                          <p className="font-medium">{val}</p>
                        </div>
                      ) : null,
                    )}
                  </div>

                  {viewItem.description && (
                    <div className="mt-3 bg-gray-50 rounded-lg px-3 py-2 text-sm">
                      <p className="text-gray-400 text-xs mb-1">Description</p>
                      <p>{viewItem.description}</p>
                    </div>
                  )}

                  <div className="mt-3 flex flex-col items-start justify-between gap-3 rounded-lg bg-blue-50 px-3 py-2 text-sm sm:flex-row sm:items-center">
                    <div>
                      <p className="text-gray-400 text-xs">Certificate</p>
                      <p className="font-medium">
                        {getCertificateUrl(viewItem)
                          ? "Certificate document available"
                          : "No certificate uploaded for this item"}
                      </p>
                    </div>
                    {getCertificateUrl(viewItem) ? (
                      <a
                        href={getCertificateUrl(viewItem)}
                        download={`${viewItem.itemname || "item"}-certificate`}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                      >
                        Download Certificate
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="shrink-0 rounded-lg bg-gray-300 px-3 py-2 text-gray-500"
                      >
                        Download unavailable
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/item-inout", { state: { item: viewItem } })
                    }
                    className="mt-3 w-full rounded-lg bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"
                  >
                    Item In / Out
                  </button>

                  {/* Getter Details */}
                  <div className="mt-4 border-t pt-3">
                    <p className="font-semibold text-sm mb-2">Getter Details</p>
                    <div className="flex gap-4 text-sm mb-3 bg-gray-50 rounded-lg px-4 py-2">
                      <span>
                        Total Qty: <strong>{viewItem.quantity || 0}</strong>
                      </span>
                      <span>
                        Total Got: <strong>{totalGot}</strong>
                      </span>
                      <span
                        className={
                          balance < 0
                            ? "text-red-500 font-bold"
                            : "text-green-600 font-bold"
                        }
                      >
                        Balance: <strong>{balance}</strong>
                      </span>
                    </div>
                    {getters.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-3">
                        No getters yet.
                      </p>
                    ) : (
                      <table className="w-full text-sm border rounded-lg overflow-hidden">
                        <thead>
                          <tr className="bg-gray-50 text-left">
                            <th className="px-3 py-2">#</th>
                            <th className="px-3 py-2">Getter Name</th>
                            <th className="px-3 py-2">Quantity</th>
                            <th className="px-3 py-2">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {getters.map((entry, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-3 py-2">{i + 1}</td>
                              <td className="px-3 py-2">{entry.person}</td>
                              <td className="px-3 py-2">{entry.quantity}</td>
                              <td className="px-3 py-2">
                                {entry.date
                                  ? new Date(entry.date).toLocaleDateString()
                                  : "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}

export default Spar;
