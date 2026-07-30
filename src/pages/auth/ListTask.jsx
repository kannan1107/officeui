import React, { useEffect, useState } from "react";
import {
  useGetMessagesQuery,
  useUpdateMessageMutation,
  useDeleteMessageByIdMutation,
  useGetUsersQuery,
} from "../../features/ApplicationApi";

function ListTask() {
  const { data: messages, isLoading, error, refetch } = useGetMessagesQuery();
  const [deleteMessageById, { isLoading: isDeleting }] =
    useDeleteMessageByIdMutation();
  const [updateMessage, { isLoading: isUpdating }] = useUpdateMessageMutation();
  const { data: users } = useGetUsersQuery();

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ task: "", content: "" });
  const [optimisticStatus, setOptimisticStatus] = useState({});
  const [reviewInputs, setReviewInputs] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [updatingIds, setUpdatingIds] = useState({});

  const usersData = Array.isArray(users)
    ? users
    : users?.users || users?.data || [];

  // --- IMPROVED NORMALIZATION ---
  const messagesData = React.useMemo(() => {
    const rawList = Array.isArray(messages)
      ? messages
      : messages?.messages || messages?.data || messages?.tasks || [];

    return rawList.map((m) => {
      // Flatten Mongoose _doc if it exists, and ensure we find an ID
      const item = m._doc ? { ...m._doc, ...m } : m;
      return {
        ...item,
        // Fallback: if _id doesn't exist, try id
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
    // SAFETY CHECK: Prevent the "undefined" URL error
    if (!id) {
      console.error(
        "Mutation aborted: ID is undefined. Check your data structure.",
        payload,
      );
      alert("Error: Task ID is missing.");
      return false;
    }

    setUpdatingIds((s) => ({ ...s, [id]: true }));
    try {
      console.log(`Updating task ${id} with:`, payload);
      await updateMessage({
        messageId: id,
        updatedData: payload,
      }).unwrap();

      // refetch(); // Optional: RTK Query tags usually handle this better
      return true;
    } catch (e) {
      console.error("Update failed:", e);
      alert(
        "Update failed: " + (e?.data?.message || e.message || "Server Error"),
      );
      return false;
    } finally {
      setUpdatingIds((s) => {
        const next = { ...s };
        delete next[id];
        return next;
      });
    }
  };

  const handleSave = async () => {
    const success = await updateTaskField(editingId, editForm);
    if (success) setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!id || !confirm("Delete this task?")) return;
    try {
      await deleteMessageById(id).unwrap();
    } catch (e) {
      alert("Delete failed: " + (e?.data?.message || e.message));
    }
  };

  const saveReview = async (id) => {
    const val = reviewInputs[id];
    if (val === undefined) return;
    const success = await updateTaskField(id, { commend: val });
    if (success) {
      setReviewInputs((s) => {
        const n = { ...s };
        delete n[id];
        return n;
      });
    }
  };

  const saveComment = async (id) => {
    const val = commentInputs[id];
    if (val === undefined) return;
    const success = await updateTaskField(id, { comment: val });
    if (success) {
      setCommentInputs((s) => {
        const n = { ...s };
        delete n[id];
        return n;
      });
    }
  };

  const handleStatusChange = async (id, status) => {
    setOptimisticStatus((s) => ({ ...s, [id]: status }));
    const success = await updateTaskField(id, { [statusField]: status });
    if (!success) {
      setOptimisticStatus((s) => {
        const n = { ...s };
        delete n[id];
        return n;
      });
    } else {
      setTimeout(() => {
        setOptimisticStatus((s) => {
          const n = { ...s };
          delete n[id];
          return n;
        });
      }, 1000);
    }
  };

  if (isLoading) return <div className="text-center py-10">Loading...</div>;
  if (error)
    return (
      <div className="text-center py-10 text-red-500">Error loading tasks.</div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Tasks</h2>
      <div className="space-y-4">
        {messagesData.map((msg) => {
          // Identify the ID for this specific row
          const msgId = msg._id || msg.id;

          const serverStatus = msg.status ?? msg.states ?? "pending";
          const displayStatus = optimisticStatus[msgId] ?? serverStatus;

          return (
            <div key={msgId} className="border p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  {editingId === msgId ? (
                    <div className="space-y-2">
                      <input
                        value={editForm.task}
                        onChange={(e) =>
                          setEditForm({ ...editForm, task: e.target.value })
                        }
                        className="w-full border p-1"
                      />
                      <textarea
                        value={editForm.content}
                        onChange={(e) =>
                          setEditForm({ ...editForm, content: e.target.value })
                        }
                        className="w-full border p-1"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          className="bg-green-600 text-white px-3 py-1 rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-gray-200 px-3 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-bold">{msg.title || msg.task}</h3>
                      <div className="mt-2 flex gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs text-white ${
                            displayStatus === "completed"
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }`}
                        >
                          {displayStatus}
                        </span>
                      </div>

                      {/* Review & Comment inputs */}
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="text-xs font-bold block">
                            Review
                          </label>
                          <textarea
                            className="w-full border text-sm p-1"
                            value={reviewInputs[msgId] ?? msg.commend ?? ""}
                            onChange={(e) =>
                              setReviewInputs({
                                ...reviewInputs,
                                [msgId]: e.target.value,
                              })
                            }
                          />
                          <button
                            onClick={() => saveReview(msgId)}
                            className="text-xs bg-gray-800 text-white px-2 py-1 mt-1"
                          >
                            Update Review
                          </button>
                        </div>
                        <div>
                          <label className="text-xs font-bold block">
                            Comment
                          </label>
                          <textarea
                            className="w-full border text-sm p-1"
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
                            className="text-xs bg-blue-600 text-white px-2 py-1 mt-1"
                          >
                            Update Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-32 flex flex-col gap-2">
                  <select
                    value={displayStatus}
                    onChange={(e) => handleStatusChange(msgId, e.target.value)}
                    className="border text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button
                    onClick={() => {
                      setEditingId(msgId);
                      setEditForm({ task: msg.task, content: msg.content });
                    }}
                    className="bg-indigo-500 text-white text-xs py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(msgId)}
                    className="bg-red-500 text-white text-xs py-1 rounded"
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
