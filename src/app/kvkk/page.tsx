import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni | Büyük Akören Köyü Derneği",
  description:
    "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında Büyük Akören Köyü Derneği kişisel veri işleme ve saklama ilkeleri.",
};

export default function KvkkPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-[#666560] hover:text-[#191919]"
      >
        <ArrowLeft className="h-4 w-4" />
        Ana Sayfaya Dön
      </Link>

      <div className="mt-6 rounded-2xl border border-[#e6e5e0] bg-white p-6 sm:p-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-800">
          <ShieldCheck className="h-4 w-4" />
          6698 Sayılı KVKK Aydınlatma Metni
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#191919] sm:text-3xl">
          Kişisel Verilerin Korunması Aydınlatma Metni
        </h1>
        <p className="mt-2 text-sm text-[#666560]">
          Veri Sorumlusu: Büyük Akören Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#2f2e2b]">
          <section>
            <h2 className="text-base font-semibold text-[#191919]">
              1. İşlenen Kişisel Veriler ve Toplama Yöntemi
            </h2>
            <p className="mt-2">
              Derneğimiz internet sitesindeki iletişim formunu doldurmanız
              durumunda paylaştığınız ad-soyad, isteğe bağlı telefon numarası,
              konu ve mesaj içeriği ile güvenlik amaçlı tek yönlü özetlenmiş
              (anonimleştirilmiş) işlem zamanı kayıtları elektronik ortamda
              işlenmektedir.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#191919]">
              2. Kişisel Verilerin İşlenme Amaçları ve Hukuki Sebebi
            </h2>
            <p className="mt-2">
              İletişim formu üzerinden iletilen veriler; yalnızca talep, öneri,
              üyelik veya dayanışma başvurularınızın incelenmesi, size dönüş
              yapılabilmesi ve kötü niyetli otomatik gönderimlerin engellenmesi
              amacıyla 6698 sayılı Kanun&apos;un 5. maddesi kapsamında açık rızanız ve
              meşru menfaat çerçevesinde işlenir.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#191919]">
              3. Verilerin Saklanması, Güvenliği ve İmhası
            </h2>
            <p className="mt-2">
              İletişim mesajları sunucu tarafında AES-256-GCM şifreleme ile
              korunan özel depoda saklanır, yalnızca yetkili dernek
              yöneticilerince görüntülenir ve üçüncü kişilerle veya ticari
              amaçlı kurumlarla paylaşılmaz. Mesajlar talebin sonuçlanmasını
              izleyen en fazla 1 (bir) yıl içinde silinir.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#191919]">
              4. KVKK Madde 11 Kapsamındaki Haklarınız
            </h2>
            <p className="mt-2">
              Derneğimize{" "}
              <Link href="/iletisim" className="font-medium underline">
                İletişim Sayfası
              </Link>{" "}
              üzerinden başvurarak kişisel verilerinizin işlenip işlenmediğini
              öğrenme, düzeltilmesini veya silinmesini talep etme haklarına
              sahipsiniz.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
