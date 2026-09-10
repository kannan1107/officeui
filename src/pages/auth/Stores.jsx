import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetItemsQuery,
  useUpdateItemMutation,
  useDeleteItemMutation,
  useItemStockOutMutation,
} from "../../features/ApplicationApi";

function Stores() {
  const navigate = useNavigate();
  const { data: response, error, isLoading, refetch } = useGetItemsQuery();
  const items = Array.isArray(response)
    ? response
    : response?.items || response?.data || [];
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [getterItem, setGetterItem] = useState(null);
  const [getterInput, setGetterInput] = useState({
    name: "",
    quantity: "",
    date: "",
  });
  const [getterList, setGetterList] = useState({});
  const [updateItem, { isLoading: updating }] = useUpdateItemMutation();
  const [deleteItem, { isLoading: deleting }] = useDeleteItemMutation();
  const [itemStockOut] = useItemStockOutMutation();

  const filtered = items.filter((item) =>
    [
      item.itemname,
      item.batch,
      item.category,
      item.partno,
      item.alternativePart,
    ].some((val) =>
      String(val ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  // always read live item from items array
  const viewItem = viewId ? items.find((i) => i._id === viewId) : null;

  const closeViewDetails = () => {
    setViewId(null);
    setImageZoom(1);
  };

  useEffect(() => {
    if (!viewId) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeViewDetails();
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

  const escapeHtml = (value) =>
    String(value ?? "").replace(
      /[&<>'"]/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[character],
    );

  const formatTagValue = (value) => {
    if (Array.isArray(value) || (value && typeof value === "object")) {
      return JSON.stringify(value, null, 2);
    }
    return String(value ?? "-");
  };

  const downloadTag = (item) => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    const companyName =
      import.meta.env.VITE_COMPANY_NAME ||
      storedUser?.company ||
      item.company ||
      "Office";
    const excludedFields = new Set([
      "_id",
      "__v",
      "createdAt",
      "updatedAt",
      "inHistory",
      "outHistory",
      "image",
      "images",
    ]);
    const itemFields = Object.entries(item)
      .filter(([key]) => !excludedFields.has(key))
      .filter(([key]) => key !== "description");
    const description = item.description
      ? `
          <tr class="description-row">
            <th>Description</th>
            <td colspan="3">${escapeHtml(formatTagValue(item.description))}</td>
          </tr>`
      : "";
    const details = itemFields
      .reduce((rows, field, index) => {
        if (index % 2 === 0) rows.push([field]);
        else rows[rows.length - 1].push(field);
        return rows;
      }, [])
      .map(
        (row) => `
          <tr>
            ${row
              .map(
                ([key, value]) => `
                  <th>${escapeHtml(key.replace(/([A-Z])/g, " $1"))}</th>
                  <td>${escapeHtml(formatTagValue(value))}</td>`,
              )
              .join("")}
            ${row.length === 1 ? "<th></th><td></td>" : ""}
          </tr>`,
      )
      .join("");
    const tagWindow = window.open("", "item-tag", "width=900,height=700");

    if (!tagWindow) {
      alert("Please allow pop-ups to print the item tag.");
      return;
    }

    tagWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${escapeHtml(item.itemname || "Item Tag")}</title>
          <style>
            * { box-sizing: border-box; }
            @page { size: A5 portrait; margin: 8mm; }
            body { margin: 0; padding: 8mm; color: #111827; font-family: Arial, sans-serif; }
            .tag { width: 100%; max-width: 148mm; margin: 0 auto; border: 2px solid #111827; padding: 12px; page-break-inside: avoid; }
            .header { text-align: center; border-bottom: 2px solid #111827; padding-bottom: 9px; margin-bottom: 10px; }
            .company { margin: 0; font-size: 20px; text-transform: uppercase; }
            .title { margin: 5px 0 0; font-size: 16px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #9ca3af; padding: 5px 7px; text-align: left; vertical-align: top; white-space: pre-wrap; word-break: break-word; font-size: 10px; }
            th { width: 18%; background: #f3f4f6; text-transform: capitalize; }
            td { width: 32%; }
            .description-row th { width: 18%; }
            .description-row td { width: auto; }
            @media print { body { padding: 0; } .tag { border-width: 1px; } }
          </style>
        </head>
        <body>
          <main class="tag">
            <header class="header">
              <h1 class="company">${escapeHtml(companyName)}</h1>
              <h2 class="title">${escapeHtml(item.itemname || "Item Details")}</h2>
            </header>
            <table>
              <tbody>${description}${details}</tbody>
            </table>
          </main>
          <script>
            window.addEventListener("load", () => {
              window.focus();
              window.print();
            });
          </script>
        </body>
      </html>
    `);
    tagWindow.document.close();
  };

  const openImageViewer = (image, title) => {
    const viewer = window.open(
      "",
      "store-image-viewer",
      "width=900,height=700",
    );
    if (!viewer) return;

    const safeImage = JSON.stringify(image).replace(/</g, "\\u003c");
    const safeTitle = JSON.stringify(title).replace(/</g, "\\u003c");
    const safeHtmlTitle = String(title).replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[character],
    );
    viewer.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${safeHtmlTitle}</title>
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; min-height: 100vh; display: flex; flex-direction: column; background: #111827; color: white; font-family: Arial, sans-serif; }
            header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 16px; background: #1f2937; }
            h1 { margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 16px; }
            .controls { display: flex; align-items: center; gap: 8px; }
            button { width: 36px; height: 32px; border: 0; border-radius: 6px; background: #374151; color: white; cursor: pointer; font-size: 20px; }
            button:hover { background: #4b5563; }
            button:disabled { cursor: not-allowed; opacity: .45; }
            #zoom-label { min-width: 52px; text-align: center; font-size: 12px; }
            main { flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 24px; }
            img { max-width: 100%; max-height: 100%; object-fit: contain; transform-origin: center; transition: transform .2s ease; }
          </style>
        </head>
        <body>
          <header>
            <h1 id="title"></h1>
            <div class="controls">
              <button id="zoom-out" type="button" aria-label="Zoom out" title="Zoom out">-</button>
              <span id="zoom-label">100%</span>
              <button id="zoom-in" type="button" aria-label="Zoom in" title="Zoom in">+</button>
            </div>
          </header>
          <main><img id="store-image" alt=""></main>
          <script>
            const image = ${safeImage};
            const title = ${safeTitle};
            const imageElement = document.getElementById("store-image");
            const titleElement = document.getElementById("title");
            const label = document.getElementById("zoom-label");
            const zoomOut = document.getElementById("zoom-out");
            const zoomIn = document.getElementById("zoom-in");
            let zoom = 1;
            imageElement.src = image;
            imageElement.alt = title;
            titleElement.textContent = title;
            const updateZoom = () => {
              imageElement.style.transform = "scale(" + zoom + ")";
              label.textContent = Math.round(zoom * 100) + "%";
              zoomOut.disabled = zoom === 1;
              zoomIn.disabled = zoom === 3;
            };
            zoomOut.addEventListener("click", () => { zoom = Math.max(1, zoom - .25); updateZoom(); });
            zoomIn.addEventListener("click", () => { zoom = Math.min(3, zoom + .25); updateZoom(); });
          </script>
        </body>
      </html>
    `);
    viewer.document.close();
    viewer.focus();
  };

  const handleGetterSubmit = async (e) => {
    e.preventDefault();
    if (!getterInput.name.trim() || !getterInput.quantity || !getterInput.date)
      return;
    try {
      await itemStockOut({
        id: getterItem._id,
        data: {
          person: getterInput.name,
          place: getterItem.place || "-",
          quantity: Number(getterInput.quantity),
          note: getterInput.date,
        },
      }).unwrap();
      setGetterList((prev) => ({
        ...prev,
        [getterItem._id]: [
          ...(prev[getterItem._id] || []),
          {
            name: getterInput.name.trim(),
            quantity: Number(getterInput.quantity),
            date: getterInput.date,
          },
        ],
      }));
      setGetterInput({ name: "", quantity: "", date: "" });
      refetch();
    } catch (err) {
      alert("Stock out failed: " + (err?.data?.message || "Unknown error"));
    }
  };

  const handleEditChange = (e) =>
    setEditItem((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateItem({
        itemId: editItem._id,
        updatedData: editItem,
      }).unwrap();
      setEditItem(null);
      refetch();
    } catch (err) {
      alert("Update failed: " + (err?.data?.message || "Unknown error"));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteItem(id).unwrap();
      refetch();
    } catch (err) {
      alert("Delete failed: " + (err?.data?.message || "Unknown error"));
    }
  };

  if (isLoading) return <div className="pt-16 p-6">Loading...</div>;
  if (error)
    return <div className="pt-16 p-6 text-red-500">Error loading items.</div>;

  return (
    <div className="pt-16 bg-gray-100 min-h-screen">
      <div className="p-6">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-3xl font-bold text-center mb-4">Item List</h2>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, batch, part no, alt part, category..."
            className="w-full border rounded-lg px-3 py-2 mb-4"
          />
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  {[
                    "Item Name",
                    "Batch",
                    "Part No",
                    "Alt Part",
                    "Category",
                    "Place",
                    "Place ID",
                    "Location",
                    "Location ID",
                    "Condition",
                    "Balance",
                    "Certificate",
                    "Getter Name",
                    "Get Quantity",
                    "Status",
                    "Self Life",
                    "In History",
                    "Out History",
                    "Description",
                    "Actions",
                  ].map((h) => (
                    <th key={h} className="py-2 px-4 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) =>
                  (() => {
                    const certificateUrl = getCertificateUrl(item);
                    return (
                      <tr key={item._id} className="border-b hover:bg-gray-50">
                        <td
                          className="py-2 px-4 text-blue-600 cursor-pointer hover:underline font-medium whitespace-nowrap"
                          onClick={() => setViewId(item._id)}
                        >
                          {item.itemname}
                        </td>

                        <td className="py-2 px-4">{item.batch}</td>
                        <td className="py-2 px-4">{item.partno}</td>
                        <td className="py-2 px-4">{item.alternativePart}</td>
                        <td className="py-2 px-4">{item.category}</td>
                        <td className="py-2 px-4">{item.place}</td>
                        <td className="py-2 px-4">{item.placeId}</td>
                        <td className="py-2 px-4">{item.location}</td>
                        <td className="py-2 px-4">{item.locationId}</td>

                        <td className="py-2 px-4">{item.condition}</td>
                        <td className="py-2 px-4">{item.quantity}</td>
                        <td className="py-2 px-4">
                          {certificateUrl ? (
                            <a
                              href={certificateUrl}
                              download={`${item.itemname || "item"}-certificate`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline whitespace-nowrap"
                            >
                              Download
                            </a>
                          ) : (
                            <span className="text-gray-400">Not available</span>
                          )}
                        </td>
                        <td className="py-2 px-4">
                          {(getterList[item._id] || []).map((g, i) => (
                            <div key={i}>{g.name}</div>
                          ))}
                        </td>
                        <td className="py-2 px-4">
                          {(getterList[item._id] || []).map((g, i) => (
                            <div key={i}>{g.balance}</div>
                          ))}
                        </td>
                        <td className="py-2 px-4">{item.status}</td>
                        <td className="py-2 px-4">{item.selfLife}</td>
                        <td className="py-2 px-4">
                          {(item.inHistory || []).length}
                        </td>
                        <td className="py-2 px-4">
                          {(item.outHistory || []).length}
                        </td>
                        <td className="py-2 px-4">{item.description}</td>
                        <td className="py-2 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditItem({ ...item })}
                              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              disabled={deleting}
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => {
                                setGetterItem(item);
                                setGetterInput({
                                  name: "",
                                  quantity: "",
                                  date: "",
                                });
                              }}
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                            >
                              Getter
                            </button>
                            <button
                              onClick={() => downloadTag(item)}
                              className="bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-900"
                            >
                              Download Tag
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })(),
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Details Modal — reads live from items + getterList */}
      {viewItem &&
        (() => {
          const getters = viewItem.outHistory || [];
          const totalGot = getters.reduce(
            (sum, g) => sum + Number(g.quantity),
            0,
          );
          const balance = Number(viewItem.quantity) || 0;
          return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">{viewItem.itemname}</h3>
                  <button
                    type="button"
                    onClick={closeViewDetails}
                    aria-label="Close item details"
                    title="Close item details"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-2xl leading-none text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                {viewItem.image && (
                  <div className="relative h-48 overflow-hidden rounded-lg mb-4 bg-gray-100">
                    <img
                      src={viewItem.image}
                      alt={viewItem.itemname}
                      onClick={() =>
                        openImageViewer(viewItem.image, viewItem.itemname)
                      }
                      title="Open image in a new window"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          openImageViewer(viewItem.image, viewItem.itemname);
                        }
                      }}
                      className="w-full h-full object-contain transition-transform duration-200"
                      style={{ transform: `scale(${imageZoom})` }}
                    />
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-black/70 p-1 text-white">
                      <button
                        type="button"
                        onClick={() =>
                          setImageZoom((zoom) => Math.max(1, zoom - 0.25))
                        }
                        disabled={imageZoom === 1}
                        title="Zoom out"
                        aria-label="Zoom out"
                        className="h-8 w-8 rounded text-xl leading-none hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        −
                      </button>
                      <span className="min-w-12 text-center text-xs">
                        {Math.round(imageZoom * 100)}%
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setImageZoom((zoom) => Math.min(3, zoom + 0.25))
                        }
                        disabled={imageZoom === 3}
                        title="Zoom in"
                        aria-label="Zoom in"
                        className="h-8 w-8 rounded text-xl leading-none hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm">
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

                <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-blue-50 px-3 py-2 text-sm">
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
                  onClick={() => downloadTag(viewItem)}
                  className="mt-3 w-full rounded-lg bg-gray-800 px-3 py-2 text-white hover:bg-gray-900"
                >
                  Download Tag
                </button>
                <button
                  type="button"
                  onClick={() =>
                    navigate("/item-inout", {
                      state: { item: viewItem },
                    })
                  }
                  className="mt-3 w-full rounded-lg bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"
                >
                  Item In / Out
                </button>
                {/* Getter Details */}
                <div className="mt-4 border-t pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold text-sm">Getter Details</p>
                    <button
                      onClick={() => {
                        setGetterItem(viewItem);
                        setGetterInput({ name: "", quantity: "", date: "" });
                      }}
                      className="bg-green-500 text-white text-xs px-3 py-1 rounded hover:bg-green-600"
                    >
                      + Add Getter
                    </button>
                  </div>
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
          );
        })()}

      {/* Getter Modal */}
      {getterItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                Getter — {getterItem.itemname}
              </h3>
              <button
                onClick={() => setGetterItem(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={handleGetterSubmit}
              className="grid grid-cols-2 gap-2 mb-4"
            >
              <div>
                <label className="block text-xs mb-1 text-gray-500">
                  Getter Name
                </label>
                <input
                  type="text"
                  value={getterInput.name}
                  onChange={(e) =>
                    setGetterInput((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter getter name"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-500">
                  Issued Quantity
                </label>
                <input
                  type="number"
                  value={getterInput.quantity}
                  onChange={(e) =>
                    setGetterInput((prev) => ({
                      ...prev,
                      quantity: e.target.value,
                    }))
                  }
                  placeholder="Enter quantity"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-500">Date</label>
                <input
                  type="date"
                  value={getterInput.date}
                  onChange={(e) =>
                    setGetterInput((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm"
                >
                  Add
                </button>
              </div>
            </form>

            {(() => {
              const getters = getterList[getterItem._id] || [];
              const totalGot = getters.reduce(
                (sum, g) => sum + Number(g.quantity),
                0,
              );
              const balance = (Number(getterItem.quantity) || 0) - totalGot;
              return (
                <>
                  <div className="flex justify-between text-sm mb-3 bg-gray-50 rounded-lg px-4 py-2">
                    <span>
                      Total Qty: <strong>{getterItem.quantity}</strong>
                    </span>
                    <span>
                      Total Got: <strong>{totalGot}</strong>
                    </span>
                    <span
                      className={
                        balance < 0 ? "text-red-500" : "text-green-600"
                      }
                    >
                      Balance: <strong>{balance}</strong>
                    </span>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-3 py-2">#</th>
                        <th className="px-3 py-2">Getter Name</th>
                        <th className="px-3 py-2">Get Quantity</th>
                        <th className="px-3 py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {getters.length === 0 ? (
                        <tr>
                          <td
                            colSpan="4"
                            className="text-center text-gray-400 py-4"
                          >
                            No getters added yet.
                          </td>
                        </tr>
                      ) : (
                        getters.map((entry, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-3 py-2">{i + 1}</td>
                            <td className="px-3 py-2">{entry.name}</td>
                            <td className="px-3 py-2">{entry.quantity}</td>
                            <td className="px-3 py-2">{entry.date}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Edit Item</h3>
            <form onSubmit={handleUpdate} className="grid grid-cols-2 gap-3">
              {[
                ["itemname", "Item Name"],
                ["batch", "Batch"],
                ["partno", "Part Number"],
                [
                  "alternativePart",
                  ["category", "Category"],
                  "Alternative Part",
                ],
                ["condition", "Condition"],
                ["quantity", "Quantity"],
                ["status", "Status"],
                ["location", "Location"],
                ["locationId", "Location ID"],
                ["phone", "Phone"],
                ["place", "Place"],
                ["placeId", "Place ID"],
                ["selfLife", "Self Life"],
                ["inHistory", "In History"],
                ["outHistory", "Out History"],
              ].map(([field, label]) => (
                <div key={field}>
                  <label className="block text-xs mb-1 text-gray-500">
                    {label}
                  </label>
                  <input
                    name={field}
                    value={editItem[field] || ""}
                    onChange={handleEditChange}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-xs mb-1 text-gray-500">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="3"
                  value={editItem.description || ""}
                  onChange={handleEditChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="col-span-2 flex gap-2 mt-2">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {updating ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Stores;
