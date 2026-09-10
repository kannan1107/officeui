import React, { useEffect, useState } from "react";
import {
  useGetMessagesQuery,
  useUpdateMessageMutation,
  useDeleteMessageByIdMutation,
  useGetUsersQuery,
} from "../../features/ApplicationApi";

function ListTask() {
  const { data: messages, isLoading, error } = useGetMessagesQuery();
  const [deleteMessageById] = useDeleteMessageByIdMutation();
  const [updateMessage] = useUpdateMessageMutation();
  const { data: users } = useGetUsersQuery();

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ task: "", content: "" });
  const [optimisticStatus, setOptimisticStatus] = useState({});
  const [reviewInputs, setReviewInputs] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [savedReviews, setSavedReviews] = useState({});
  const [savedComments, setSavedComments] = useState({});
  const [updatingIds, setUpdatingIds] = useState({});

  const usersData = Array.isArray(users)
    ? users
    : users?.users || users?.data || [];

  // Helper to find user name by ID
  const getUserName = (userId) => {
    if (!userId) return "Unassigned";
    const user = usersData.find((u) => (u._id || u.id) === userId);
    return user ? user.name || user.username : "Unknown User";
  };

  const messagesData = React.useMemo(() => {
    const rawList = Array.isArray(messages)
      ? messages
      : messages?.messages || messages?.data || messages?.tasks || [];

    return rawList.map((m) => {
      const item = m._doc ? { ...m._doc, ...m } : m;
      return {
        ...item,
        _id: item._id || item.id,
      };
    });
  }, [messages]);

  const statusField = (() => {
    const sample = messagesData[0];
    if (!sample) return "status";
    return Object.prototype.hasOwnProperty.call(sample, "states")
      ? "states"
      : "status";
  })();

  const updateTaskField = async (id, payload) => {
    if (!id) return false;
    setUpdatingIds((s) => ({ ...s, [id]: true }));
    try {
      await updateMessage({ messageId: id, updatedData: payload }).unwrap();
      return true;
    } catch (e) {
      alert("Update failed: " + (e?.data?.message || e.message));
      return false;
    } finally {
      setUpdatingIds((s) => {
        const next = { ...s };
        delete next[id];
        return next;
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMessageById(id).unwrap();
      alert("Deleted successfully");
    } catch (err) {
      console.log(err);
      alert("Delete failed");
    }
  };

  const handleSave = async () => {
    // Only send the fields the backend expects
    const payload = {
      task: editForm.task,
      content: editForm.content,
      status: editForm.status,
      // add other specific fields
    };
    const success = await updateTaskField(editingId, payload);
    if (success) setEditingId(null);
  };

  // Review is often saved as 'review' or 'commend' in databases
  const saveReview = async (id) => {
    const val =
      reviewInputs[id] ?? messagesData.find((m) => m._id === id)?.review ?? "";
    const ok = await updateTaskField(id, { review: val });
    if (ok) {
      setSavedReviews((s) => ({ ...s, [id]: val }));
      setReviewInputs((s) => {
        const n = { ...s };
        delete n[id];
        return n;
      });
    }
  };

  const saveComment = async (id) => {
    const val =
      commentInputs[id] ??
      messagesData.find((m) => m._id === id)?.comment ??
      "";
    const ok = await updateTaskField(id, { comment: val });
    if (ok) {
      setSavedComments((s) => ({ ...s, [id]: val }));
      setCommentInputs((s) => {
        const n = { ...s };
        delete n[id];
        return n;
      });
    }
  };

  if (isLoading) return <div className="text-center py-10">Loading...</div>;
  if (error)
    return (
      <div className="text-center py-10 text-red-500">Error loading tasks.</div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
        Task Management
      </h2>
      <div className="space-y-6">
        {messagesData.map((msg) => {
          const msgId = msg._id;
          const displayStatus =
            optimisticStatus[msgId] ?? (msg.status || msg.states || "pending");

          return (
            <div
              key={msgId}
              className="bg-white border rounded-xl shadow-sm overflow-hidden"
            >
              {/* Header: Priority & Status */}
              <div className="flex justify-between items-center bg-gray-100 px-4 py-2 border-b">
                <span
                  className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                    msg.priority === "high"
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {msg.priority || "Normal"} Priority
                </span>
                <span className="text-xs text-gray-500">
                  ID: {msgId?.slice(-6)}
                </span>
              </div>

              <div className="p-4 flex flex-col md:flex-row gap-6">
                {/* Main Content */}
                <div className="flex-1">
                  {editingId === msgId ? (
                    <div className="space-y-2">
                      <input
                        value={editForm.task}
                        onChange={(e) =>
                          setEditForm({ ...editForm, task: e.target.value })
                        }
                        className="w-full border p-2 rounded"
                      />
                      <textarea
                        value={editForm.content}
                        onChange={(e) =>
                          setEditForm({ ...editForm, content: e.target.value })
                        }
                        className="w-full border p-2 rounded"
                      />
                      <button
                        onClick={handleSave}
                        className="bg-green-600 text-white px-4 py-1 rounded mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-200 px-4 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {msg.task || msg.title}
                      </h3>
                      <p className="text-gray-600 mt-1">{msg.content}</p>

                      {/* --- NEW METADATA GRID --- */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 p-3 bg-gray-50 rounded-lg text-sm">
                        <div>
                          <p className="text-gray-500 text-xs font-semibold">
                            DUE DATE
                          </p>
                          <p className="font-medium text-red-600">
                            {msg.dueDate
                              ? new Date(msg.dueDate).toLocaleDateString()
                              : "No Date"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs font-semibold">
                            DEPARTMENT
                          </p>
                          <p className="font-medium">
                            {msg.department || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs font-semibold">
                            BRANCH
                          </p>
                          <p className="font-medium">{msg.branch || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs font-semibold">
                            ASSIGNEE
                          </p>
                          <p className="font-medium">
                            {getUserName(msg.assignee)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs font-semibold">
                            ASSIGNER
                          </p>
                          <p className="font-medium">
                            {getUserName(msg.assigner)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs font-semibold">
                            STATUS
                          </p>
                          <p
                            className={`capitalize font-bold ${displayStatus === "completed" ? "text-green-600" : "text-yellow-600"}`}
                          >
                            {displayStatus}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs font-semibold">
                            REVIEW
                          </p>
                          <p className="font-medium">
                            {savedReviews[msgId] ||
                              msg.review ||
                              msg.commend ||
                              "No Review"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs font-semibold">
                            COMMENT
                          </p>
                          <p className="font-medium">
                            {savedComments[msgId] || msg.comment || "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* --- REVIEW & COMMENT SECTION --- */}
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label className="text-xs font-bold text-gray-600 mb-1">
                            REVIEW
                          </label>
                          <textarea
                            className="border rounded p-2 text-sm h-20"
                            placeholder="Add a review..."
                            value={
                              reviewInputs[msgId] ??
                              msg.review ??
                              msg.commend ??
                              ""
                            }
                            onChange={(e) =>
                              setReviewInputs({
                                ...reviewInputs,
                                [msgId]: e.target.value,
                              })
                            }
                          />
                          <button
                            onClick={() => saveReview(msgId)}
                            className="mt-2 text-xs bg-gray-800 text-white py-1 rounded"
                          >
                            Update Review
                          </button>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-bold text-gray-600 mb-1">
                            COMMENT
                          </label>
                          <textarea
                            className="border rounded p-2 text-sm h-20"
                            placeholder="Add a comment..."
                            value={commentInputs[msgId] ?? msg.comment ?? ""}
                            onChange={(e) =>
                              setCommentInputs({
                                ...commentInputs,
                                [msgId]: e.target.value,
                              })
                            }
                          />
                          <button
                            onClick={() => saveComment(msgId)}
                            className="mt-2 text-xs bg-blue-600 text-white py-1 rounded"
                          >
                            Update Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Sidebar: Actions */}
                <div className="w-full md:w-32 flex flex-col gap-2">
                  <select
                    value={displayStatus}
                    onChange={(e) =>
                      updateTaskField(msgId, { [statusField]: e.target.value })
                    }
                    className="border text-sm p-1 rounded bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button
                    onClick={() => {
                      setEditingId(msgId);
                      // Spread the whole msg object so you keep all fields (dueDate, priority, etc.)
                      setEditForm({ ...msg });
                    }}
                    className="bg-indigo-500 text-white text-xs py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(msgId)}
                    className="bg-red-500 text-white text-xs py-2 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ListTask;
