/**
 * Seeds series from a content folder into Supabase + R2.
 *
 *   node scripts/seed.mjs D:\toomar-content\whispers-in-the-rain
 *
 * Folder layout (see D:\toomar-content\README.txt):
 *   series.json          kind, titles, descriptions, genre, publish_day, languages, run_status, age_rating,
 *                        creator_email, creator_name, creator_handle, creator_avatar, creator_socials
 *   cover.jpg|png|webp   portrait cover
 *   ar/01/*.jpg          comic: one folder per episode per language, images in reading order
 *   ar/01/horizontal/*.jpg  optional: the same episode drawn as horizontal pages
 *   ar/01.txt            novel: one text file per chapter; first line is the title
 *
 * Reads keys from .env.local. Idempotent: episodes that already have content are skipped.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

// ---------- env ----------
const envPath = resolve(process.cwd(), ".env.local");
if (!existsSync(envPath)) fail(".env.local not found. Fill it in first.");
for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const need = (k) => process.env[k] || fail(`${k} is empty in .env.local`);
const SUPABASE_URL = need("NEXT_PUBLIC_SUPABASE_URL").replace(/\/(rest|auth|storage)\/v1\/?$/i, "").replace(/\/+$/, "");
const SERVICE_KEY = need("SUPABASE_SERVICE_ROLE_KEY");
const R2 = {
  account: need("R2_ACCOUNT_ID"),
  key: need("R2_ACCESS_KEY_ID"),
  secret: need("R2_SECRET_ACCESS_KEY"),
  bucket: process.env.R2_BUCKET || "toomar",
};

function fail(msg) {
  console.error("✗ " + msg);
  process.exit(1);
}

// ---------- args ----------
const dir = process.argv[2];
if (!dir) fail("Usage: node scripts/seed.mjs <series folder>");
const root = resolve(dir);
const metaPath = join(root, "series.json");
if (!existsSync(metaPath)) fail(`${metaPath} is missing`);
const meta = JSON.parse(readFileSync(metaPath, "utf8"));
const force = process.argv.includes("--force");

const GENRES = ["drama", "fantasy", "comedy", "action", "romance", "mystery", "slice_of_life", "historical"];
const DAYS = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, الأحد: 0, الاثنين: 1, الثلاثاء: 2, الأربعاء: 3, الخميس: 4, الجمعة: 5, السبت: 6 };

const kind = meta.kind === "novel" ? "novel" : "comic";
const slug = (meta.slug || basename(root)).toLowerCase();
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) fail(`slug "${slug}" must be lowercase letters, digits and dashes`);
if (!meta.title_ar) fail("series.json needs title_ar");
if (!GENRES.includes(meta.genre)) fail(`genre must be one of: ${GENRES.join(", ")}`);
const publishDay = typeof meta.publish_day === "number" ? meta.publish_day : DAYS[String(meta.publish_day).toLowerCase()];
if (!(publishDay >= 0 && publishDay <= 6)) fail("publish_day must be a weekday name or 0–6");
const languages = (meta.languages || ["ar"]).filter((l) => l === "ar" || l === "en");
if (!meta.creator_email) fail("series.json needs creator_email");
const runStatus = ["ongoing", "completed", "hiatus"].includes(meta.run_status) ? meta.run_status : "ongoing";
const ageRating = ["all", "13", "16"].includes(String(meta.age_rating)) ? String(meta.age_rating) : "all";
const SOCIAL_KEYS = ["instagram", "x", "facebook", "youtube", "tiktok", "website"];
const LAYOUT_KEYS = ["vertical", "horizontal"];
const layouts = (meta.layouts || ["vertical"]).filter((l) => LAYOUT_KEYS.includes(l));
if (layouts.length === 0) fail("layouts must include vertical, horizontal, or both");
if (meta.creator_handle && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(meta.creator_handle)) fail("creator_handle: lowercase letters, digits and dashes only");

// ---------- clients ----------
const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
const s3 = new S3Client({ region: "auto", endpoint: `https://${R2.account}.r2.cloudflarestorage.com`, credentials: { accessKeyId: R2.key, secretAccessKey: R2.secret } });

async function put(key, body, contentType) {
  await s3.send(new PutObjectCommand({ Bucket: R2.bucket, Key: key, Body: body, ContentType: contentType, CacheControl: "public, max-age=31536000, immutable" }));
}

const natural = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
const isImage = (f) => /\.(jpe?g|png|webp)$/i.test(f);
const listDirs = (p) => (existsSync(p) ? readdirSync(p).filter((f) => statSync(join(p, f)).isDirectory()).sort(natural.compare) : []);
const listFiles = (p, pred) => (existsSync(p) ? readdirSync(p).filter((f) => statSync(join(p, f)).isFile() && pred(f)).sort(natural.compare) : []);

/** "03 - عنوان الحلقة" -> { number: 3, title: "عنوان الحلقة" } */
function parseName(name) {
  const m = name.match(/^(\d+)\s*(?:[-–—.]\s*(.*))?$/);
  if (!m) return null;
  return { number: Number(m[1]), title: (m[2] || "").trim() || null };
}

// ---------- creator ----------
async function ensureCreator() {
  const email = meta.creator_email.toLowerCase();
  let user = null;
  for (let page = 1; page <= 20 && !user; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    user = data.users.find((u) => (u.email || "").toLowerCase() === email) || null;
    if (data.users.length < 200) break;
  }
  if (!user) {
    const { data, error } = await db.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { display_name: meta.creator_name || email.split("@")[0] },
    });
    if (error) throw error;
    user = data.user;
    console.log(`+ created account for ${email} (they can sign in with Google or reset the password)`);
  }
  const patch = { role: "creator" };
  if (meta.creator_name) patch.display_name = meta.creator_name;
  if (meta.creator_verified === true) patch.is_verified = true;
  if (meta.creator_handle) patch.handle = meta.creator_handle;
  if (meta.creator_bio) patch.bio = String(meta.creator_bio).slice(0, 500);
  if (meta.creator_socials && typeof meta.creator_socials === "object") {
    patch.social_links = Object.fromEntries(SOCIAL_KEYS.filter((k) => typeof meta.creator_socials[k] === "string" && meta.creator_socials[k]).map((k) => [k, meta.creator_socials[k]]));
  }
  if (meta.creator_avatar) {
    const file = join(root, meta.creator_avatar);
    if (!existsSync(file)) fail(`creator_avatar not found: ${file}`);
    const img = sharp(file).rotate();
    const m = await img.metadata();
    const side = Math.min(m.width, m.height);
    const buf = await img.extract({ left: Math.floor((m.width - side) / 2), top: Math.floor((m.height - side) / 2), width: side, height: side }).resize({ width: 400, withoutEnlargement: true }).webp({ quality: 88 }).toBuffer();
    const key = `avatars/${user.id}/${Date.now()}.webp`;
    await put(key, buf, "image/webp");
    patch.avatar_key = key;
    console.log(`+ avatar uploaded (${Math.round(buf.length / 1024)} KB)`);
  }
  const { data: prof } = await db.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (prof?.role === "admin") delete patch.role;
  const { error } = await db.from("profiles").update(patch).eq("id", user.id);
  if (error) throw error;
  return user.id;
}

// ---------- series ----------
async function ensureSeries(creatorId) {
  const fields = {
    kind,
    creator_id: creatorId,
    genre: meta.genre,
    publish_day: publishDay,
    title_ar: meta.title_ar,
    title_en: meta.title_en || null,
    description_ar: meta.description_ar || null,
    description_en: meta.description_en || null,
    languages,
    run_status: runStatus,
    age_rating: ageRating,
    layouts,
  };
  const { data: existing } = await db.from("series").select("id, status, cover_key").eq("slug", slug).maybeSingle();
  let id = existing?.id;
  if (!id) {
    const { data, error } = await db
      .from("series")
      .insert({ ...fields, slug, status: "approved", approved_at: new Date().toISOString() })
      .select("id")
      .single();
    if (error) throw error;
    id = data.id;
    console.log(`+ created series ${slug}`);
  } else {
    const { error } = await db.from("series").update(fields).eq("id", id);
    if (error) throw error;
    console.log(`= updated series ${slug} (${existing.status})`);
  }

  const coverFile = listFiles(root, (f) => /^cover\.(jpe?g|png|webp)$/i.test(f))[0];
  if (coverFile && (!existing?.cover_key || force)) {
    const buf = await sharp(join(root, coverFile)).rotate().resize({ width: 600, height: 900, fit: "cover", position: "centre" }).webp({ quality: 88 }).toBuffer();
    const key = `series/${id}/cover-${Date.now()}.webp`;
    await put(key, buf, "image/webp");
    await db.from("series").update({ cover_key: key }).eq("id", id);
    console.log(`+ cover uploaded (${Math.round(buf.length / 1024)} KB)`);
  }
  return id;
}

// ---------- episodes ----------
/** Uploads one layout's images for an episode. Returns the bytes written. */
async function seedImages(seriesId, episodeId, folder, layout) {
  const files = listFiles(folder, isImage);
  if (files.length === 0) return { count: 0, bytes: 0 };
  const pages = layout === "horizontal";
  const { count: existing } = await db.from("episode_images").select("id", { count: "exact", head: true }).eq("episode_id", episodeId).eq("layout", layout);
  if (existing && !force) {
    console.log(`  = ${layout}: already has ${existing} images, skipped`);
    return { count: 0, bytes: 0 };
  }
  if (existing) await db.from("episode_images").delete().eq("episode_id", episodeId).eq("layout", layout);
  let position = 0;
  let total = 0;
  for (const f of files) {
    const img = sharp(join(folder, f)).rotate();
    const m = await img.metadata();
    // Strips are capped by width; single pages by their longest side.
    const resize = pages ? (m.width >= m.height ? { width: Math.min(1600, m.width) } : { height: Math.min(1600, m.height) }) : { width: Math.min(1080, m.width || 1080) };
    const buf = await img.resize({ ...resize, withoutEnlargement: true }).webp({ quality: 86 }).toBuffer();
    const { width: w, height: h } = await sharp(buf).metadata();
    const key = `series/${seriesId}/ep/${episodeId}/${layout}/${crypto.randomUUID()}.webp`;
    await put(key, buf, "image/webp");
    const { error } = await db.from("episode_images").insert({ episode_id: episodeId, position: ++position, key, width: w, height: h, bytes: buf.length, layout });
    if (error) throw error;
    total += buf.length;
  }
  return { count: files.length, bytes: total };
}

async function seedComicEpisode(seriesId, lang, folder, number, title) {
  const hasPages = existsSync(join(folder, "horizontal"));
  if (listFiles(folder, isImage).length === 0 && !hasPages) {
    console.log(`  - ${lang}/${basename(folder)}: no images, skipped`);
    return;
  }
  let { data: ep } = await db.from("episodes").select("id").eq("series_id", seriesId).eq("number", number).eq("lang", lang).maybeSingle();
  if (!ep) {
    const { data, error } = await db.from("episodes").insert({ series_id: seriesId, number, lang, title }).select("id").single();
    if (error) throw error;
    ep = data;
  } else if (title) {
    await db.from("episodes").update({ title }).eq("id", ep.id);
  }
  const strip = await seedImages(seriesId, ep.id, folder, "vertical");
  const pages = hasPages ? await seedImages(seriesId, ep.id, join(folder, "horizontal"), "horizontal") : { count: 0, bytes: 0 };
  const written = strip.count + pages.count;
  if (written > 0) {
    const parts = [strip.count ? `${strip.count} رأسية` : null, pages.count ? `${pages.count} أفقية` : null].filter(Boolean).join(" + ");
    console.log(`  + ${lang}/${number}: ${parts}, ${Math.round((strip.bytes + pages.bytes) / 1024)} KB`);
  }
  await db.from("episodes").update({ is_published: true }).eq("id", ep.id);
}

async function seedNovelChapter(seriesId, lang, file, number, fallbackTitle) {
  const text = readFileSync(file, "utf8").replace(/\r\n/g, "\n").trim();
  const [first, ...rest] = text.split("\n");
  const hasTitle = first.length < 120 && rest.length > 0;
  const title = hasTitle ? first.trim() : fallbackTitle;
  const body = (hasTitle ? rest.join("\n") : text).trim();
  if (!body) {
    console.log(`  - ${lang}/${number}: empty, skipped`);
    return;
  }
  const { data: ep } = await db.from("episodes").select("id, body").eq("series_id", seriesId).eq("number", number).eq("lang", lang).maybeSingle();
  if (ep && ep.body && !force) {
    console.log(`  = ${lang}/${number}: already has text, skipped`);
  } else if (ep) {
    await db.from("episodes").update({ title, body, is_published: true }).eq("id", ep.id);
    console.log(`  + ${lang}/${number}: updated`);
  } else {
    const { error } = await db.from("episodes").insert({ series_id: seriesId, number, lang, title, body, is_published: true });
    if (error) throw error;
    console.log(`  + ${lang}/${number}: ${body.length} chars`);
  }
}

async function main() {
  console.log(`Seeding ${kind} "${meta.title_ar}" (${slug})`);
  const creatorId = await ensureCreator();
  const seriesId = await ensureSeries(creatorId);
  for (const lang of languages) {
    const langDir = join(root, lang);
    if (kind === "comic") {
      for (const name of listDirs(langDir)) {
        const p = parseName(name);
        if (!p) {
          console.log(`  ! ${lang}/${name}: folder name must start with the episode number`);
          continue;
        }
        await seedComicEpisode(seriesId, lang, join(langDir, name), p.number, p.title);
      }
    } else {
      for (const name of listFiles(langDir, (f) => extname(f).toLowerCase() === ".txt")) {
        const p = parseName(basename(name, ".txt"));
        if (!p) {
          console.log(`  ! ${lang}/${name}: file name must start with the chapter number`);
          continue;
        }
        await seedNovelChapter(seriesId, lang, join(langDir, name), p.number, p.title);
      }
    }
  }
  console.log(`✓ done: https://toomar.vercel.app/${kind === "comic" ? "comics" : "novels"}/${slug}`);
}

main().catch((e) => fail(e.message || String(e)));
