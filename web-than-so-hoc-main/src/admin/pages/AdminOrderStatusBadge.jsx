import Swal from "sweetalert2";
import { toast } from "react-toastify";

export default function AdminOrderStatusBadge({ status, orderId, onUpdated }) {
  const statusMap = {
    pending: "Chờ xử lý",
    processing: "Đang xử lý",
    shipping: "Đang giao",
    completed: "Hoàn thành",
  };

  const colorMap = {
    pending: "#ffc107",
    processing: "#17a2b8",
    shipping: "#0d6efd",
    completed: "#28a745",
  };

  const handleClick = async () => {
    const { value: newStatus } = await Swal.fire({
      title: "Cập nhật trạng thái",
      input: "select",
      inputOptions: statusMap,
      inputValue: status,
      showCancelButton: true,
    });

    if (!newStatus || newStatus === status) return;

    try {
      await fetch(
        `http://127.0.0.1:5000/api/admin/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      toast.success("Cập nhật trạng thái thành công");
      onUpdated?.(newStatus);
    } catch {
      toast.error("Cập nhật thất bại");
    }
  };

  return (
    <span
      onClick={handleClick}
      style={{
        padding: "4px 10px",
        borderRadius: "12px",
        fontSize: "13px",
        fontWeight: 600,
        backgroundColor: colorMap[status],
        color: "#fff",
        cursor: "pointer",
      }}
      title="Click để đổi trạng thái"
    >
      {statusMap[status]}
    </span>
  );
}
