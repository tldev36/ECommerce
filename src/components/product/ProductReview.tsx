"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

interface ReviewProps {
  productId: number;
  user: any;
}

export default function ProductReview({ productId, user }: ReviewProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [editing, setEditing] = useState<any>(null);

  const fetchReviews = async () => {
    const res = await axios.get<any>(`/api/reviews?product_id=${productId}`);
    setReviews(res.data);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // ✅ Gửi hoặc lưu chỉnh sửa
  const handleSubmit = async () => {
    if (!user) return alert("Vui lòng đăng nhập để đánh giá!");

    // ✅ Nếu đang chỉnh sửa
    if (editing) {
      await axios.put("/api/reviews", {
        id: editing.id,
        user_id: user.id,
        rating,
        comment,
      });
      setEditing(null);
    } else {
      // ✅ Nếu tạo mới
      await axios.post("/api/reviews", {
        user_id: user.id,
        product_id: productId,
        rating,
        comment,
      });
    }

    setRating(0);
    setComment("");
    fetchReviews();
  };

  // ✅ Bấm Sửa
  const handleEdit = (review: any) => {
    setEditing(review);
    setRating(review.rating);
    setComment(review.comment);
  };

  // ✅ Xóa
  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa đánh giá này?")) return;

    await axios.delete(`/api/reviews?id=${id}&user_id=${user.id}`);
    fetchReviews();
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl mt-10">
      <h2 className="text-2xl font-bold mb-6">Đánh giá sản phẩm</h2>

      {/* Form */}
      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          {[1,2,3,4,5].map((star) => (
            <FontAwesomeIcon
              key={star}
              icon={faStar}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
              className={`text-3xl cursor-pointer ${
                star <= (hover || rating) ? "text-yellow-400" : "text-gray-300"
              }`}
            />
          ))}
        </div>

        <textarea
          className="w-full border rounded-xl p-4 mb-4"
          placeholder="Chia sẻ cảm nhận..."
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700"
        >
          {editing ? "Lưu thay đổi" : "Gửi đánh giá"}
        </button>

        {editing && (
          <button
            onClick={() => {
              setEditing(null);
              setRating(0);
              setComment("");
            }}
            className="ml-4 text-gray-600 hover:underline"
          >
            Hủy
          </button>
        )}
      </div>

      {/* List */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Khách hàng nhận xét</h3>

        {reviews.length === 0 && (
          <p className="text-gray-500">Chưa có đánh giá nào</p>
        )}

        {reviews.map((r: any) => (
          <div key={r.id} className="border-b py-4">
            <div className="flex gap-2 mb-2">
              {[...Array(r.rating)].map((_, i) => (
                <FontAwesomeIcon key={i} icon={faStar} className="text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-800">{r.comment}</p>
            <p className="text-sm text-gray-400 mt-1">{r.users?.email}</p>

            {/* ✅ Chỉ user tạo mới thấy nút */}
            {user && user.id === r.user_id && (
              <div className="flex gap-4 mt-2">
                <button
                  onClick={() => handleEdit(r)}
                  className="text-blue-600 hover:underline"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-red-600 hover:underline"
                >
                  Xóa
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
