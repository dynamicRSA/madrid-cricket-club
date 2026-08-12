"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, ExternalLink, Calendar } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function ContactPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-28 pb-12 px-4" style={{ background: "linear-gradient(135deg, #1a0505 0%, #120808 100%)" }}>
        <div className="container-wide">
          <p className="text-brand-400 text-xs uppercase tracking-widest mb-2">{t("contact.tag")}</p>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-3">{t("contact.title")}</h1>
          <p className="text-slate-400 max-w-xl">{t("contact.desc")}</p>
        </div>
      </section>

      <section className="section px-4" style={{ background: "#120808" }}>
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Committee contacts */}
            <div>
              <h2 className="text-xl font-display font-bold text-white mb-5">{t("contact.committee_title")}</h2>
              <div className="space-y-4">

                <div className="glass-dark p-5">
                  <p className="text-gold-400 text-xs uppercase tracking-widest font-semibold mb-2">{t("footer.president")}</p>
                  <p className="text-white font-semibold text-lg mb-3">Jon Woodward</p>
                  <div className="space-y-2">
                    <a href="mailto:jonwoodward1975@gmail.com" className="flex items-center gap-3 text-slate-300 hover:text-brand-300 transition-colors text-sm">
                      <Mail size={14} className="text-brand-400" />
                      jonwoodward1975@gmail.com
                    </a>
                    <a href="tel:+34655069911" className="flex items-center gap-3 text-slate-300 hover:text-brand-300 transition-colors text-sm">
                      <Phone size={14} className="text-brand-400" />
                      +34 655 069 911
                    </a>
                  </div>
                </div>

                <div className="glass-dark p-5">
                  <p className="text-gold-400 text-xs uppercase tracking-widest font-semibold mb-2">{t("footer.vice_president")}</p>
                  <p className="text-white font-semibold text-lg mb-3">Lewis Clark</p>
                  <div className="space-y-2">
                    <a href="mailto:mail@lewclark.com" className="flex items-center gap-3 text-slate-300 hover:text-brand-300 transition-colors text-sm">
                      <Mail size={14} className="text-brand-400" />
                      mail@lewclark.com
                    </a>
                    <a href="tel:+34687424539" className="flex items-center gap-3 text-slate-300 hover:text-brand-300 transition-colors text-sm">
                      <Phone size={14} className="text-brand-400" />
                      +34 687 424 539
                    </a>
                  </div>
                </div>

              </div>
            </div>

            {/* Grounds & Social */}
            <div>
              <h2 className="text-xl font-display font-bold text-white mb-5">{t("contact.find_us")}</h2>
              <div className="space-y-4">

                <div className="glass-dark p-5">
                  <p className="text-brand-400 text-xs uppercase tracking-widest font-semibold mb-2">{t("contact.ground.main")}</p>
                  <div className="flex gap-3">
                    <MapPin size={16} className="text-brand-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-white text-sm font-medium">Av. Complutense</p>
                      <p className="text-slate-400 text-xs">Moncloa-Aravaca, 28040 Madrid</p>
                      <a href="https://maps.google.com/?q=Av.+Complutense,+Moncloa-Aravaca,+28040+Madrid" target="_blank" rel="noopener noreferrer" className="text-brand-400 text-xs hover:underline mt-1 inline-flex items-center gap-1">
                        {t("contact.open_maps")} <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="glass-dark p-5">
                  <p className="text-brand-400 text-xs uppercase tracking-widest font-semibold mb-2">{t("contact.ground.junior")}</p>
                  <div className="flex gap-3">
                    <MapPin size={16} className="text-brand-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-white text-sm font-medium">Centro Deportivo Municipal La Elipa</p>
                      <p className="text-slate-400 text-xs">C. del Alcalde Garrido Juaristi, 17, Moratalaz, 28030 Madrid</p>
                      <a href="https://maps.google.com/?q=Centro+Deportivo+Municipal+La+Elipa+Madrid" target="_blank" rel="noopener noreferrer" className="text-brand-400 text-xs hover:underline mt-1 inline-flex items-center gap-1">
                        {t("contact.open_maps")} <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="glass-dark p-5">
                  <p className="text-brand-400 text-xs uppercase tracking-widest font-semibold mb-2">{t("contact.social_title")}</p>
                  <div className="space-y-3">
                    <a href="https://cricketinmadrid.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-brand-300 transition-colors text-sm">
                      <ExternalLink size={14} className="text-brand-400" />
                      cricketinmadrid.com
                    </a>
                    <a href="https://www.instagram.com/madridcricketclub" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-brand-300 transition-colors text-sm">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-brand-400"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                      @madridcricketclub
                    </a>
                    <a href="https://cricketinmadrid.com/index.php?format=feed&type=rss" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-brand-300 transition-colors text-sm">
                      <Calendar size={14} className="text-brand-400" />
                      {t("contact.calendar_rss")}
                    </a>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 px-4" style={{ background: "#120808" }}>
        <div className="container-wide max-w-xl">
          <div className="glass-dark p-6">
            <h3 className="text-white font-display font-bold mb-2">{t("contact.form_title")}</h3>
            <p className="text-slate-400 text-sm mb-4">{t("contact.form.coming_desc")}</p>
            <div className="space-y-3 opacity-50 pointer-events-none">
              <input className="input" type="text" placeholder={t("contact.form.name")} disabled />
              <input className="input" type="email" placeholder={t("contact.form.email")} disabled />
              <textarea className="input resize-none h-24" placeholder={t("contact.form.message")} disabled />
              <button className="btn-primary w-full" disabled>{t("contact.form.send")}</button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
