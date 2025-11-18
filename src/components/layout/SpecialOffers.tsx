

export default function SpecialOffers() {

    return(
        <section className="max-w-7xl mx-auto px-4 py-10 space-y-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-[url('/images/hero.jpg')] bg-cover bg-center rounded-lg overflow-hidden relative h-52">
                  <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-white">
                    <h3 className="text-xl font-semibold">Giảm giá 20% Trái cây</h3>
                    <a
                      href="/products"
                      className="mt-3 bg-green-600 px-4 py-2 rounded hover:bg-green-700"
                    >
                      Xem ngay
                    </a>
                  </div>
                </div>
                <div className="bg-[url('/images/hero.jpg')] bg-cover bg-center rounded-lg overflow-hidden relative h-52">
                  <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-white">
                    <h3 className="text-xl font-semibold">Ưu đãi rau củ hữu cơ</h3>
                    <a
                      href="/products"
                      className="mt-3 bg-green-600 px-4 py-2 rounded hover:bg-green-700"
                    >
                      Xem ngay
                    </a>
                  </div>
                </div>
              </section>
    );
}