import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import DataTableModule from "react-data-table-component";

const DataTable = DataTableModule.default || DataTableModule;

import Loader from "../layout/Loader";

import {
  getRestaurantOrders,
  updateOrderStatus,
} from "../../redux/actions/orderActions";
import { clearErrors } from "../../redux/slices/orderSlice";

import "./ListOrders.css";

// The next status a restaurant owner can move an order to, from its current status.
// "Delivered" and "Cancelled" have no further transitions.
const NEXT_STATUS = {
  Processing: "Accepted",
  Accepted: "Preparing",
  Preparing: "Out for Delivery",
  "Out for Delivery": "Delivered",
};

const STATUS_CLASS = {
  Processing: "status-pending",
  Accepted: "status-pending",
  Preparing: "status-pending",
  "Out for Delivery": "status-pending",
  Delivered: "status-delivered",
  Cancelled: "status-cancelled",
};

const RestaurantDashboard = () => {
  const dispatch = useDispatch();
  const [updatingId, setUpdatingId] = useState(null);

  const { user } = useSelector((state) => state.user);
  const {
    restaurantOrders,
    restaurantOrdersLoading,
    restaurantOrdersError,
    restaurantName,
  } = useSelector((state) => state.order);

  const isOwner = user?.role === "restaurant-owner";

  useEffect(() => {
    if (isOwner) {
      dispatch(getRestaurantOrders());
    }
  }, [dispatch, isOwner]);

  useEffect(() => {
    if (restaurantOrdersError) {
      toast.error(restaurantOrdersError, { position: "bottom-right" });
      dispatch(clearErrors());
    }
  }, [restaurantOrdersError, dispatch]);

  const handleAdvanceStatus = async (order) => {
    const next = NEXT_STATUS[order.orderStatus];
    if (!next) return;

    setUpdatingId(order._id);
    try {
      await dispatch(updateOrderStatus(order._id, next));
      toast.success(`Order marked as "${next}"`, { position: "bottom-right" });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Unable to update order status",
        { position: "bottom-right" }
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (order) => {
    if (!window.confirm("Cancel this order?")) return;
    setUpdatingId(order._id);
    try {
      await dispatch(updateOrderStatus(order._id, "Cancelled"));
      toast.success("Order cancelled", { position: "bottom-right" });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Unable to cancel order",
        { position: "bottom-right" }
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = [
    {
      name: "Customer",
      selector: (row) => row.customerName,
      sortable: true,
    },
    {
      name: "Items",
      selector: (row) => row.itemCount,
      sortable: true,
    },
    {
      name: "Amount",
      selector: (row) => row.amount,
      sortable: true,
    },
    {
      name: "Status",
      cell: (row) => (
        <span className={STATUS_CLASS[row.status] || "status-pending"}>
          {row.status}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Date",
      selector: (row) => row.date,
      sortable: true,
    },
    {
      name: "Action",
      cell: (row) => {
        const isUpdating = updatingId === row.id;
        const next = NEXT_STATUS[row.status];
        const isFinal = row.status === "Delivered" || row.status === "Cancelled";

        if (isFinal) {
          return <span className="text-muted">—</span>;
        }

        return (
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              className="btn btn-primary btn-sm"
              disabled={isUpdating || !next}
              onClick={() => handleAdvanceStatus(row.raw)}
            >
              {isUpdating ? "..." : `Mark ${next}`}
            </button>
            <button
              className="btn btn-outline-danger btn-sm"
              disabled={isUpdating}
              onClick={() => handleCancel(row.raw)}
            >
              Cancel
            </button>
          </div>
        );
      },
      minWidth: "230px",
    },
  ];

  const data =
    restaurantOrders?.map((order) => ({
      id: order._id,
      customerName: order.user?.name || "Unknown customer",
      itemCount: order.orderItems.length,
      amount: `₹${order.finalTotal}`,
      status: order.orderStatus,
      date: new Date(order.createdAt).toLocaleDateString(),
      raw: order,
    })) || [];

  return (
    <div className="list-orders-container">
      <h1 className="orders-title">
        Incoming Orders{restaurantName ? ` — ${restaurantName}` : ""}
      </h1>

      {!isOwner ? (
        <p>
          This page is only available to restaurant-owner accounts. If this
          seems wrong, contact an admin to verify your account role.
        </p>
      ) : restaurantOrdersLoading ? (
        <Loader />
      ) : data.length === 0 ? (
        <p>No orders yet for your restaurant.</p>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          pagination
          highlightOnHover
          striped
          responsive
          customStyles={customStyles}
        />
      )}
    </div>
  );
};

// Custom styling — matches ListOrders.jsx
const customStyles = {
  headCells: {
    style: {
      fontWeight: "bold",
      fontSize: "16px",
      backgroundColor: "#f8f9fa",
    },
  },
  rows: {
    style: {
      fontSize: "14px",
    },
  },
};

export default RestaurantDashboard;
