/** Taziye paylaşım metninde boş alanlar "undefined" olarak görünmemeli. Çalıştırma: npx tsx tests/condolence-share.test.ts */
import assert from "assert";
import { condolenceShareTitle, normalizeCondolence } from "../src/lib/condolence";
import { Condolence } from "../src/lib/types";

const base = { id: "c1", deceased_name: "Hacı Mehmet Demir", message: "", is_published: true, created_at: "2026-11-15" } as Condolence;

assert.equal(condolenceShareTitle({ ...base, funeral_date: "2026-11-15" } as Condolence), "Vefat & Taziye: Hacı Mehmet Demir (2026-11-15)");
assert.equal(condolenceShareTitle({ ...base, funeral_date: "2026-11-15", burial_place: "Köy Mezarlığı" }), "Vefat & Taziye: Hacı Mehmet Demir (2026-11-15 - Köy Mezarlığı)");
assert.equal(condolenceShareTitle({ ...base, funeral_date: "  ", burial_place: "undefined" }), "Vefat & Taziye: Hacı Mehmet Demir");
const n = normalizeCondolence({ ...base, funeral_date: "2026-11-15", burial_place: "  ", relatives: undefined } as Condolence);
assert.equal(n.burial_place, null);
assert.equal(n.relatives, null);
assert(!condolenceShareTitle(n).includes("undefined"));
console.log("taziye paylaşım metni: geçti");
