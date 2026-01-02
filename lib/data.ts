import { FaMagic, FaPalette, FaVideo } from "react-icons/fa";

export const stats = [
  { label: "تصویر ساخته شده", value: "5k+" },
  { label: "کاربر فعال", value: "۱k+" },
  { label: "دقت مدل", value: "۹۸.۷٪" },
];

export const features = [
  {
    title: "تبدیل متن به تصویر",
    subtitle: "Core Diffusion",
    description:
      "موتور تبدیل متن به تصویر با درک عمیق فارسی و کنترل کامل بر سبک، نور و جزئیات. از پرامپت‌های ساده تا دستورات پیچیده با دقت بالا.",
    accent: "from-cyan-400 via-blue-500 to-purple-500",
    icon: FaMagic,
  },
  {
    title: "تبدیل تصویر به تصویر",
    subtitle: "Vision Rebuild",
    description:
      "پردازش تصویر به تصویر با لایه‌های تشخیص سوژه و بازطراحی هوشمند با حفظ ترکیب‌بندی. تغییر سبک، نور و جزئیات بدون از دست دادن کیفیت.",
    accent: "from-fuchsia-500 via-pink-500 to-rose-500",
    icon: FaPalette,
  },
  {
    title: "تبدیل تصویر به ویدیو",
    subtitle: "Kling 2.6",
    description:
      "تبدیل تصاویر ثابت به ویدیوهای متحرک با مدل Kling 2.6. کنترل کامل بر حرکت، مدت زمان (۵ یا ۱۰ ثانیه) و افزودن صدا. خلق ویدیوهای حرفه‌ای از تصاویر شما.",
    accent: "from-yellow-400 via-orange-500 to-pink-500",
    icon: FaVideo,
  },
];

export const workflow = [
  {
    step: "۱",
    title: "ایده‌تان را بنویسید",
    body: "فقط کافیست تصویری که در ذهن دارید را به فارسی یا انگلیسی توصیف کنید. هر جزئیاتی که می‌خواهید اضافه کنید و بگذارید هوش مصنوعی جادو کند",
  },
  {
    step: "۲",
    title: "در چند ثانیه دریافت کنید",
    body: "با استفاده از قدرتمندترین GPUها و الگوریتم‌های بهینه‌شده، تصویر شما در کمتر از ۱۰ ثانیه آماده می‌شود",
  },
  {
    step: "۳",
    title: "کامل و آماده استفاده",
    body: "تصویر نهایی با کیفیت بالا، بدون نویز و آماده برای استفاده در پروژه‌های حرفه‌ای شما. در صورت نیاز می‌توانید آن را بزرگ‌نمایی کنید",
  },
];

export const plans = [
  {
    name: "رایگان",
    nameEn: "Free",
    price: "0",
    currency: "تومان",
    credits: 24,
    tagline: "برای شروع و امتحان سرویس",
    highlights: [
      "۲۴ اعتبار",
      "متن به تصویر",
      "کیفیت ۵۱۲×۵۱۲",
      "پردازش عادی",
      "واترمارک BananaAI",
      "بدون نگهداری تصاویر",
    ],
    cta: "شروع کنید",
  },
  {
    name: "کاوشگر",
    nameEn: "Explorer",
    price: "350,000",
    currency: "تومان",
    credits: 200,
    tagline: "برای شروع و آشنایی با قدرت هوش مصنوعی",
    highlights: [
      "۲۰۰ اعتبار",
      "متن به تصویر",
      "تصویر به تصویر",
      "تصویر به ویدیو (بهترین مدل ویدیو دنیا)",
      "کیفیت ۵۱۲×۵۱۲",
      "پردازش عادی",
      "نگهداری ۷ روزه",
    ],
    cta: "شروع کنید",
  },
  {
    name: "خلاق",
    nameEn: "Creator",
    price: "1,090,000",
    currency: "تومان",
    credits: 650,
    tagline: "برای طراحان و فریلنسرها",
    highlights: [
      "۶۵۰ اعتبار",
      "متن به تصویر",
      "تصویر به تصویر",
      "تصویر به ویدیو",
      "کیفیت ۱۰۲۴×۱۰۲۴",
      "پردازش سریع",
      "بدون واترمارک",
      "نگهداری ۳۰ روزه",
    ],
    cta: "شروع کنید",
    featured: true,
  },
  {
    name: "استودیو",
    nameEn: "Studio",
    price: "3,390,000",
    currency: "تومان",
    credits: 2000,
    tagline: "مناسب تیم‌ها و کسب‌وکارها",
    highlights: [
      "۲۰۰۰ اعتبار",
      "متن به تصویر",
      "تصویر به تصویر",
      "تصویر به ویدیو",
      "کیفیت ۱۰۲۴×۱۰۲۴",
      "پردازش فوری",
      "بدون واترمارک",
      "نگهداری ۹۰ روزه",
      "پشتیبانی تلگرام",
    ],
    cta: "فعال‌سازی",
  },
];

export const logos = ["دانشگاه شریف", "کاله", "بانک ملت", "دیجیکالا", "اسنپ"];

export const navigationItems = [
  { href: "#features", label: "ماژول‌ها" },
  { href: "#workflow", label: "نحوه کار" },
  { href: "#pricing", label: "تعرفه" },
  { href: "#about", label: "درباره" },
  { href: "#contact", label: "تماس با ما" },
];

export const demoPrompts = [
  "یک روبات نوازنده تار در بازار تبریز، نور نئون، سبک سینمایی، رندر Octane، لنز ۳۵mm",
  "یک گربه فضانورد در حال رانندگی با موتورسیکلت در مریخ، نور طلایی، سبک علمی تخیلی",
  "منظره کوهستان با دریاچه آینه‌ای، غروب خورشید، ابرهای دراماتیک، سبک عکاسی طبیعت",
];

export const STYLE_PRESETS = [
  {
    id: "realistic",
    name: "واقع‌گرایانه",
    icon: "ImageIcon",
    prompt: "ultra realistic, high detail, professional photography",
  },
  {
    id: "oil-painting",
    name: "نقاشی رنگ روغن",
    icon: "Palette",
    prompt: "oil painting style, artistic brushstrokes, classical art",
  },
  {
    id: "cartoon",
    name: "کارتونی",
    icon: "Sparkles",
    prompt: "cartoon style, animated, vibrant colors, playful",
  },
  {
    id: "sketch",
    name: "طراحی",
    icon: "Wand2",
    prompt: "pencil sketch, hand-drawn, artistic, monochrome",
  },
  {
    id: "vintage",
    name: "قدیمی",
    icon: "Zap",
    prompt: "vintage style, retro, aged photo effect, nostalgic",
  },
  {
    id: "cyberpunk",
    name: "سایبرپانک",
    icon: "Zap",
    prompt: "cyberpunk style, neon lights, futuristic, dark atmosphere",
  },
] as const;

export const IMAGE_SIZES = [
  { value: "1:1", label: "مربع (1:1)" },
  { value: "9:16", label: "عمودی موبایل (9:16)" },
  { value: "16:9", label: "افقی واید (16:9)" },
  { value: "3:4", label: "عمودی (3:4)" },
  { value: "4:3", label: "افقی کلاسیک (4:3)" },
  { value: "3:2", label: "افقی عکس (3:2)" },
  { value: "2:3", label: "عمودی عکس (2:3)" },
  { value: "5:4", label: "عمودی نزدیک به مربع (5:4)" },
  { value: "4:5", label: "عمودی نزدیک به مربع (4:5)" },
  { value: "21:9", label: "افقی اولترا واید (21:9)" },
] as const;

// Credit costs for different generation types
export const creditCosts = {
  nanoBananaStandard: 4,
  nanoBananaPro: 24,
  klingVideo5s: 55,
  klingVideo5sSound: 110,
  klingVideo10s: 110,
  klingVideo10sSound: 220,
};

// Credit usage examples calculator
export function calculateCreditUsage(totalCredits: number) {
  return {
    standardImages: Math.floor(totalCredits / creditCosts.nanoBananaStandard),
    proImages: Math.floor(totalCredits / creditCosts.nanoBananaPro),
    videos5s: Math.floor(totalCredits / creditCosts.klingVideo5s),
    videos10s: Math.floor(totalCredits / creditCosts.klingVideo10s),
    videos5sSound: Math.floor(totalCredits / creditCosts.klingVideo5sSound),
    videos10sSound: Math.floor(totalCredits / creditCosts.klingVideo10sSound),
  };
}

// Credit packages for additional credit purchases
export const creditPackages = [
  {
    id: "credits_100",
    credits: 100,
    price: 200000,
    currency: "تومان",
    name: "۱۰۰ اعتبار",
    description: "مناسب برای استفاده محدود",
    popular: false,
  },
  {
    id: "credits_300",
    credits: 300,
    price: 550000,
    currency: "تومان",
    name: "۳۰۰ اعتبار",
    description: "گزینه متعادل",
    popular: false,
  },
  {
    id: "credits_500",
    credits: 500,
    price: 900000,
    currency: "تومان",
    name: "۵۰۰ اعتبار",
    description: "پیشنهاد ویژه",
    popular: true,
  },
  {
    id: "credits_1000",
    credits: 1000,
    price: 1700000,
    currency: "تومان",
    name: "۱۰۰۰ اعتبار",
    description: "بهترین قیمت",
    popular: false,
  },
];

// Ready prompts for dashboard style cards
export interface ReadyPrompt {
  title: string;
  prompt: string;
  imageUrl: string;
  route: string;
  gradient?: string;
}

export const READY_PROMPTS: ReadyPrompt[] = [
  {
    title: "نقاشی خودکار",
    prompt:
      "Use my uploaded image. Generate a hand-drawn portrait illustration in red and yellow pen on notebook paper, inspired by doodle art and comic annotations. Keep full likeness of the subject, expressive lines, spontaneous gestures, bold outline glow, handwritten notes around, realistic pen stroke texture,",
    imageUrl:
      "https://menucaffe-test.storage.c2.liara.space/bananaai/images/sorena.jpg",
    route: "/dashboard/image-to-image",
    gradient: "from-red-400/20 via-yellow-400/20 to-orange-500/20",
  },
  {
    title: "اینفوگرافیک غذا",
    prompt: `ورودی شامل یک تصویر رفرنس از بشقاب غذا است. هوش مصنوعی باید فقط بشقاب غذا را با دقت بالا از پس‌زمینه جدا کند (دوربری تمیز و دقیق)، بدون هیچ‌گونه تغییر در خود غذا، رنگ‌ها، بافت، نور یا چیدمان مواد غذایی.

پس از دوربری، همان بشقاب واقعی بدون دستکاری داخل یک طراحی اینفوگرافیک حرفه‌ای و مینیمال قرار گیرد. هیچ تغییر بصری روی غذا اعمال نشود؛ فقط جایگذاری گرافیکی انجام شود.

طراحی اینفوگرافیک سبک پریمیوم، بالغ و مدرن، مشابه داشبوردهای تحلیلی تغذیه و اپلیکیشن‌های حرفه‌ای سلامت. پس‌زمینه ساده و خنثی (سفید، خاکستری روشن یا تیره ملایم)، تمرکز بصری روی خود بشقاب.

اطلاعات تغذیه‌ای به زبان فارسی، با اعداد فارسی، به‌صورت باکس‌های خطی یا نمودارهای مینیمال در اطراف یا کنار بشقاب نمایش داده شود:

- نام غذا

- کالری تقریبی کل

- پروتئین

- کربوهیدرات

- چربی

- فیبر

- ترکیبات اصلی با نسبت تقریبی

تایپوگرافی رسمی، ساده و خوانا، بدون آیکون کودکانه، بدون رنگ‌های جیغ، بدون ایموجی، بدون متن انگلیسی.

خروجی نهایی کاملاً واضح، شارپ، تمیز و قابل اعتماد؛ مناسب ارائه حرفه‌ای، شبکه‌های اجتماعی یا اپلیکیشن تحلیلی تغذیه.`,
    imageUrl:
      "https://menucaffe-test.storage.c2.liara.space/bananaai/images/1767016847482-e5iopnp8qnb.jpg",
    route: "/dashboard/image-to-image",
    gradient: "from-teal-400/20 via-cyan-400/20 to-blue-500/20",
  },
  {
    title: "پرتره سینمایی",
    prompt:
      "A cinematic fashion portrait of a single subject standing firmly on the ground, centered perfectly in the frame. The subject is sharp and still, fully grounded, with a confident upright posture. Surrounding the subject are dynamic long-exposure light trails and motion blur streaks created by passing city lights, wrapping around the body without affecting facial sharpness. The environment suggests a night-time urban street with neon reflections and ambient glow. Strong contrast between a crisp, detailed subject and energetic blurred background motion. Editorial fashion photography style, artistic but realistic. Shallow depth of field, subject isolation, cinematic color grading, natural skin texture, no floating, no levitation, no surreal gravity effects, grounded stance only.",
    imageUrl:
      "https://menucaffe-test.storage.c2.liara.space/bananaai/images/gogosh.jpg",
    route: "/dashboard/image-to-image",
    gradient: "from-purple-400/20 via-pink-400/20 to-rose-500/20",
  },
  {
    title: "کت شلواری",
    prompt:
      "Uma foto realista em preto e branco, recriando fielmente todos os traços, linhas faciais e proporções da imagem de referência. O sujeito apresenta um semblante imponente e confiante, com postura firme e elegante. Ele veste um terno preto clássico bem ajustado, com gravata slim preta, transmitindo sofisticação e autoridade. Iluminação controlada de estúdio, com contraste equilibrado, realçando a estrutura do rosto e a textura natural da pele. Estilo editorial, realista, sem exageros artísticos, fundo simples e discreto, foco total no retrato masculino.",
    imageUrl:
      "https://menucaffe-test.storage.c2.liara.space/bananaai/styles/black-tie-portrait.webp",
    route: "/dashboard/image-to-image",
    gradient: "from-neutral-700/20 via-neutral-800/20 to-black/30",
  },
  {
    title: "کلاس درس",
    prompt:
      "Edit this image of a young man into a high-contrast black and white portrait set inside a quiet classroom. The man leans casually on a wooden school chair with legs crossed, wearing a navy blue sweatshirt, beige chinos, and black-and-white Converse sneakers. His expression is calm and neutral. His left arm rests on a desk while his right hand hangs naturally by his side. Behind him is an off-white classroom wall with visible wear, pinned papers, photos, and sticky notes arranged in a loose grid. One paper clearly displays the word 'Silence' above his head. Strong sunlight enters from the right, creating a sharp triangular beam of light on the wall and casting his shadow. The mood is cinematic, realistic, and candid, resembling a film photograph with slight grain, soft vintage texture, and natural imperfections.",
    imageUrl:
      "https://menucaffe-test.storage.c2.liara.space/bananaai/styles/classroom-effect.webp",
    route: "/dashboard/image-to-image",
    gradient: "from-slate-400/20 via-gray-500/20 to-zinc-600/20",
  },
  {
    title: "شیر",
    prompt:
      "Create a realistic and emotional cinematic scene using the provided image for accurate facial features. A man and a majestic lion stand face to face, gently touching foreheads and muzzles in a moment of deep connection, respect, and spiritual bond. The man's eyes are closed with a serene, peaceful expression. The lion appears calm and powerful, with a thick, detailed mane. Both stand on lightly snow-covered ground as soft snowflakes fall. The man wears a dark coat, hair slightly tousled by cold wind. The background shows a misty, cold natural landscape with blurred mountains and gray tones. Lighting is soft and diffuse, emphasizing textures of skin, fur, and fabric. The atmosphere is poetic, calm, powerful, and cinematic.",
    imageUrl:
      "https://menucaffe-test.storage.c2.liara.space/bananaai/styles/instinct-spirit-lion.webp",
    route: "/dashboard/image-to-image",
    gradient: "from-slate-300/20 via-gray-400/20 to-stone-500/20",
  },
  {
    title: "مونوکرومیک",
    prompt:
      "Recreate this scene using my submitted photo as reference, preserving the same framing, pose, lighting, and composition. The image shows a half-length male portrait, seated and leaning slightly forward. The right arm crosses the body, while the left hand rests gently on the opposite arm, conveying elegance and confidence. Facial expression is calm, confident, and subtly enigmatic, with a direct gaze into the camera and relaxed lips. He wears a dark, sophisticated outfit: a structured black blazer over a fitted black shirt or T-shirt, possibly with sunglasses. Hair is neatly groomed in a modern masculine style. Lighting is professional studio-style, with soft directional light (Rembrandt or side lighting) sculpting facial contours and creating elegant shadows. The background is smooth, neutral dark gray. Final image is black and white, high-contrast yet refined, realistic editorial quality, vertical format (1080x1920), cinematic finish.",
    imageUrl:
      "https://menucaffe-test.storage.c2.liara.space/bananaai/styles/monochromatic-elegant.webp",
    route: "/dashboard/image-to-image",
    gradient: "from-neutral-600/20 via-neutral-700/20 to-neutral-900/30",
  },
  {
    title: "سوار موتور",
    prompt:
      "Crie um retrato ultra-realista e cinematográfico usando a foto enviada como referência facial. O homem está sentado sobre uma moto esportiva preta brilhante, em uma área externa cercada por árvores verdes. Ele veste uma camiseta preta solta, jeans escuros com caimento relaxado e dobras na barra, e tênis Nike preto e branco. Usa um relógio preto como acessório. A mão esquerda repousa casualmente sobre a coxa, enquanto a mão direita segura um capacete preto brilhante com viseira transparente, apoiado na moto. A motocicleta é detalhada, com motor robusto, estrutura forte e detalhes cromados que reforçam sua presença moderna e poderosa. Iluminação natural suave atravessa as árvores, equilibrando luz e sombra. Expressão calma e confiante, olhando diretamente para a câmera. Estilo editorial fotorrealista, alta resolução, atmosfera moderna e cinematográfica.",
    imageUrl:
      "https://menucaffe-test.storage.c2.liara.space/bananaai/styles/moto-esportiva.webp",
    route: "/dashboard/image-to-image",
    gradient: "from-emerald-400/20 via-green-500/20 to-lime-600/20",
  },
  {
    title: "روی صندلی",
    prompt:
      "Studio portrait of a confident man sitting on a modern beige armchair with wooden legs. He leans slightly forward with his hands brought together, conveying calm authority and confidence. He wears a dark navy blue dress shirt with the top buttons open, light beige slim-fit trousers, and black loafers with tan soles. He has short dark brown hair styled with texture, a neatly trimmed full beard, warm tanned skin, and an intense, focused gaze directed at the camera. The background is minimalist light gray with a smooth gradient. Lighting is soft, natural studio light, evenly distributed to maintain realism and fine detail. The mood is cinematic and fashion-editorial, shot with a 50mm lens at f/2.8, vertical framing, full-body composition, professional photo quality.",
    imageUrl:
      "https://menucaffe-test.storage.c2.liara.space/bananaai/styles/premium-male-editorial-portrait.webp",
    route: "/dashboard/image-to-image",
    gradient: "from-stone-300/20 via-neutral-300/20 to-gray-400/20",
  },
];
