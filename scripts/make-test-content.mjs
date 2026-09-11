/**
 * Generates placeholder content for testing: a comic with drawn strips and a
 * short novel. Output goes to D:\toomar-content\test-comic and test-novel.
 *   node scripts/make-test-content.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const OUT = "D:/toomar-content";
const PALETTE = ["#2B5CF6", "#6B4DE6", "#FFB800", "#FF7A59", "#1E44C2", "#111111", "#0E7C4A"];

function panelSvg(w, h, i, ep, text) {
  const bg = PALETTE[(i + ep) % PALETTE.length];
  const fg = bg === "#FFB800" || bg === "#FF7A59" ? "#111111" : "#FFFFFF";
  const shapes = [
    `<circle cx="${w * 0.7}" cy="${h * 0.3}" r="${h * 0.12}" fill="${fg}" opacity="0.9"/>`,
    `<path d="M0 ${h} L${w * 0.3} ${h * 0.55} L${w * 0.5} ${h * 0.75} L${w * 0.75} ${h * 0.45} L${w} ${h * 0.7} L${w} ${h} Z" fill="#111111" opacity="0.85"/>`,
    `<rect x="${w * 0.1}" y="${h * 0.15}" width="${w * 0.3}" height="${h * 0.3}" fill="#111111" opacity="0.8"/>`,
    `<path d="M0 ${h * 0.8} Q${w / 2} ${h * 0.2} ${w} ${h * 0.8} L${w} ${h} L0 ${h} Z" fill="${fg}" opacity="0.5"/>`,
  ][i % 4];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <rect width="100%" height="100%" fill="${bg}"/>
  ${shapes}
  <text x="${w / 2}" y="${h * 0.5}" text-anchor="middle" font-family="Arial" font-size="${h * 0.09}" font-weight="700" fill="${fg}">${text}</text>
  <text x="${w / 2}" y="${h * 0.5 + h * 0.1}" text-anchor="middle" font-family="Arial" font-size="${h * 0.05}" fill="${fg}" opacity="0.8">Episode ${ep} - Panel ${i + 1}</text>
</svg>`;
}

async function comic() {
  const root = join(OUT, "test-comic");
  writeFileSync(
    join(root, "series.json"),
    JSON.stringify(
      {
        kind: "comic",
        title_ar: "بنت النيل الأخير",
        title_en: "The Last Daughter of the Nile",
        description_ar: "قصة تجريبية لاختبار القارئ. في مدينة على ضفة النهر، تكتشف فتاة أن الماء يحفظ ما ينساه الناس.",
        description_en: "A placeholder story for testing the reader. In a city on the river bank, a girl discovers that the water keeps what people forget.",
        genre: "fantasy",
        publish_day: "thursday",
        languages: ["ar", "en"],
        layouts: ["vertical", "horizontal"],
        creator_email: "test-creator@example.com",
        creator_name: "نور محمود",
        creator_verified: true,
      },
      null,
      2,
    ),
  );
  await sharp(Buffer.from(panelSvg(600, 900, 0, 0, "TEST COVER"))).png().toFile(join(root, "cover.png"));
  for (const lang of ["ar", "en"]) {
    for (let ep = 1; ep <= 3; ep++) {
      const dir = join(root, lang, String(ep).padStart(2, "0"));
      mkdirSync(dir, { recursive: true });
      const panels = 8 + ep * 2;
      for (let i = 0; i < panels; i++) {
        const h = [1400, 1800, 1000, 2200][i % 4];
        await sharp(Buffer.from(panelSvg(1080, h, i, ep, lang === "ar" ? "TEST STRIP" : "TEST STRIP EN"))).jpeg({ quality: 90 }).toFile(join(dir, `${String(i + 1).padStart(2, "0")}.jpg`));
      }
      // The same episode as single pages, for the horizontal reader.
      const pagesDir = join(dir, "horizontal");
      mkdirSync(pagesDir, { recursive: true });
      for (let i = 0; i < 6; i++) {
        const [w, h] = i % 3 === 2 ? [2000, 1400] : [1000, 1400];
        await sharp(Buffer.from(panelSvg(w, h, i, ep, lang === "ar" ? "TEST PAGE" : "TEST PAGE EN"))).jpeg({ quality: 90 }).toFile(join(pagesDir, `${String(i + 1).padStart(2, "0")}.jpg`));
      }
    }
  }
  console.log("comic: 3 episodes x 2 languages");
}

const CHAPTERS = [
  [
    "الساعة التي لا تدق",
    "في ميدان الساعة، حيث تلتقي الشوارع الخمسة كأصابع يد مفتوحة، كان هناك برج قديم لا يعرف أحد متى بُني ولا من بناه. الساعة في أعلاه متوقفة منذ سنوات على الثامنة وعشر دقائق، ومع ذلك يضبط الباعة مواعيدهم عليها.",
    "قال لي جدي مرة إن الساعة لم تتوقف، بل إن الوقت هو الذي توقف عندها. ضحكت يومها، ثم كبرت وفهمت أنه لم يكن يمزح.",
    "وصلت إلى الميدان قبل الفجر بقليل. كانت المقاهي مغلقة، والكراسي مقلوبة على الطاولات، ورجل واحد يكنس الرصيف ببطء كأنه يكنس أفكاره. رفعت رأسي إلى البرج. الثامنة وعشر دقائق.",
    "ثم سمعت الدقة الأولى.",
  ],
  [
    "الرجل الذي يكنس",
    "توقف الرجل عن الكنس ونظر إليّ. لم يكن في نظرته دهشة، بل شيء أقرب إلى الانتظار، كمن كان يعرف أنني سآتي في هذه الساعة تحديداً.",
    "«سمعتها؟» سألني. أومأت. «إذن أنت هو.» ولم يشرح، بل أسند المكنسة إلى الجدار ودخل المقهى المغلق من باب جانبي لم أره من قبل.",
    "تبعته. في الداخل كانت رائحة البن والخشب القديم، وعلى الحائط صورة للميدان ملتقطة من زاوية لا يمكن الوقوف فيها إلا من داخل البرج نفسه.",
    "«اجلس»، قال. «القصة طويلة، والساعة بدأت تمشي، ولن تنتظرنا.»",
  ],
  [
    "ما تحفظه المدينة",
    "قال إن المدينة تحفظ كل ما يُقال فيها بصدق، وإن الساعة هي ذاكرتها. توقفت يوم قيل فيها آخر شيء صادق، وستعود إلى الدوران حين يُقال شيء صادق آخر.",
    "«وماذا قلت أنا؟» سألته. ابتسم للمرة الأولى: «لم تقل شيئاً بعد. لكنك جئت، وهذا في هذه المدينة كلامٌ كثير.»",
    "خرجت إلى الميدان والشمس تطلع من بين البنايات. كانت الساعة تشير إلى الثامنة وإحدى عشرة دقيقة. دقيقة واحدة فقط. لكنها كانت تمشي.",
  ],
];

function novel() {
  const root = join(OUT, "test-novel");
  mkdirSync(join(root, "ar"), { recursive: true });
  writeFileSync(
    join(root, "series.json"),
    JSON.stringify(
      {
        kind: "novel",
        title_ar: "ميدان الساعة",
        title_en: "Clock Square",
        description_ar: "رواية تجريبية قصيرة لاختبار قارئ الروايات. ساعة متوقفة، ورجل يكنس، ومدينة تحفظ ما يُقال فيها بصدق.",
        description_en: "A short placeholder novel for testing the reader.",
        genre: "mystery",
        publish_day: "saturday",
        languages: ["ar"],
        creator_email: "test-author@example.com",
        creator_name: "يوسف عادل",
        creator_verified: false,
      },
      null,
      2,
    ),
  );
  CHAPTERS.forEach(([title, ...paras], i) => {
    writeFileSync(join(root, "ar", `${String(i + 1).padStart(2, "0")}.txt`), [title, "", ...paras.flatMap((p) => [p, ""])].join("\n"));
  });
  console.log("novel: 3 chapters");
}

mkdirSync(join(OUT, "test-comic"), { recursive: true });
await comic();
novel();
