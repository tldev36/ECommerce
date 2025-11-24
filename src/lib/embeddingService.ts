// /lib/embeddingService.ts

/**
 * ⚠️ QUAN TRỌNG: Đây là hàm GIẢ LẬP (STUB).
 * Bạn cần thay thế hàm này bằng logic gọi API embedding thực tế.
 *
 * Ví dụ: Gọi API 'text-embedding-004' của Google hoặc một model embedding khác
 * mà bạn đang sử dụng.
 *
 * @param {string} text - Nội dung cần tạo embedding (câu hỏi của user).
 * @returns {Promise<number[]>} - Một mảng vector.
 */
export async function getEmbedding(text: string): Promise<number[]> {
  console.log(`Đang tạo embedding cho: "${text}"`);
  
  // ----- ⬇️ THAY THẾ LOGIC NÀY ⬇️ -----
  
  // GIẢ LẬP GỌI API
  // Đây là ví dụ nếu bạn gọi API embedding của Google (text-embedding-004)
  // const API_KEY = process.env.GOOGLE_EMBEDDING_API_KEY; // Cần API Key riêng
  // const url = "https..."
  // const res = await fetch(url, {
  //   method: "POST",
  //   body: JSON.stringify({ model: "models/text-embedding-004", text: text })
  // });
  // const data = await res.json();
  // const embedding = data.embedding.values;
  
  // TẠM THỜI: Trả về một vector giả lập có 768 chiều
  // (Hãy đảm bảo số chiều này khớp với CSDL của bạn)
  const mockEmbedding = Array(768).fill(0).map(() => Math.random());
  
  // ----- ⬆️ THAY THẾ LOGIC NÀY ⬆️ -----

  return mockEmbedding;
}