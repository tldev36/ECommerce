import fs from "fs";
import path from "path";

/**
 * Xóa ảnh vật lý trong thư mục /public/images/[folder]
 * @param folder - Tên thư mục (vd: "categories", "products", "brands", ...)
 * @param filename - Tên file ảnh (vd: "abc.jpg")
 */
export function deleteImageFile(folder: string, filename?: string | null) {
  try {
    if (!filename) return;

    // Đường dẫn tuyệt đối đến file trong public
    const filePath = path.join(process.cwd(), "public", "images", folder, filename);

    // Kiểm tra nếu file tồn tại thì xóa
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Đã xóa ảnh: ${filePath}`);
    } else {
      console.warn(`⚠️ Không tìm thấy ảnh để xóa: ${filePath}`);
    }
  } catch (error) {
    console.error("❌ Lỗi khi xóa ảnh:", error);
  }
}
