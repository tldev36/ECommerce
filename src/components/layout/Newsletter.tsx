

export default function Newsletter() {

    return (
        <section className="bg-green-600 text-white py-12">
            <div className="max-w-6xl mx-auto px-4 text-center">
                <h2 className="text-2xl font-semibold mb-4">Đăng ký nhận tin</h2>
                <p className="mb-6 text-white/90">
                    Nhận thông tin ưu đãi và sản phẩm mới nhất qua email.
                </p>
                <form className="flex flex-col sm:flex-row justify-center gap-3 max-w-md mx-auto">
                    <input
                        type="email"
                        placeholder="Nhập email của bạn"
                        className="px-4 py-2 rounded text-gray-800 w-full bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                        type="submit"
                        className="bg-black px-4 w-50 py-2 rounded hover:bg-gray-800"
                    >
                        Đăng ký
                    </button>
                </form>
            </div>
        </section>
    );
}