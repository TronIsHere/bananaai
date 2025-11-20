import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-xl">
            🍌
          </div>
          <span className="text-2xl font-bold text-gray-900">بنانا ای‌آی</span>
        </div>
        <nav className="hidden md:flex gap-6">
          <Link href="#features" className="text-gray-600 hover:text-yellow-500 transition">
            ویژگی‌ها
          </Link>
          <Link href="#pricing" className="text-gray-600 hover:text-yellow-500 transition">
            تعرفه‌ها
          </Link>
          <Link href="#about" className="text-gray-600 hover:text-yellow-500 transition">
            درباره ما
          </Link>
        </nav>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
            ورود
          </button>
          <button className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg font-medium hover:bg-yellow-300 transition shadow-sm">
            ثبت نام
          </button>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-block px-4 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium mb-4">
              قدرت گرفته از مدل نانوبنانا 🚀
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
              خلق تصاویر شگفت‌انگیز <br />
              <span className="text-yellow-500">با هوش مصنوعی فارسی</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              با استفاده از مدل پیشرفته نانوبنانا، ایده‌های خود را به واقعیت تبدیل کنید. 
              تبدیل متن به تصویر و تصویر به تصویر با سرعتی باورنکردنی.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <button className="px-8 py-4 bg-gray-900 text-white rounded-xl text-lg font-medium hover:bg-gray-800 transition shadow-lg">
                شروع کنید - رایگان
              </button>
              <button className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl text-lg font-medium hover:bg-gray-50 transition">
                نمونه کارها
              </button>
            </div>
          </div>
          
          {/* Abstract Visual Placeholder */}
          <div className="mt-16 relative max-w-5xl mx-auto h-64 md:h-96 bg-gradient-to-br from-yellow-100 to-orange-50 rounded-3xl border border-yellow-200/50 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <span className="text-gray-400 text-lg">محل نمایش تصاویر تولید شده با نانوبنانا</span>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-white py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">امکانات بی‌نظیر</h2>
              <p className="text-gray-600">هر آنچه برای خلق آثار هنری نیاز دارید</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-yellow-300 transition hover:shadow-md">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-6">
                  ✍️
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">تبدیل متن به تصویر</h3>
                <p className="text-gray-600 leading-relaxed">
                  توصیف کنید و ببینید. با نوشتن جزئیات دقیق به فارسی یا انگلیسی، تصاویر با کیفیت بالا دریافت کنید.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-yellow-300 transition hover:shadow-md">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-2xl mb-6">
                  🖼️
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">تبدیل تصویر به تصویر</h3>
                <p className="text-gray-600 leading-relaxed">
                  یک تصویر آپلود کنید و سبک آن را تغییر دهید یا آن را به عنوان پایه‌ای برای اثر هنری جدید خود استفاده کنید.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-yellow-300 transition hover:shadow-md">
                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center text-2xl mb-6">
                  ⚡
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">مدل نانوبنانا</h3>
                <p className="text-gray-600 leading-relaxed">
                  سریع، بهینه و دقیق. مدل اختصاصی ما برای درک بهتر فرهنگ و هنر ایرانی و جهانی آموزش دیده است.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">بسته‌های اعتباری</h2>
              <p className="text-gray-600">پرداخت فقط به ازای استفاده. بدون اشتراک اجباری.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Starter Plan */}
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">شروع</h3>
                <div className="text-4xl font-bold text-gray-900 mb-6">
                  ۹۹,۰۰۰ <span className="text-lg font-normal text-gray-500">تومان</span>
                </div>
                <p className="text-gray-600 mb-8">برای کسانی که تازه می‌خواهند امتحان کنند.</p>
                <ul className="space-y-4 mb-8 text-gray-600">
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    ۱۰۰ اعتبار تصویر
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    دسترسی به تمام مدل‌ها
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    سرعت استاندارد
                  </li>
                </ul>
                <button className="w-full py-3 rounded-xl border-2 border-gray-200 font-medium hover:border-yellow-400 hover:text-yellow-600 transition">
                  خرید بسته
                </button>
              </div>

              {/* Pro Plan */}
              <div className="bg-white p-8 rounded-2xl border-2 border-yellow-400 shadow-lg relative overflow-hidden transform md:-translate-y-4">
                <div className="absolute top-0 left-0 right-0 bg-yellow-400 text-center py-1 text-xs font-bold uppercase tracking-wider">
                  پیشنهاد ویژه
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-2">حرفه‌ای</h3>
                <div className="text-4xl font-bold text-gray-900 mb-6">
                  ۲۹۹,۰۰۰ <span className="text-lg font-normal text-gray-500">تومان</span>
                </div>
                <p className="text-gray-600 mb-8">بهترین انتخاب برای گرافیست‌ها و طراحان.</p>
                <ul className="space-y-4 mb-8 text-gray-600">
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    ۵۰۰ اعتبار تصویر
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    اولویت در پردازش
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    کیفیت HD
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    بدون واترمارک
                  </li>
                </ul>
                <button className="w-full py-3 rounded-xl bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-300 transition shadow-md">
                  خرید بسته
                </button>
              </div>

              {/* Enterprise Plan */}
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">سازمانی</h3>
                <div className="text-4xl font-bold text-gray-900 mb-6">
                  ۹۹۰,۰۰۰ <span className="text-lg font-normal text-gray-500">تومان</span>
                </div>
                <p className="text-gray-600 mb-8">برای تیم‌ها و استفاده‌های سنگین.</p>
                <ul className="space-y-4 mb-8 text-gray-600">
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    ۲۰۰۰ اعتبار تصویر
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    API اختصاصی
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    پشتیبانی ۲۴ ساعته
                  </li>
                </ul>
                <button className="w-full py-3 rounded-xl border-2 border-gray-200 font-medium hover:border-yellow-400 hover:text-yellow-600 transition">
                  خرید بسته
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-xl text-black">
                  🍌
                </div>
                <span className="text-xl font-bold">بنانا ای‌آی</span>
              </div>
              <p className="text-gray-400 text-sm">
                پلتفرم پیشرو در تولید محتوای بصری با هوش مصنوعی در ایران.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-yellow-400">محصول</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-white">تولید تصویر</Link></li>
                <li><Link href="#" className="hover:text-white">ویرایش هوشمند</Link></li>
                <li><Link href="#" className="hover:text-white">تعرفه‌ها</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-yellow-400">منابع</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-white">بلاگ</Link></li>
                <li><Link href="#" className="hover:text-white">آموزش‌ها</Link></li>
                <li><Link href="#" className="hover:text-white">سوالات متداول</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-yellow-400">قانونی</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-white">قوانین استفاده</Link></li>
                <li><Link href="#" className="hover:text-white">حریم خصوصی</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
            © ۱۴۰۳ بنانا ای‌آی. تمامی حقوق محفوظ است.
          </div>
        </div>
      </footer>
    </div>
  );
}