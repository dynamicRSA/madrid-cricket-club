"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Language = "en" | "es";

type Translations = Record<string, string>;

const en: Translations = {
  // Navbar
  "nav.home": "Home",
  "nav.fixtures": "Fixtures",
  "nav.results": "Results",
  "nav.news": "News",
  "nav.about": "About",
  "nav.join": "Join",
  "nav.contact": "Contact",
  "nav.signin": "Sign In",
  "nav.join_cta": "Join the Club",

  // Footer
  "footer.tagline": "Cricket in the heart of Spain since 2001. All nationalities, all abilities, all welcome.",
  "footer.nav_title": "Navigation",
  "footer.nav.fixtures": "Fixtures & Events",
  "footer.nav.results": "Results",
  "footer.nav.news": "News & Reports",
  "footer.nav.about": "About the Club",
  "footer.nav.join": "Join the Club",
  "footer.member_title": "Member Access",
  "footer.member.login": "Member Login",
  "footer.member.join": "Join the Club",
  "footer.member.privacy": "Privacy & GDPR Notice",
  "footer.member.cookies": "Cookie Preferences",
  "footer.member.note": "The member dashboard and committee panel are only accessible to registered members after signing in.",
  "footer.contact_title": "Get in Touch",
  "footer.president": "President",
  "footer.vice_president": "Vice President",
  "footer.copyright": "All rights reserved.",
  "footer.affiliated": "Affiliated to Cricket España · Est. 2001 · La Elipa, Madrid",

  // Home
  "home.hero.tag": "Est. 2001 · Cricket in Madrid",
  "home.hero.subtitle": "Playing, growing, and welcoming all since 2001. All nationalities, all abilities.",
  "home.hero.join": "Join the Club",
  "home.hero.fixtures": "View Fixtures",
  "home.result.label": "Latest Result",
  "home.result.won": "Won",
  "home.result.lost": "Lost",
  "home.fixtures_title": "Upcoming Fixtures",
  "home.fixtures_link": "View all fixtures",
  "home.about_title": "Who we are",
  "home.about.multicultural": "Multicultural Club",
  "home.about.multicultural_desc": "From England to India, Spain to South Africa, our dressing room reflects the world. All nationalities welcome.",
  "home.about.youth": "Junior & Youth",
  "home.about.youth_desc": "Weekly junior sessions at La Elipa. We invest in the next generation of cricketers in Madrid.",
  "home.about.competing": "Competing at ECCL",
  "home.about.competing_desc": "We travel to Alicante for the Spanish coastal league — 40-over and T20 cricket at a competitive level.",
  "home.results_title": "Recent Results",
  "home.results_link": "Full season results",
  "home.join_title": "Ready to play?",
  "home.join_subtitle": "Join as a member, get registered with Cricket España, and sign up for games and training.",
  "home.join_cta": "Join the Club",

  // Fixtures
  "fixtures.title": "Fixtures & Events",
  "fixtures.season": "Season 2026",
  "fixtures.desc": "Matches, training sessions, and tournaments.",
  "fixtures.ground.madrid": "Madrid (Training)",
  "fixtures.ground.coastal": "Coastal League",
  "fixtures.ecs.coming": "Coming Soon",
  "fixtures.ecs.desc": "MCC host a T10 tournament in Madrid. All games live on ECN.",
  "fixtures.type.match": "Match",
  "fixtures.type.training": "Training",
  "fixtures.type.tournament": "Tournament",
  "fixtures.type.junior": "Junior",
  "fixtures.members_only": "Registered members only.",
  "fixtures.members_only_link": "Join the club",
  "fixtures.members_only_suffix": "to attend training.",
  "fixtures.info.training_title": "Training sessions are for registered members only",
  "fixtures.info.training_desc": "Net practice and all club training is open to paid-up MCC members. If you want to get involved,",
  "fixtures.info.join_link": "join the club",
  "fixtures.info.or": "or",
  "fixtures.info.contact_link": "get in touch",
  "fixtures.info.contact_suffix": "first.",
  "fixtures.info.updates": "For the latest fixture updates and cancellations, check",
  "fixtures.info.follow": "or follow",

  // Results
  "results.title": "Season Results",
  "results.season": "Season 2026",
  "results.desc": "ECCL 40-over and T20 league results. Updated after each match.",
  "results.won": "Won",
  "results.lost": "Lost",
  "results.more_note": "More results will be added as the season progresses.",

  // About
  "about.tag": "Est. 2001",
  "about.hero_sub": "Cricket in the heart of Spain, celebrating 25 years in 2026",
  "about.stat.founded": "Founded",
  "about.stat.members": "Members",
  "about.stat.teams": "Teams",
  "about.stat.base": "Madrid Base",
  "about.stat.teams_val": "Men, Women & Juniors",
  "about.story_tag": "Our Story",
  "about.story_title": "A Club With Deep Roots",
  "about.venues_tag": "Our Venues",
  "about.venues_title": "Where We Play",
  "about.getinvolved_tag": "Get Involved",
  "about.getinvolved_title": "Everyone is Welcome",
  "about.getinvolved_desc": "All abilities welcome, senior, women's, and junior. To join training sessions and games, you first need to be a registered member. Apply online, pay your membership fee, and once registered with Cricket España you will receive your login and can sign up for matches and net sessions.",
  "about.join_cta": "Join the Club",
  "about.contact_cta": "Contact Us",

  // Join
  "join.title": "Join Madrid Cricket Club",
  "join.tag": "Membership 2026",
  "join.hero_sub": "Complete your application, pay your membership fee, and get registered with Cricket España. Once confirmed, you receive your member login to sign up for games and training.",
  "join.how_title": "How it works",
  "join.step1": "Fill in the application form below",
  "join.step2": "Committee reviews your details and confirms eligibility",
  "join.step3": "Pay your membership fee",
  "join.step4": "Submit all details required for Cricket España registration",
  "join.step5": "Registration confirmed — you receive your member login",
  "join.step6": "Sign up for fixtures and nets sessions through your dashboard",
  "join.form_title": "Membership Application",
  "join.form.name": "Full Name",
  "join.form.email": "Email Address",
  "join.form.phone": "Phone Number",
  "join.form.dob": "Date of Birth",
  "join.form.nationality": "Nationality",
  "join.form.role": "Playing Role",
  "join.form.experience": "Cricket Experience",
  "join.form.experience_ph": "e.g. Club cricket in England, beginner...",
  "join.form.heard": "How did you hear about us?",
  "join.form.heard_ph": "e.g. Instagram, Google, a friend...",
  "join.form.notes": "Anything else?",
  "join.form.notes_ph": "Anything else you would like us to know?",
  "join.form.submit": "Send Application",
  "join.form.submitting": "Sending...",
  "join.success_title": "Application received!",
  "join.success_desc": "Thank you for applying to join MCC. The committee will review your application and be in touch within a few days.",
  "join.fees_title": "Membership Fees 2026",

  // Contact
  "contact.title": "Contact Us",
  "contact.tag": "Get in Touch",
  "contact.desc": "Whether you want to join, have questions about training, or just want to know more, we would love to hear from you.",
  "contact.committee_title": "Committee Contacts",
  "contact.training_title": "Training",
  "contact.training_madrid": "Madrid — La Elipa (Sundays)",
  "contact.training_coastal": "Coastal fixtures — Alicante area",
  "contact.social_title": "Follow Us",
  "contact.form_title": "Send a Message",
  "contact.form.coming": "Contact form coming soon",

  // Auth
  "auth.signin_title": "Sign In",
  "auth.signin_subtitle": "Member portal",
  "auth.email": "Email address",
  "auth.password": "Password",
  "auth.signin_btn": "Sign In",
  "auth.no_account": "Not a member yet?",
  "auth.join_link": "Apply to join",
  "auth.forgot": "Forgot password?",

  // Common
  "common.loading": "Loading...",
  "common.read_more": "Read more",
  "common.view_all": "View all",
  "common.members_only": "Members only",
};

const es: Translations = {
  // Navbar
  "nav.home": "Inicio",
  "nav.fixtures": "Partidos",
  "nav.results": "Resultados",
  "nav.news": "Noticias",
  "nav.about": "El Club",
  "nav.join": "Únete",
  "nav.contact": "Contacto",
  "nav.signin": "Iniciar sesión",
  "nav.join_cta": "Únete al Club",

  // Footer
  "footer.tagline": "Cricket en el corazón de España desde 2001. Todas las nacionalidades, todos los niveles, todos bienvenidos.",
  "footer.nav_title": "Navegación",
  "footer.nav.fixtures": "Partidos y Eventos",
  "footer.nav.results": "Resultados",
  "footer.nav.news": "Noticias e Informes",
  "footer.nav.about": "Sobre el Club",
  "footer.nav.join": "Únete al Club",
  "footer.member_title": "Área de Socios",
  "footer.member.login": "Acceso de Socios",
  "footer.member.join": "Únete al Club",
  "footer.member.privacy": "Aviso de Privacidad y RGPD",
  "footer.member.cookies": "Preferencias de Cookies",
  "footer.member.note": "El panel de socios y el panel del comité solo son accesibles para socios registrados tras iniciar sesión.",
  "footer.contact_title": "Contacto",
  "footer.president": "Presidente",
  "footer.vice_president": "Vicepresidente",
  "footer.copyright": "Todos los derechos reservados.",
  "footer.affiliated": "Afiliado a Cricket España · Est. 2001 · La Elipa, Madrid",

  // Home
  "home.hero.tag": "Est. 2001 · Cricket en Madrid",
  "home.hero.subtitle": "Jugando, creciendo y dando la bienvenida a todos desde 2001. Todas las nacionalidades, todos los niveles.",
  "home.hero.join": "Únete al Club",
  "home.hero.fixtures": "Ver Partidos",
  "home.result.label": "Último Resultado",
  "home.result.won": "Victoria",
  "home.result.lost": "Derrota",
  "home.fixtures_title": "Próximos Partidos",
  "home.fixtures_link": "Ver todos los partidos",
  "home.about_title": "Quiénes somos",
  "home.about.multicultural": "Club Multicultural",
  "home.about.multicultural_desc": "Desde Inglaterra hasta India, España hasta Sudáfrica, nuestro vestuario refleja el mundo. Todas las nacionalidades bienvenidas.",
  "home.about.youth": "Categoría Juvenil",
  "home.about.youth_desc": "Sesiones juveniles semanales en La Elipa. Invertimos en la próxima generación de cricketers en Madrid.",
  "home.about.competing": "Compitiendo en la ECCL",
  "home.about.competing_desc": "Viajamos a Alicante para la liga costera española — cricket de 40 overs y T20 a nivel competitivo.",
  "home.results_title": "Resultados Recientes",
  "home.results_link": "Todos los resultados de la temporada",
  "home.join_title": "¿Listo para jugar?",
  "home.join_subtitle": "Únete como socio, regístrate en Cricket España y apúntate a partidos y entrenamientos.",
  "home.join_cta": "Únete al Club",

  // Fixtures
  "fixtures.title": "Partidos y Eventos",
  "fixtures.season": "Temporada 2026",
  "fixtures.desc": "Partidos, sesiones de entrenamiento y torneos.",
  "fixtures.ground.madrid": "Madrid (Entrenamiento)",
  "fixtures.ground.coastal": "Liga Costera",
  "fixtures.ecs.coming": "Próximamente",
  "fixtures.ecs.desc": "MCC acoge un torneo T10 en Madrid. Todos los partidos en directo en ECN.",
  "fixtures.type.match": "Partido",
  "fixtures.type.training": "Entrenamiento",
  "fixtures.type.tournament": "Torneo",
  "fixtures.type.junior": "Juvenil",
  "fixtures.members_only": "Solo para socios registrados.",
  "fixtures.members_only_link": "Únete al club",
  "fixtures.members_only_suffix": "para asistir al entrenamiento.",
  "fixtures.info.training_title": "Las sesiones de entrenamiento son solo para socios registrados",
  "fixtures.info.training_desc": "Los entrenamientos y toda la formación del club están abiertos a los socios de MCC al día de pago. Si quieres participar,",
  "fixtures.info.join_link": "únete al club",
  "fixtures.info.or": "o",
  "fixtures.info.contact_link": "ponte en contacto",
  "fixtures.info.contact_suffix": "primero.",
  "fixtures.info.updates": "Para las últimas actualizaciones y cancelaciones de partidos, consulta",
  "fixtures.info.follow": "o síguenos en",

  // Results
  "results.title": "Resultados de Temporada",
  "results.season": "Temporada 2026",
  "results.desc": "Resultados de la liga ECCL de 40 overs y T20. Se actualiza tras cada partido.",
  "results.won": "Victoria",
  "results.lost": "Derrota",
  "results.more_note": "Se añadirán más resultados a medida que avance la temporada.",

  // About
  "about.tag": "Est. 2001",
  "about.hero_sub": "Cricket en el corazón de España, celebrando 25 años en 2026",
  "about.stat.founded": "Fundado",
  "about.stat.members": "Socios",
  "about.stat.teams": "Equipos",
  "about.stat.base": "Base en Madrid",
  "about.stat.teams_val": "Hombres, Mujeres y Juveniles",
  "about.story_tag": "Nuestra Historia",
  "about.story_title": "Un Club con Raíces Profundas",
  "about.venues_tag": "Nuestros Campos",
  "about.venues_title": "Dónde Jugamos",
  "about.getinvolved_tag": "Participa",
  "about.getinvolved_title": "Todos son Bienvenidos",
  "about.getinvolved_desc": "Todos los niveles son bienvenidos, sénior, femenino y juvenil. Para participar en entrenamientos y partidos, primero debes ser socio registrado. Solicítalo online, paga tu cuota y, una vez registrado en Cricket España, recibirás tu acceso para apuntarte a partidos y sesiones de entrenamiento.",
  "about.join_cta": "Únete al Club",
  "about.contact_cta": "Contáctanos",

  // Join
  "join.title": "Únete al Madrid Cricket Club",
  "join.tag": "Membresía 2026",
  "join.hero_sub": "Completa tu solicitud, paga tu cuota y regístrate en Cricket España. Una vez confirmado, recibes tu acceso de socio para apuntarte a partidos y entrenamientos.",
  "join.how_title": "Cómo funciona",
  "join.step1": "Rellena el formulario de solicitud a continuación",
  "join.step2": "El comité revisa tus datos y confirma la elegibilidad",
  "join.step3": "Paga tu cuota de socio",
  "join.step4": "Envía todos los datos necesarios para el registro en Cricket España",
  "join.step5": "Registro confirmado — recibes tu acceso de socio",
  "join.step6": "Apúntate a partidos y entrenamientos a través de tu panel de control",
  "join.form_title": "Solicitud de Membresía",
  "join.form.name": "Nombre completo",
  "join.form.email": "Correo electrónico",
  "join.form.phone": "Número de teléfono",
  "join.form.dob": "Fecha de nacimiento",
  "join.form.nationality": "Nacionalidad",
  "join.form.role": "Posición de juego",
  "join.form.experience": "Experiencia en cricket",
  "join.form.experience_ph": "p.ej. Cricket de club en Inglaterra, principiante...",
  "join.form.heard": "¿Cómo nos conociste?",
  "join.form.heard_ph": "p.ej. Instagram, Google, un amigo...",
  "join.form.notes": "¿Algo más?",
  "join.form.notes_ph": "¿Algo más que quieras que sepamos?",
  "join.form.submit": "Enviar Solicitud",
  "join.form.submitting": "Enviando...",
  "join.success_title": "¡Solicitud recibida!",
  "join.success_desc": "Gracias por solicitar unirte al MCC. El comité revisará tu solicitud y se pondrá en contacto en unos días.",
  "join.fees_title": "Cuotas de Membresía 2026",

  // Contact
  "contact.title": "Contáctanos",
  "contact.tag": "Ponerse en Contacto",
  "contact.desc": "Tanto si quieres unirte, tienes preguntas sobre el entrenamiento, o simplemente quieres saber más, nos encantaría saber de ti.",
  "contact.committee_title": "Contactos del Comité",
  "contact.training_title": "Entrenamiento",
  "contact.training_madrid": "Madrid — La Elipa (domingos)",
  "contact.training_coastal": "Partidos costeros — zona de Alicante",
  "contact.social_title": "Síguenos",
  "contact.form_title": "Enviar un Mensaje",
  "contact.form.coming": "Formulario de contacto próximamente",

  // Auth
  "auth.signin_title": "Iniciar Sesión",
  "auth.signin_subtitle": "Portal de socios",
  "auth.email": "Correo electrónico",
  "auth.password": "Contraseña",
  "auth.signin_btn": "Iniciar Sesión",
  "auth.no_account": "¿Aún no eres socio?",
  "auth.join_link": "Solicitar unirse",
  "auth.forgot": "¿Olvidaste tu contraseña?",

  // Common
  "common.loading": "Cargando...",
  "common.read_more": "Leer más",
  "common.view_all": "Ver todo",
  "common.members_only": "Solo socios",
};

// ─── Context ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "mcc_lang";

interface LanguageContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (stored === "en" || stored === "es") {
        setLangState(stored);
        document.documentElement.lang = stored;
      }
    } catch { /* ignore */ }
  }, []);

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
      document.documentElement.lang = l;
    } catch { /* ignore */ }
  }, []);

  const t = useCallback((key: string): string => {
    const dict = lang === "es" ? es : en;
    return dict[key] ?? en[key] ?? key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
