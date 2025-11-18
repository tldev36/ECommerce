import Image from "next/image";


export default function Review() {

    return (
        <section className="bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl font-semibold mb-6">Khách hàng nói gì?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-lg shadow">
                            <p className="text-gray-700 italic">
                                “Sản phẩm rất tươi và ngon, giao hàng nhanh chóng. Mình sẽ
                                tiếp tục ủng hộ.”
                            </p>
                            <div className="mt-4 flex items-center">
                                <Image
                                    src={`/images/user${i}.jpg`}
                                    alt=""
                                    width={40}
                                    height={40}
                                    className="w-10 h-10 rounded-full mr-3"
                                />
                                <div>
                                    <p className="font-semibold">Nguyễn Văn A</p>
                                    <p className="text-sm text-gray-500">Khách hàng</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}