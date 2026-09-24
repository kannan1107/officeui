import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_BASE_URL;

export const appApi = createApi({
  reducerPath: "api",
  tagTypes: ["Event", "Doto", "Leave"],
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const state = getState();
      const rawToken =
        state.auth?.token ||
        state.auth?.user?.token ||
        localStorage.getItem("token");
      const token = rawToken?.replace(/"/g, "");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    sendOtp: builder.mutation({
      query: (email) => ({
        url: "/api/auth/send-otp",
        method: "POST",
        body: email,
      }),
    }),

    verifyOtp: builder.mutation({
      query: (otpData) => ({
        url: "/api/auth/verify-otp",
        method: "POST",
        body: otpData,
      }),
    }),
    getChats: builder.query({
      query: () => "/api/chats",
    }),

    // new user registation
    postUser: builder.mutation({
      query: (userData) => ({
        url: "/api/auth/register",
        method: "POST",
        body: userData,
      }),
    }),

    // get the all users
    getUsers: builder.query({
      query: () => "/api/users/all",
    }),
    updateUser: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/users/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/api/users/${id}`,
        method: "DELETE",
      }),
    }),

    createChat: builder.mutation({
      query: (newChat) => ({
        url: "/api/chats",
        method: "POST",
        body: newChat,
      }),
      invalidatesTags: ["Event"],
    }),
    getChatById: builder.query({
      query: (chatId) => `/api/chats/${chatId}`,
    }),
    sendMessage: builder.mutation({
      query: (formData) => ({
        url: "/api/chat/addMessage",
        method: "POST",
        body: formData,
      }),
    }),
    getConversation: builder.query({
      query: ({ sender, receiver }) =>
        `/api/chat/getConversation/${sender}/${receiver}`,
    }),
    editMessage: builder.mutation({
      query: ({ id, text }) => ({
        url: `/api/chat/updateMessage/${id}`,
        method: "PUT",
        body: { text },
      }),
    }),
    deleteMessage: builder.mutation({
      query: (id) => ({
        url: `/api/chat/deleteMessage/${id}`,
        method: "DELETE",
      }),
    }),
    itemStockOut: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/items/${id}/out`,
        method: "POST",
        body: data,
      }),
    }),
    postItem: builder.mutation({
      query: (itemData) => ({
        url: "/api/items",
        method: "POST",
        body: itemData,
        formData: true,
      }),
    }),
    // get all items and details
    getItems: builder.query({
      query: () => "/api/items",
    }),
    getItemById: builder.query({
      query: (itemId) => `/api/items/${itemId}`,
    }),
    updateItem: builder.mutation({
      query: ({ itemId, updatedData }) => {
        if (updatedData instanceof FormData) {
          return {
            url: `/api/items/${itemId}`,
            method: "PUT",
            body: updatedData,
            formData: true,
          };
        }
        return {
          url: `/api/items/${itemId}`,
          method: "PUT",
          body: updatedData,
        };
      },
    }),
    deleteItem: builder.mutation({
      query: (itemId) => ({
        url: `/api/items/${itemId}`,
        method: "DELETE",
      }),
    }),
    createStore: builder.mutation({
      query: (data) => ({ url: "/api/stores", method: "POST", body: data }),
    }),
    getAllStores: builder.query({
      query: () => "/api/stores",
    }),
    getStoreById: builder.query({
      query: (id) => `/api/stores/${id}`,
    }),
    updateStore: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/stores/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteStore: builder.mutation({
      query: (id) => ({ url: `/api/stores/${id}`, method: "DELETE" }),
    }),
    getBalance: builder.query({
      query: (id) => `/api/stores/${id}/balance`,
    }),
    stockIn: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/stores/${id}/in`,
        method: "POST",
        body: data,
      }),
    }),
    stockOut: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/stores/${id}/out`,
        method: "POST",
        body: data,
      }),
    }),
    updatePlace: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/stores/${id}/place`,
        method: "PUT",
        body: data,
      }),
    }),
    getStoreHistory: builder.query({
      query: (id) => `/api/stores/${id}/history`,
    }),

    // doto router config
    postMessage: builder.mutation({
      query: (messageData) => ({
        url: "/api/doto/createDoto",
        method: "POST",
        body: messageData,
      }),
      invalidatesTags: ["Doto"],
    }),

    getMessages: builder.query({
      query: () => "/api/doto/getAllDoto",
      providesTags: ["Doto"],
    }),

    getMessageById: builder.query({
      query: (id) => `/api/doto/getDotoById/${id}`,
    }),

    updateMessage: builder.mutation({
      query: ({ messageId, updatedData }) => ({
        url: `/api/doto/updateDoto/${messageId}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["Doto"],
    }),

    deleteMessageById: builder.mutation({
      query: (id) => ({
        url: `/api/doto/deleteDoto/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Doto"],
    }),
    postEmployee: builder.mutation({
      query: (data) => ({
        url: "/api/employee/createEmployee",
        method: "POST",
        body: data, // RTK Query automatically detects FormData and sets headers correctly
      }),
    }),
    getEmployee: builder.mutation({
      query: () => ({
        url: `/api/employee/getAllEmployees`,
        method: "GET",
      }),
    }),
    deleteEmployee: builder.mutation({
      query: (id) => ({
        // REMOVED the colon before ${id}
        url: `/api/employee/deleteEmployee/${id}`,
        method: "DELETE",
      }),
    }),
    updateProfile: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/employee/updateEmployee/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    applyLeave: builder.mutation({
      query: (data) => ({
        url: "/api/leave/apply",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Leave"],
    }),
    getMyLeaves: builder.query({
      query: (userId) => `/api/leave/user/${userId}`,
      providesTags: ["Leave"],
    }),
    getAllLeaves: builder.query({
      query: () => "/api/leave/all",
      providesTags: ["Leave"],
    }),
    updateLeaveStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/leave/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Leave"],
    }),
  }),
});

export const {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useGetChatsQuery,
  useCreateChatMutation,
  useGetChatByIdQuery,
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useSendMessageMutation,
  useGetConversationQuery,
  useEditMessageMutation,
  useDeleteMessageMutation,
  usePostItemMutation,
  useGetItemsQuery,
  useGetItemByIdQuery,
  useUpdateItemMutation,
  useDeleteItemMutation,
  useItemStockOutMutation,
  useCreateStoreMutation,
  useGetAllStoresQuery,
  useGetStoreByIdQuery,
  useUpdateStoreMutation,
  useDeleteStoreMutation,
  useGetBalanceQuery,
  useStockInMutation,
  useStockOutMutation,
  useUpdatePlaceMutation,
  useGetStoreHistoryQuery,
  usePostMessageMutation,
  useGetMessagesQuery,
  useGetMessageByIdQuery,
  useUpdateMessageMutation,
  useDeleteMessageByIdMutation,
  usePostEmployeeMutation,
  useGetEmployeeMutation,
  useDeleteEmployeeMutation,
  useUpdateProfileMutation,
  usePostUserMutation,
  useApplyLeaveMutation,
  useGetMyLeavesQuery,
  useGetAllLeavesQuery,
  useUpdateLeaveStatusMutation,
} = appApi;
