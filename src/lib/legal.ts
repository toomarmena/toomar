import type { Lang } from "./i18n";

export type LegalSection = { h: string; p: string[] };
export type LegalDoc = { title: string; updated: string; intro: string; sections: LegalSection[] };

const UPDATED = { ar: "آخر تحديث: ٧ سبتمبر ٢٠٢٦", en: "Last updated: 7 September 2026" };

export const PRIVACY: Record<Lang, LegalDoc> = {
  ar: {
    title: "سياسة الخصوصية",
    updated: UPDATED.ar,
    intro: "طومار منصة لقراءة القصص المصوّرة والروايات. نجمع أقل ما يلزم لتشغيلها، ولا نبيع بياناتك لأحد.",
    sections: [
      { h: "ما نجمعه", p: ["عند إنشاء حساب: بريدك الإلكتروني واسمك المعروض، وإن سجّلت بحساب جوجل فالاسم والصورة اللتان يوفّرهما جوجل.", "عند القراءة: أحداث مجهولة تسجّل أن حلقة فُتحت أو اكتملت، مرتبطة بحسابك إن كنت مسجّلًا أو بمعرّف عشوائي محفوظ في متصفحك إن لم تكن. نستخدمها لفهم ما يعود إليه القرّاء، ولا نعرض أعداد المشاهدات لأحد.", "تفضيلاتك: لغة الواجهة والوضع الداكن وحجم خط القراءة، محفوظة في متصفحك."] },
      { h: "ما لا نجمعه", p: ["لا نستخدم أدوات تتبّع إعلانية، ولا نشارك بياناتك مع معلنين، ولا نبيعها."] },
      { h: "أين تُحفظ", p: ["الحسابات والبيانات في Supabase، والصور في Cloudflare R2، والموقع يعمل على Vercel. كلها خدمات موثوقة تلتزم بمعايير حماية البيانات."] },
      { h: "حقوقك", p: ["يمكنك تعديل اسمك ونبذتك وروابطك من حسابك في أي وقت. لحذف حسابك وبياناتك نهائيًا راسلنا على البريد المذكور أدناه وسننفّذ الطلب خلال أيام."] },
      { h: "المبدعون", p: ["الاسم والصورة والنبذة والروابط التي يضيفها المبدع في ملفه العام تُعرض للعامة، بحسب اختياره."] },
      { h: "التواصل", p: ["لأي سؤال عن الخصوصية: hello@toomar.app"] },
    ],
  },
  en: {
    title: "Privacy Policy",
    updated: UPDATED.en,
    intro: "Toomar is a platform for reading web comics and novels. We collect the minimum needed to run it, and we never sell your data.",
    sections: [
      { h: "What we collect", p: ["When you create an account: your email and display name, and if you sign in with Google, the name and picture Google provides.", "When you read: anonymous events recording that an episode was opened or finished, tied to your account if signed in or to a random identifier stored in your browser if not. We use them to understand what readers come back to; view counts are shown to no one.", "Your preferences: interface language, dark mode and reading text size, stored in your browser."] },
      { h: "What we do not collect", p: ["No advertising trackers, no sharing with advertisers, no selling of data."] },
      { h: "Where it lives", p: ["Accounts and data are in Supabase, images in Cloudflare R2, and the site runs on Vercel."] },
      { h: "Your rights", p: ["You can edit your name, bio and links from your account at any time. To delete your account and data permanently, email us at the address below and we will do it within days."] },
      { h: "Creators", p: ["The name, picture, bio and links a creator adds to their public profile are shown publicly, by their choice."] },
      { h: "Contact", p: ["Privacy questions: hello@toomar.app"] },
    ],
  },
};

export const TERMS: Record<Lang, LegalDoc> = {
  ar: {
    title: "شروط الاستخدام",
    updated: UPDATED.ar,
    intro: "باستخدامك طومار توافق على ما يلي. كتبناه مختصرًا وواضحًا عن قصد.",
    sections: [
      { h: "المنصة", p: ["طومار منصة منتقاة: كل سلسلة تُعرض للعامة بعد موافقة المحرّر. الحسابات مفتوحة للقرّاء والمبدعين، والنشر يخضع للمراجعة."] },
      { h: "حقوق المبدع", p: ["المبدع يملك عمله كاملًا: النص والرسوم والشخصيات. بنشره على طومار يمنح المنصة رخصة غير حصرية لعرضه وتوزيعه على الموقع وقنواته، ويمكنه إزالته في أي وقت.", "لطومار حق الوساطة في أي تكييف للعمل إلى الشاشة أو وسائط أخرى ينشأ عبر المنصة، بنسبة معلنة تُحدَّد في اتفاقية منفصلة قبل أي عرض. [النسبة تُحدَّد لاحقًا]"] },
      { h: "ما لا يُنشر", p: ["أعمال لا يملك ناشرها حقوقها، أو تحرّض على العنف أو الكراهية، أو تستهدف القاصرين بمحتوى غير ملائم. المحرّر يرفض أو يزيل ما يخالف ذلك، ويبيّن السبب للمبدع."] },
      { h: "التوثيق", p: ["علامة التوثيق يمنحها المحرّر للمبدعين الذين يُعرف عملهم وهويتهم. لا تُشترى ولا تُطلب."] },
      { h: "الحسابات", p: ["أنت مسؤول عن حسابك وكلمة مرورك. يمكننا تعليق حساب يخالف هذه الشروط بعد تنبيه، أو فورًا في الحالات الجسيمة."] },
      { h: "التغييرات", p: ["قد نعدّل هذه الشروط. سنذكر تاريخ آخر تحديث أعلى الصفحة، وننبّه المبدعين بالبريد عند التغييرات الجوهرية."] },
      { h: "التواصل", p: ["hello@toomar.app"] },
    ],
  },
  en: {
    title: "Terms of Use",
    updated: UPDATED.en,
    intro: "By using Toomar you agree to the following. It is short and plain on purpose.",
    sections: [
      { h: "The platform", p: ["Toomar is curated: every series becomes public after the editor approves it. Accounts are open to readers and creators; publishing is reviewed."] },
      { h: "Creators' rights", p: ["Creators own their work in full: text, art and characters. By publishing on Toomar they grant the platform a non-exclusive licence to display and distribute it on the site and its channels, and can remove it at any time.", "Toomar holds the right to broker any adaptation of the work to screen or other media that originates through the platform, at a disclosed share set in a separate agreement before any pitch. [Share to be set]"] },
      { h: "What is not published", p: ["Work whose publisher does not hold the rights, work that incites violence or hatred, or work aimed at minors with unsuitable content. The editor rejects or removes it and tells the creator why."] },
      { h: "Verification", p: ["The verified mark is granted by the editor to creators whose work and identity are known. It cannot be bought or requested."] },
      { h: "Accounts", p: ["You are responsible for your account and password. We may suspend an account that breaks these terms after a warning, or immediately in serious cases."] },
      { h: "Changes", p: ["We may change these terms. The date at the top shows the last update, and creators are emailed about material changes."] },
      { h: "Contact", p: ["hello@toomar.app"] },
    ],
  },
};
