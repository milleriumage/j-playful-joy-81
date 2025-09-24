import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';

type Language = 'pt' | 'en' | 'es' | 'it' | 'fr' | 'de' | 'nl' | 'sv' | 'no';

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

const translations: Translations = {
  // Landing Page Translations
  'landing.title': {
    pt: 'Social Link',
    en: 'Social Link',
    es: 'Social Link',
    it: 'Social Link',
    fr: 'Social Link',
    de: 'Social Link',
    nl: 'Social Link',
    sv: 'Social Link',
    no: 'Social Link'
  },
  'landing.subtitle': {
    pt: 'A nova vitrine digital com chat integrado',
    en: 'The new digital showcase with integrated chat',
    es: 'La nueva vitrina digital con chat integrado',
    it: 'La nuova vetrina digitale con chat integrata',
    fr: 'La nouvelle vitrine numérique avec chat intégré',
    de: 'Das neue digitale Schaufenster mit integriertem Chat',
    nl: 'De nieuwe digitale etalage met geïntegreerde chat',
    sv: 'Det nya digitala skyltfönstret med integrerad chat',
    no: 'Det nye digitale utstillingsvinduet med integrert chat'
  },
  'landing.description': {
    pt: 'Transforme o tradicional "link na bio" em uma vitrine interativa. Exiba conteúdos, receba pagamentos e converse com seus fãs em tempo real.',
    en: 'Transform the traditional "link in bio" into an interactive showcase. Display content, receive payments and chat with your fans in real time.',
    es: 'Transforma el tradicional "link en bio" en una vitrina interactiva. Muestra contenido, recibe pagos y conversa con tus fans en tiempo real.',
    it: 'Trasforma il tradizionale "link in bio" in una vetrina interattiva. Mostra contenuti, ricevi pagamenti e chatta con i tuoi fan in tempo reale.',
    fr: 'Transformez le traditionnel "lien en bio" en une vitrine interactive. Affichez du contenu, recevez des paiements et discutez avec vos fans en temps réel.',
    de: 'Verwandeln Sie den traditionellen "Link in der Bio" in ein interaktives Schaufenster. Zeigen Sie Inhalte, erhalten Sie Zahlungen und chatten Sie in Echtzeit mit Ihren Fans.',
    nl: 'Transformeer de traditionele "link in bio" naar een interactieve etalage. Toon inhoud, ontvang betalingen en chat in realtime met je fans.',
    sv: 'Förvandla den traditionella "länken i bio" till ett interaktivt skyltfönster. Visa innehåll, ta emot betalningar och chatta med dina fans i realtid.',
    no: 'Transformer den tradisjonelle "lenke i bio" til et interaktivt utstillingsvindu. Vis innhold, motta betalinger og chat med fansene dine i sanntid.'
  },
  'landing.features.title': {
    pt: '🔑 Principais diferenciais',
    en: '🔑 Key differentials',
    es: '🔑 Principales diferenciales',
    it: '🔑 Principali differenze',
    fr: '🔑 Principales différences',
    de: '🔑 Hauptunterschiede',
    nl: '🔑 Belangrijkste verschillen',
    sv: '🔑 Viktiga skillnader',
    no: '🔑 Viktige forskjeller'
  },
  'landing.features.subtitle': {
    pt: 'Muito mais que um simples "link na bio"',
    en: 'Much more than a simple "link in bio"',
    es: 'Mucho más que un simple "link en bio"',
    it: 'Molto più di un semplice "link in bio"',
    fr: 'Bien plus qu\'un simple "lien en bio"',
    de: 'Viel mehr als ein einfacher "Link in der Bio"',
    nl: 'Veel meer dan een simpele "link in bio"',
    sv: 'Mycket mer än en enkel "länk i bio"',
    no: 'Mye mer enn en enkel "lenke i bio"'
  },
  'landing.feature.chat.title': {
    pt: 'Chat integrado',
    en: 'Integrated chat',
    es: 'Chat integrado',
    it: 'Chat integrata',
    fr: 'Chat intégré',
    de: 'Integrierter Chat',
    nl: 'Geïntegreerde chat',
    sv: 'Integrerad chat',
    no: 'Integrert chat'
  },
  'landing.feature.chat.description': {
    pt: 'Seus fãs não só clicam — eles conversam com você. Essa interação direta gera confiança e engajamento imediato.',
    en: 'Your fans don\'t just click — they talk to you. This direct interaction generates trust and immediate engagement.',
    es: 'Tus fans no solo hacen clic — conversan contigo. Esta interacción directa genera confianza y engagement inmediato.',
    it: 'I tuoi fan non si limitano a cliccare — parlano con te. Questa interazione diretta genera fiducia e coinvolgimento immediato.',
    fr: 'Vos fans ne font pas que cliquer — ils vous parlent. Cette interaction directe génère confiance et engagement immédiat.',
    de: 'Ihre Fans klicken nicht nur — sie sprechen mit Ihnen. Diese direkte Interaktion schafft Vertrauen und sofortiges Engagement.',
    nl: 'Je fans klikken niet alleen — ze praten met je. Deze directe interactie genereert vertrouwen en onmiddellijke betrokkenheid.',
    sv: 'Dina fans klickar inte bara — de pratar med dig. Denna direkta interaktion skapar förtroende och omedelbar engagemang.',
    no: 'Fansene dine klikker ikke bare — de snakker med deg. Denne direkte interaksjonen skaper tillit og umiddelbar engasjement.'
  },
  'landing.feature.payment.title': {
    pt: 'Links de pagamento',
    en: 'Payment links',
    es: 'Enlaces de pago',
    it: 'Link di pagamento',
    fr: 'Liens de paiement',
    de: 'Zahlungslinks',
    nl: 'Betalingslinks',
    sv: 'Betalningslänkar',
    no: 'Betalingslenker'
  },
  'landing.feature.payment.description': {
    pt: 'Adicione botões de compra e receba pagamentos de forma simples e rápida.',
    en: 'Add purchase buttons and receive payments simply and quickly.',
    es: 'Añade botones de compra y recibe pagos de forma simple y rápida.',
    it: 'Aggiungi pulsanti di acquisto e ricevi pagamenti in modo semplice e veloce.',
    fr: 'Ajoutez des boutons d\'achat et recevez des paiements de manière simple et rapide.',
    de: 'Fügen Sie Kaufschaltflächen hinzu und erhalten Sie Zahlungen einfach und schnell.',
    nl: 'Voeg aankoopknoppen toe en ontvang betalingen eenvoudig en snel.',
    sv: 'Lägg till köpknappar och ta emot betalningar enkelt och snabbt.',
    no: 'Legg til kjøpsknapper og motta betalinger enkelt og raskt.'
  },
  'landing.demo': {
    pt: 'Ver Demonstração',
    en: 'View Demo',
    es: 'Ver Demostración',
    it: 'Vedi Demo',
    fr: 'Voir Démo',
    de: 'Demo Ansehen',
    nl: 'Bekijk Demo',
    sv: 'Se Demo',
    no: 'Se Demo'
  },
  'landing.cta.createAccount': {
    pt: 'Criar Conta Grátis',
    en: 'Create Free Account',
    es: 'Crear Cuenta Gratis',
    it: 'Crea Account Gratuito',
    fr: 'Créer un Compte Gratuit',
    de: 'Kostenloses Konto Erstellen',
    nl: 'Gratis Account Aanmaken',
    sv: 'Skapa Gratis Konto',
    no: 'Opprett Gratis Konto'
  },
  // Auth Dialog
  'auth.welcome': {
    pt: 'Bem-vindo!',
    en: 'Welcome!',
    es: '¡Bienvenido!',
    it: 'Benvenuto!',
    fr: 'Bienvenue!',
    de: 'Willkommen!',
    nl: 'Welkom!',
    sv: 'Välkommen!',
    no: 'Velkommen!'
  },
  'auth.createAccountMessage': {
    pt: 'Crie sua conta para começar',
    en: 'Create your account to get started',
    es: 'Crea tu cuenta para empezar',
    it: 'Crea il tuo account per iniziare',
    fr: 'Créez votre compte pour commencer',
    de: 'Erstellen Sie Ihr Konto, um loszulegen',
    nl: 'Maak je account aan om te beginnen',
    sv: 'Skapa ditt konto för att komma igång',
    no: 'Opprett din konto for å komme i gang'
  },
  'auth.loginMessage': {
    pt: 'Faça login para continuar',
    en: 'Log in to continue',
    es: 'Inicia sesión para continuar',
    it: 'Accedi per continuare',
    fr: 'Connectez-vous pour continuer',
    de: 'Melden Sie sich an, um fortzufahren',
    nl: 'Log in om door te gaan',
    sv: 'Logga in för att fortsätta',
    no: 'Logg inn for å fortsette'
  },
  'auth.emailPlaceholder': {
    pt: 'Seu e-mail',
    en: 'Your email',
    es: 'Tu email',
    it: 'La tua email',
    fr: 'Votre email',
    de: 'Ihre E-Mail',
    nl: 'Je email',
    sv: 'Din email',
    no: 'Din e-post'
  },
  'auth.passwordPlaceholder': {
    pt: 'Sua senha',
    en: 'Your password',
    es: 'Tu contraseña',
    it: 'La tua password',
    fr: 'Votre mot de passe',
    de: 'Ihr Passwort',
    nl: 'Je wachtwoord',
    sv: 'Ditt lösenord',
    no: 'Ditt passord'
  },
  'auth.confirmPasswordPlaceholder': {
    pt: 'Confirme sua senha',
    en: 'Confirm your password',
    es: 'Confirma tu contraseña',
    it: 'Conferma la tua password',
    fr: 'Confirmez votre mot de passe',
    de: 'Bestätigen Sie Ihr Passwort',
    nl: 'Bevestig je wachtwoord',
    sv: 'Bekräfta ditt lösenord',
    no: 'Bekreft ditt passord'
  },
  'auth.processing': {
    pt: 'Processando...',
    en: 'Processing...',
    es: 'Procesando...',
    it: 'Elaborazione...',
    fr: 'Traitement...',
    de: 'Verarbeitung...',
    nl: 'Verwerking...',
    sv: 'Bearbetar...',
    no: 'Behandler...'
  },
  'auth.createAccount': {
    pt: 'Criar Conta',
    en: 'Create Account',
    es: 'Crear Cuenta',
    it: 'Crea Account',
    fr: 'Créer un Compte',
    de: 'Konto Erstellen',
    nl: 'Account Aanmaken',
    sv: 'Skapa Konto',
    no: 'Opprett Konto'
  },
  'auth.signIn': {
    pt: 'Entrar',
    en: 'Sign In',
    es: 'Iniciar Sesión',
    it: 'Accedi',
    fr: 'Se Connecter',
    de: 'Anmelden',
    nl: 'Inloggen',
    sv: 'Logga In',
    no: 'Logg Inn'
  },
  'auth.or': {
    pt: 'ou',
    en: 'or',
    es: 'o',
    it: 'o',
    fr: 'ou',
    de: 'oder',
    nl: 'of',
    sv: 'eller',
    no: 'eller'
  },
  'auth.withGoogle': {
    pt: 'com Google',
    en: 'with Google',
    es: 'con Google',
    it: 'con Google',
    fr: 'avec Google',
    de: 'mit Google',
    nl: 'met Google',
    sv: 'med Google',
    no: 'med Google'
  },
  'auth.signingIn': {
    pt: 'Entrando...',
    en: 'Signing in...',
    es: 'Iniciando sesión...',
    it: 'Accesso...',
    fr: 'Connexion...',
    de: 'Anmeldung...',
    nl: 'Inloggen...',
    sv: 'Loggar in...',
    no: 'Logger inn...'
  },
  'auth.alreadyHaveAccount': {
    pt: 'Já tem uma conta?',
    en: 'Already have an account?',
    es: '¿Ya tienes una cuenta?',
    it: 'Hai già un account?',
    fr: 'Vous avez déjà un compte?',
    de: 'Haben Sie bereits ein Konto?',
    nl: 'Heb je al een account?',
    sv: 'Har du redan ett konto?',
    no: 'Har du allerede en konto?'
  },
  'auth.noAccount': {
    pt: 'Não tem uma conta?',
    en: 'Don\'t have an account?',
    es: '¿No tienes una cuenta?',
    it: 'Non hai un account?',
    fr: 'Vous n\'avez pas de compte?',
    de: 'Haben Sie kein Konto?',
    nl: 'Heb je geen account?',
    sv: 'Har du inget konto?',
    no: 'Har du ikke en konto?'
  },
  'auth.forgotPassword': {
    pt: 'Esqueceu a senha?',
    en: 'Forgot password?',
    es: '¿Olvidaste la contraseña?',
    it: 'Hai dimenticato la password?',
    fr: 'Mot de passe oublié?',
    de: 'Passwort vergessen?',
    nl: 'Wachtwoord vergeten?',
    sv: 'Glömt lösenord?',
    no: 'Glemt passord?'
  },
  // Main interface
  'main.defaultButtonText': {
    pt: 'get cake 🍰',
    en: 'get cake 🍰',
    es: 'obtener pastel 🍰',
    it: 'prendi torta 🍰',
    fr: 'obtenir gâteau 🍰',
    de: 'Kuchen holen 🍰',
    nl: 'taart krijgen 🍰',
    sv: 'få tårta 🍰',
    no: 'få kake 🍰'
  },
  // IPage specific translations
  'ipage.landingTitle': {
    pt: 'Social Link',
    en: 'Social Link',
    es: 'Social Link',
    it: 'Social Link',
    fr: 'Social Link',
    de: 'Social Link',
    nl: 'Social Link',
    sv: 'Social Link',
    no: 'Social Link'
  },
  'ipage.landingSubtitle': {
    pt: 'A nova vitrine digital com chat integrado',
    en: 'The new digital showcase with integrated chat',
    es: 'La nueva vitrina digital con chat integrado',
    it: 'La nuova vetrina digitale con chat integrata',
    fr: 'La nouvelle vitrine numérique avec chat intégré',
    de: 'Das neue digitale Schaufenster mit integriertem Chat',
    nl: 'De nieuwe digitale etalage met geïntegreerde chat',
    sv: 'Det nya digitala skyltfönstret med integrerad chat',
    no: 'Det nye digitale utstillingsvinduet med integrert chat'
  },
  'ipage.featuresTitle': {
    pt: '🔑 Principais diferenciais',
    en: '🔑 Key differentials',
    es: '🔑 Principales diferenciales',
    it: '🔑 Principali differenze',
    fr: '🔑 Principales différences',
    de: '🔑 Hauptunterschiede',
    nl: '🔑 Belangrijkste verschillen',
    sv: '🔑 Viktiga skillnader',
    no: '🔑 Viktige forskjeller'
  },
  'ipage.feature1Title': {
    pt: 'Chat integrado',
    en: 'Integrated chat',
    es: 'Chat integrado',
    it: 'Chat integrata',
    fr: 'Chat intégré',
    de: 'Integrierter Chat',
    nl: 'Geïntegreerde chat',
    sv: 'Integrerad chat',
    no: 'Integrert chat'
  },
  'ipage.feature1Description': {
    pt: 'Seus fãs não só clicam — eles conversam com você.',
    en: 'Your fans don\'t just click — they talk to you.',
    es: 'Tus fans no solo hacen clic — conversan contigo.',
    it: 'I tuoi fan non si limitano a cliccare — parlano con te.',
    fr: 'Vos fans ne font pas que cliquer — ils vous parlent.',
    de: 'Ihre Fans klicken nicht nur — sie sprechen mit Ihnen.',
    nl: 'Je fans klikken niet alleen — ze praten met je.',
    sv: 'Dina fans klickar inte bara — de pratar med dig.',
    no: 'Fansene dine klikker ikke bare — de snakker med deg.'
  },
  'ipage.feature2Title': {
    pt: 'Links de pagamento',
    en: 'Payment links',
    es: 'Enlaces de pago',
    it: 'Link di pagamento',
    fr: 'Liens de paiement',
    de: 'Zahlungslinks',
    nl: 'Betalingslinks',
    sv: 'Betalningslänkar',
    no: 'Betalingslenker'
  },
  'ipage.feature2Description': {
    pt: 'Receba pagamentos de forma simples e rápida.',
    en: 'Receive payments simply and quickly.',
    es: 'Recibe pagos de forma simple y rápida.',
    it: 'Ricevi pagamenti in modo semplice e veloce.',
    fr: 'Recevez des paiements de manière simple et rapide.',
    de: 'Erhalten Sie Zahlungen einfach und schnell.',
    nl: 'Ontvang betalingen eenvoudig en snel.',
    sv: 'Ta emot betalningar enkelt och snabbt.',
    no: 'Motta betalinger enkelt og raskt.'
  },
  'ipage.feature3Title': {
    pt: 'Vitrine interativa',
    en: 'Interactive showcase',
    es: 'Vitrina interactiva',
    it: 'Vetrina interattiva',
    fr: 'Vitrine interactive',
    de: 'Interaktives Schaufenster',
    nl: 'Interactieve etalage',
    sv: 'Interaktivt skyltfönster',
    no: 'Interaktivt utstillingsvindu'
  },
  'ipage.feature3Description': {
    pt: 'Muito mais que um simples "link na bio".',
    en: 'Much more than a simple "link in bio".',
    es: 'Mucho más que un simple "link en bio".',
    it: 'Molto più di un semplice "link in bio".',
    fr: 'Bien plus qu\'un simple "lien en bio".',
    de: 'Viel mehr als ein einfacher "Link in der Bio".',
    nl: 'Veel meer dan een simpele "link in bio".',
    sv: 'Mycket mer än en enkel "länk i bio".',
    no: 'Mye mer enn en enkel "lenke i bio".'
  },
  'ipage.testimonialsTitle': {
    pt: '💬 O que nossos usuários dizem',
    en: '💬 What our users say',
    es: '💬 Lo que dicen nuestros usuarios',
    it: '💬 Cosa dicono i nostri utenti',
    fr: '💬 Ce que disent nos utilisateurs',
    de: '💬 Was unsere Nutzer sagen',
    nl: '💬 Wat onze gebruikers zeggen',
    sv: '💬 Vad våra användare säger',
    no: '💬 Hva våre brukere sier'
  },
  'ipage.testimonial1': {
    pt: '"Minha renda dobrou desde que comecei a usar o Social Link!"',
    en: '"My income doubled since I started using Social Link!"',
    es: '"¡Mis ingresos se duplicaron desde que empecé a usar Social Link!"',
    it: '"Il mio reddito è raddoppiato da quando ho iniziato a usare Social Link!"',
    fr: '"Mes revenus ont doublé depuis que j\'ai commencé à utiliser Social Link!"',
    de: '"Mein Einkommen hat sich verdoppelt, seit ich Social Link verwende!"',
    nl: '"Mijn inkomen is verdubbeld sinds ik Social Link ben gaan gebruiken!"',
    sv: '"Min inkomst har dubblats sedan jag började använda Social Link!"',
    no: '"Inntekten min har doblet seg siden jeg begynte å bruke Social Link!"'
  },
  'ipage.testimonial2': {
    pt: '"Finalmente posso conversar diretamente com meus seguidores!"',
    en: '"Finally I can talk directly with my followers!"',
    es: '"¡Finalmente puedo hablar directamente con mis seguidores!"',
    it: '"Finalmente posso parlare direttamente con i miei follower!"',
    fr: '"Enfin je peux parler directement avec mes abonnés!"',
    de: '"Endlich kann ich direkt mit meinen Followern sprechen!"',
    nl: '"Eindelijk kan ik direct praten met mijn volgers!"',
    sv: '"Äntligen kan jag prata direkt med mina följare!"',
    no: '"Endelig kan jeg snakke direkte med mine følgere!"'
  },
  'ipage.ctaTitle': {
    pt: '🚀 Comece agora mesmo!',
    en: '🚀 Start right now!',
    es: '🚀 ¡Comienza ahora mismo!',
    it: '🚀 Inizia subito!',
    fr: '🚀 Commencez maintenant!',
    de: '🚀 Jetzt starten!',
    nl: '🚀 Begin nu meteen!',
    sv: '🚀 Börja nu!',
    no: '🚀 Begynn nå!'
  },
  'ipage.ctaDescription': {
    pt: 'Junte-se a milhares de criadores que já transformaram seus perfis',
    en: 'Join thousands of creators who have already transformed their profiles',
    es: 'Únete a miles de creadores que ya han transformado sus perfiles',
    it: 'Unisciti a migliaia di creatori che hanno già trasformato i loro profili',
    fr: 'Rejoignez des milliers de créateurs qui ont déjà transformé leurs profils',
    de: 'Schließen Sie sich Tausenden von Kreativen an, die ihre Profile bereits transformiert haben',
    nl: 'Sluit je aan bij duizenden makers die hun profielen al hebben getransformeerd',
    sv: 'Gå med tusentals skapare som redan har förvandlat sina profiler',
    no: 'Bli med tusenvis av skapere som allerede har transformert profilene sine'
  },
  // Additional IPage sections
  'ipage.exampleTitle': {
    pt: '💬 Exemplo real',
    en: '💬 Real example',
    es: '💬 Ejemplo real',
    it: '💬 Esempio reale',
    fr: '💬 Exemple réel',
    de: '💬 Echtes Beispiel',
    nl: '💬 Echt voorbeeld',
    sv: '💬 Verkligt exempel',
    no: '💬 Virkelig eksempel'
  },
  'ipage.exampleText': {
    pt: '"Com o Social Link consegui ter um chat direto com minha audiência. Eles não apenas compram, mas também conversam comigo sobre os produtos. Isso criou uma conexão muito mais forte e minhas vendas aumentaram 150%!"',
    en: '"With Social Link I managed to have direct chat with my audience. They don\'t just buy, but also talk to me about the products. This created a much stronger connection and my sales increased by 150%!"',
    es: '"¡Con Social Link logré tener un chat directo con mi audiencia. No solo compran, sino que también conversan conmigo sobre los productos. Esto creó una conexión mucho más fuerte y mis ventas aumentaron 150%!"',
    it: '"Con Social Link sono riuscito ad avere una chat diretta con il mio pubblico. Non si limitano ad acquistare, ma mi parlano anche dei prodotti. Questo ha creato una connessione molto più forte e le mie vendite sono aumentate del 150%!"',
    fr: '"Avec Social Link j\'ai réussi à avoir un chat direct avec mon audience. Ils n\'achètent pas seulement, mais me parlent aussi des produits. Cela a créé une connexion beaucoup plus forte et mes ventes ont augmenté de 150%!"',
    de: '"Mit Social Link konnte ich direkten Chat mit meinem Publikum haben. Sie kaufen nicht nur, sondern sprechen auch mit mir über die Produkte. Das schuf eine viel stärkere Verbindung und meine Verkäufe stiegen um 150%!"',
    nl: '"Met Social Link slaagde ik erin directe chat te hebben met mijn publiek. Ze kopen niet alleen, maar praten ook met me over de producten. Dit creëerde een veel sterkere verbinding en mijn verkopen stegen met 150%!"',
    sv: '"Med Social Link lyckades jag ha direkt chat med min publik. De köper inte bara, utan pratar också med mig om produkterna. Detta skapade en mycket starkare koppling och min försäljning ökade med 150%!"',
    no: '"Med Social Link klarte jeg å ha direkte chat med publikum mitt. De kjøper ikke bare, men snakker også med meg om produktene. Dette skapte en mye sterkere forbindelse og salget mitt økte med 150%!"'
  },
  'ipage.testimonialQuote': {
    pt: 'A melhor decisão que tomei para meu negócio digital foi usar o Social Link.',
    en: 'The best decision I made for my digital business was using Social Link.',
    es: 'La mejor decisión que tomé para mi negocio digital fue usar Social Link.',
    it: 'La migliore decisione che ho preso per il mio business digitale è stata usare Social Link.',
    fr: 'La meilleure décision que j\'ai prise pour mon entreprise numérique a été d\'utiliser Social Link.',
    de: 'Die beste Entscheidung, die ich für mein digitales Geschäft getroffen habe, war Social Link zu verwenden.',
    nl: 'De beste beslissing die ik nam voor mijn digitale bedrijf was Social Link gebruiken.',
    sv: 'Det bästa beslutet jag tog för min digitala verksamhet var att använda Social Link.',
    no: 'Den beste beslutningen jeg tok for min digitale virksomhet var å bruke Social Link.'
  },
  'ipage.testimonialAuthor': {
    pt: '— Ana Silva, Criadora de Conteúdo',
    en: '— Ana Silva, Content Creator',
    es: '— Ana Silva, Creadora de Contenido',
    it: '— Ana Silva, Creatrice di Contenuti',
    fr: '— Ana Silva, Créatrice de Contenu',
    de: '— Ana Silva, Content Creator',
    nl: '— Ana Silva, Content Creator',
    sv: '— Ana Silva, Innehållsskapare',
    no: '— Ana Silva, Innholdsskaper'
  },
  'ipage.whyChooseTitle': {
    pt: '🚀 Porque escolher Social Link',
    en: '🚀 Why choose Social Link',
    es: '🚀 Por qué elegir Social Link',
    it: '🚀 Perché scegliere Social Link',
    fr: '🚀 Pourquoi choisir Social Link',
    de: '🚀 Warum Social Link wählen',
    nl: '🚀 Waarom Social Link kiezen',
    sv: '🚀 Varför välja Social Link',
    no: '🚀 Hvorfor velge Social Link'
  },
  'ipage.showcase1': {
    pt: 'Links únicos',
    en: 'Unique links',
    es: 'Enlaces únicos',
    it: 'Link unici',
    fr: 'Liens uniques',
    de: 'Einzigartige Links',
    nl: 'Unieke links',
    sv: 'Unika länkar',
    no: 'Unike lenker'
  },
  'ipage.showcase1Desc': {
    pt: 'Cada link é personalizado para sua marca e audiência.',
    en: 'Each link is customized for your brand and audience.',
    es: 'Cada enlace está personalizado para tu marca y audiencia.',
    it: 'Ogni link è personalizzato per il tuo brand e pubblico.',
    fr: 'Chaque lien est personnalisé pour votre marque et audience.',
    de: 'Jeder Link ist für Ihre Marke und Zielgruppe angepasst.',
    nl: 'Elke link is aangepast voor je merk en publiek.',
    sv: 'Varje länk är anpassad för ditt varumärke och din publik.',
    no: 'Hver lenke er tilpasset for ditt merke og publikum.'
  },
  'ipage.showcase2': {
    pt: 'Chat integrado',
    en: 'Integrated chat',
    es: 'Chat integrado',
    it: 'Chat integrata',
    fr: 'Chat intégré',
    de: 'Integrierter Chat',
    nl: 'Geïntegreerde chat',
    sv: 'Integrerad chat',
    no: 'Integrert chat'
  },
  'ipage.showcase2Desc': {
    pt: 'Fale diretamente com seus fãs e clientes.',
    en: 'Talk directly with your fans and customers.',
    es: 'Habla directamente con tus fans y clientes.',
    it: 'Parla direttamente con i tuoi fan e clienti.',
    fr: 'Parlez directement avec vos fans et clients.',
    de: 'Sprechen Sie direkt mit Ihren Fans und Kunden.',
    nl: 'Praat direct met je fans en klanten.',
    sv: 'Prata direkt med dina fans och kunder.',
    no: 'Snakk direkte med fansene og kundene dine.'
  },
  'ipage.showcase3': {
    pt: 'Vendas diretas',
    en: 'Direct sales',
    es: 'Ventas directas',
    it: 'Vendite dirette',
    fr: 'Ventes directes',
    de: 'Direktverkäufe',
    nl: 'Directe verkoop',
    sv: 'Direktförsäljning',
    no: 'Direkte salg'
  },
  'ipage.showcase3Desc': {
    pt: 'Receba pagamentos sem sair da plataforma.',
    en: 'Receive payments without leaving the platform.',
    es: 'Recibe pagos sin salir de la plataforma.',
    it: 'Ricevi pagamenti senza lasciare la piattaforma.',
    fr: 'Recevez des paiements sans quitter la plateforme.',
    de: 'Erhalten Sie Zahlungen, ohne die Plattform zu verlassen.',
    nl: 'Ontvang betalingen zonder het platform te verlaten.',
    sv: 'Ta emot betalningar utan att lämna plattformen.',
    no: 'Motta betalinger uten å forlate plattformen.'
  },
  'ipage.startNowTitle': {
    pt: '👉 Comece agora',
    en: '👉 Start now',
    es: '👉 Comienza ahora',
    it: '👉 Inizia ora',
    fr: '👉 Commencez maintenant',
    de: '👉 Jetzt starten',
    nl: '👉 Begin nu',
    sv: '👉 Börja nu',
    no: '👉 Begynn nå'
  },
  'ipage.startNowDescription': {
    pt: 'Crie sua conta grátis e descubra como transformar sua audiência em clientes fiéis',
    en: 'Create your free account and discover how to transform your audience into loyal customers',
    es: 'Crea tu cuenta gratis y descubre cómo transformar tu audiencia en clientes fieles',
    it: 'Crea il tuo account gratuito e scopri come trasformare il tuo pubblico in clienti fedeli',
    fr: 'Créez votre compte gratuit et découvrez comment transformer votre audience en clients fidèles',
    de: 'Erstellen Sie Ihr kostenloses Konto und entdecken Sie, wie Sie Ihr Publikum in treue Kunden verwandeln',
    nl: 'Maak je gratis account aan en ontdek hoe je je publiek kunt omzetten in loyale klanten',
    sv: 'Skapa ditt gratis konto och upptäck hur du förvandlar din publik till lojala kunder',
    no: 'Opprett din gratis konto og oppdag hvordan du forvandler publikum til lojale kunder'
  },
  'ipage.footerTitle': {
    pt: 'Social Link',
    en: 'Social Link',
    es: 'Social Link',
    it: 'Social Link',
    fr: 'Social Link',
    de: 'Social Link',
    nl: 'Social Link',
    sv: 'Social Link',
    no: 'Social Link'
  },
  'ipage.footerSubtitle': {
    pt: 'A evolução do link na bio',
    en: 'The evolution of link in bio',
    es: 'La evolución del link en bio',
    it: 'L\'evoluzione del link in bio',
    fr: 'L\'évolution du lien en bio',
    de: 'Die Evolution des Links in der Bio',
    nl: 'De evolutie van link in bio',
    sv: 'Utvecklingen av länk i bio',
    no: 'Utviklingen av lenke i bio'
  },
  'ipage.signUpButton': {
    pt: '📝 Fazer Cadastro',
    en: '📝 Sign Up',
    es: '📝 Registrarse',
    it: '📝 Registrati',
    fr: '📝 S\'inscrire',
    de: '📝 Registrieren',
    nl: '📝 Registreren',
    sv: '📝 Registrera',
    no: '📝 Registrer'
  },
  'ipage.freeTrialButton': {
    pt: '🚀 Teste grátis por 7 dias',
    en: '🚀 Free 7-day trial',
    es: '🚀 Prueba gratis por 7 días',
    it: '🚀 Prova gratuita di 7 giorni',
    fr: '🚀 Essai gratuit de 7 jours',
    de: '🚀 7 Tage kostenlose Testversion',
    nl: '🚀 Gratis 7-daagse proefperiode',
    sv: '🚀 Gratis 7-dagars provperiod',
    no: '🚀 Gratis 7-dagers prøveperiode'
  },
  'ipage.commitmentText': {
    pt: 'Sem compromisso • Cancele a qualquer momento',
    en: 'No commitment • Cancel anytime',
    es: 'Sin compromiso • Cancela en cualquier momento',
    it: 'Nessun impegno • Cancella in qualsiasi momento',
    fr: 'Aucun engagement • Annulez à tout moment',
    de: 'Keine Verpflichtung • Jederzeit kündbar',
    nl: 'Geen verplichtingen • Stop wanneer je wilt',
    sv: 'Ingen förpliktelse • Avsluta när som helst',
    no: 'Ingen forpliktelse • Avbryt når som helst'
  },
  // Additional features
  'ipage.feature4Title': {
    pt: 'Estatísticas em tempo real',
    en: 'Real-time statistics',
    es: 'Estadísticas en tiempo real',
    it: 'Statistiche in tempo reale',
    fr: 'Statistiques en temps réel',
    de: 'Echtzeit-Statistiken',
    nl: 'Real-time statistieken',
    sv: 'Realtidsstatistik',
    no: 'Sanntidsstatistikk'
  },
  'ipage.feature4Description': {
    pt: 'Veja curtidas, compartilhamentos e visualizações para entender o que mais atrai sua audiência.',
    en: 'See likes, shares and views to understand what attracts your audience the most.',
    es: 'Ve likes, compartidos y visualizaciones para entender qué atrae más a tu audiencia.',
    it: 'Vedi like, condivisioni e visualizzazioni per capire cosa attrae di più il tuo pubblico.',
    fr: 'Voyez les likes, partages et vues pour comprendre ce qui attire le plus votre audience.',
    de: 'Sehen Sie Likes, Shares und Aufrufe, um zu verstehen, was Ihr Publikum am meisten anzieht.',
    nl: 'Zie likes, shares en weergaven om te begrijpen wat je publiek het meest aanspreekt.',
    sv: 'Se gillningar, delningar och visningar för att förstå vad som attraherar din publik mest.',
    no: 'Se likes, delinger og visninger for å forstå hva som tiltrekker publikummet ditt mest.'
  },
  'ipage.feature5Title': {
    pt: 'Controle total',
    en: 'Total control',
    es: 'Control total',
    it: 'Controllo totale',
    fr: 'Contrôle total',
    de: 'Vollständige Kontrolle',
    nl: 'Volledige controle',
    sv: 'Total kontroll',
    no: 'Total kontroll'
  },
  'ipage.feature5Description': {
    pt: 'Use cronômetros, senhas, bloqueios automáticos e personalização avançada para proteger seu conteúdo.',
    en: 'Use timers, passwords, automatic locks and advanced customization to protect your content.',
    es: 'Usa temporizadores, contraseñas, bloqueos automáticos y personalización avanzada para proteger tu contenido.',
    it: 'Usa timer, password, blocchi automatici e personalizzazione avanzata per proteggere i tuoi contenuti.',
    fr: 'Utilisez des minuteurs, mots de passe, verrouillages automatiques et personnalisation avancée pour protéger votre contenu.',
    de: 'Verwenden Sie Timer, Passwörter, automatische Sperren und erweiterte Anpassungen, um Ihre Inhalte zu schützen.',
    nl: 'Gebruik timers, wachtwoorden, automatische vergrendelingen en geavanceerde aanpassingen om je content te beschermen.',
    sv: 'Använd timers, lösenord, automatiska lås och avancerad anpassning för att skydda ditt innehåll.',
    no: 'Bruk timere, passord, automatiske låser og avansert tilpasning for å beskytte innholdet ditt.'
  },
  'ipage.feature6Title': {
    pt: 'Interface rápida',
    en: 'Fast interface',
    es: 'Interfaz rápida',
    it: 'Interfaccia veloce',
    fr: 'Interface rapide',
    de: 'Schnelle Oberfläche',
    nl: 'Snelle interface',
    sv: 'Snabb gränssnitt',
    no: 'Hurtig grensesnitt'
  },
  'ipage.feature6Description': {
    pt: 'Experiência fluida e responsiva que funciona perfeitamente em todos os dispositivos.',
    en: 'Fluid and responsive experience that works perfectly on all devices.',
    es: 'Experiencia fluida y responsiva que funciona perfectamente en todos los dispositivos.',
    it: 'Esperienza fluida e reattiva che funziona perfettamente su tutti i dispositivi.',
    fr: 'Expérience fluide et réactive qui fonctionne parfaitement sur tous les appareils.',
    de: 'Flüssige und responsive Erfahrung, die perfekt auf allen Geräten funktioniert.',
    nl: 'Vloeiende en responsieve ervaring die perfect werkt op alle apparaten.',
    sv: 'Flytande och responsiv upplevelse som fungerar perfekt på alla enheter.',
    no: 'Flytende og responsiv opplevelse som fungerer perfekt på alle enheter.'
  },
  
  // Plans translations
  'plans.free.7days': {
    pt: '7 dias grátis',
    en: '7 days free',
    es: '7 días gratis',
    it: '7 giorni gratis',
    fr: '7 jours gratuits',
    de: '7 Tage kostenlos',
    nl: '7 dagen gratis',
    sv: '7 dagar gratis',
    no: '7 dager gratis'
  },
  'plans.free.slots': {
    pt: '2 slots para mídia',
    en: '2 media slots',
    es: '2 espacios para medios',
    it: '2 slot media',
    fr: '2 emplacements média',
    de: '2 Medien-Slots',
    nl: '2 media slots',
    sv: '2 mediaplaster',
    no: '2 medieplasser'
  },
  'plans.basic.slots': {
    pt: '10 slots para mídia',
    en: '10 media slots',
    es: '10 espacios para medios',
    it: '10 slot media',
    fr: '10 emplacements média',
    de: '10 Medien-Slots',
    nl: '10 media slots',
    sv: '10 mediaplaster',
    no: '10 medieplasser'
  },
  'plans.basic.credits': {
    pt: '500 créditos mensais',
    en: '500 monthly credits',
    es: '500 créditos mensuales',
    it: '500 crediti mensili',
    fr: '500 crédits mensuels',
    de: '500 monatliche Credits',
    nl: '500 maandelijkse credits',
    sv: '500 månatliga krediter',
    no: '500 månedlige kreditter'
  },
  'plans.pro.slots': {
    pt: '25 slots para mídia',
    en: '25 media slots',
    es: '25 espacios para medios',
    it: '25 slot media',
    fr: '25 emplacements média',
    de: '25 Medien-Slots',
    nl: '25 media slots',
    sv: '25 mediaplaster',
    no: '25 medieplasser'
  },
  'plans.pro.credits': {
    pt: '1200 créditos mensais',
    en: '1200 monthly credits',
    es: '1200 créditos mensuales',
    it: '1200 crediti mensili',
    fr: '1200 crédits mensuels',
    de: '1200 monatliche Credits',
    nl: '1200 maandelijkse credits',
    sv: '1200 månatliga krediter',
    no: '1200 månedlige kreditter'
  },
  'plans.vip.slots': {
    pt: 'Slots ilimitados',
    en: 'Unlimited slots',
    es: 'Espacios ilimitados',
    it: 'Slot illimitati',
    fr: 'Emplacements illimités',
    de: 'Unbegrenzte Slots',
    nl: 'Onbeperkte slots',
    sv: 'Obegränsade platser',
    no: 'Ubegrensede plasser'
  },
  'plans.vip.credits': {
    pt: '2500 créditos mensais',
    en: '2500 monthly credits',
    es: '2500 créditos mensuales',
    it: '2500 crediti mensili',
    fr: '2500 crédits mensuels',
    de: '2500 monatliche Credits',
    nl: '2500 maandelijkse credits',
    sv: '2500 månatliga krediter',
    no: '2500 månedlige kreditter'
  },
  'plans.noVideoRestriction': {
    pt: 'Sem restrição de vídeos',
    en: 'No video restrictions',
    es: 'Sin restricción de videos',
    it: 'Nessuna restrizione video',
    fr: 'Aucune restriction vidéo',
    de: 'Keine Video-Beschränkungen',
    nl: 'Geen videobeperkingen',
    sv: 'Inga videobegränsningar',
    no: 'Ingen videobegrensninger'
  },
  
  // Premium Plans translations
  'premiumPlans.title': {
    pt: 'Planos Premium',
    en: 'Premium Plans',
    es: 'Planes Premium',
    it: 'Piani Premium',
    fr: 'Forfaits Premium',
    de: 'Premium-Pläne',
    nl: 'Premium Plannen',
    sv: 'Premium Planer',
    no: 'Premium Planer'
  },
  'premiumPlans.description': {
    pt: 'Escolha o plano ideal para maximizar seu potencial',
    en: 'Choose the ideal plan to maximize your potential',
    es: 'Elige el plan ideal para maximizar tu potencial',
    it: 'Scegli il piano ideale per massimizzare il tuo potenziale',
    fr: 'Choisissez le forfait idéal pour maximiser votre potentiel',
    de: 'Wählen Sie den idealen Plan, um Ihr Potenzial zu maximieren',
    nl: 'Kies het ideale plan om je potentieel te maximaliseren',
    sv: 'Välj den idealiska planen för att maximera din potential',
    no: 'Velg den ideelle planen for å maksimere potensialet ditt'
  },
  'premiumPlans.mostPopular': {
    pt: 'Mais Popular',
    en: 'Most Popular',
    es: 'Más Popular',
    it: 'Più Popolare',
    fr: 'Le Plus Populaire',
    de: 'Am Beliebtesten',
    nl: 'Meest Populair',
    sv: 'Mest Populär',
    no: 'Mest Populær'
  },
  'premiumPlans.bestValue': {
    pt: 'Melhor Valor',
    en: 'Best Value',
    es: 'Mejor Valor',
    it: 'Miglior Valore',
    fr: 'Meilleur Rapport',
    de: 'Bester Wert',
    nl: 'Beste Waarde',
    sv: 'Bästa Värde',
    no: 'Beste Verdi'
  },
  'premiumPlans.startFree': {
    pt: 'Começar Grátis',
    en: 'Start Free',
    es: 'Comenzar Gratis',
    it: 'Inizia Gratis',
    fr: 'Commencer Gratuitement',
    de: 'Kostenlos Starten',
    nl: 'Start Gratis',
    sv: 'Börja Gratis',
    no: 'Start Gratis'
  },
  'premiumPlans.choose': {
    pt: 'Escolher',
    en: 'Choose',
    es: 'Elegir',
    it: 'Scegli',
    fr: 'Choisir',
    de: 'Wählen',
    nl: 'Kiezen',
    sv: 'Välj',
    no: 'Velg'
  },
  'premiumPlans.manageSubscription': {
    pt: 'Gerenciar Assinatura',
    en: 'Manage Subscription',
    es: 'Gestionar Suscripción',
    it: 'Gestisci Abbonamento',
    fr: 'Gérer l\'Abonnement',
    de: 'Abonnement Verwalten',
    nl: 'Beheer Abonnement',
    sv: 'Hantera Prenumeration',
    no: 'Administrer Abonnement'
  },
  
  // Features translations
  'features.uploads.title': {
    pt: 'Uploads',
    en: 'Uploads',
    es: 'Subidas',
    it: 'Caricamenti',
    fr: 'Téléchargements',
    de: 'Uploads',
    nl: 'Uploads',
    sv: 'Uppladdningar',
    no: 'Opplastinger'
  },
  'features.uploads.changeSlotImage': {
    pt: 'Mudar imagem do slot',
    en: 'Change slot image',
    es: 'Cambiar imagen del espacio',
    it: 'Cambia immagine slot',
    fr: 'Changer l\'image de l\'emplacement',
    de: 'Slot-Bild ändern',
    nl: 'Slot afbeelding wijzigen',
    sv: 'Ändra platsens bild',
    no: 'Endre plassens bilde'
  },
  'features.uploads.pinMedia': {
    pt: 'Fixar mídia',
    en: 'Pin media',
    es: 'Fijar medios',
    it: 'Fissa media',
    fr: 'Épingler média',
    de: 'Medien anheften',
    nl: 'Media vastpinnen',
    sv: 'Fäst media',
    no: 'Fest media'
  },
  'features.uploads.createSlideshow': {
    pt: 'Criar slideshow',
    en: 'Create slideshow',
    es: 'Crear presentación',
    it: 'Crea slideshow',
    fr: 'Créer diaporama',
    de: 'Diashow erstellen',
    nl: 'Diavoorstelling maken',
    sv: 'Skapa bildspel',
    no: 'Lag lysbildevisning'
  },
  'features.uploads.zoomMainImage': {
    pt: 'Zoom na imagem principal',
    en: 'Zoom main image',
    es: 'Zoom en imagen principal',
    it: 'Zoom immagine principale',
    fr: 'Zoom image principale',
    de: 'Hauptbild zoomen',
    nl: 'Zoom hoofdafbeelding',
    sv: 'Zooma huvudbild',
    no: 'Zoom hovedbilde'
  },
  'features.uploads.zoomChatMedia': {
    pt: 'Zoom na mídia do chat',
    en: 'Zoom chat media',
    es: 'Zoom en medios del chat',
    it: 'Zoom media chat',
    fr: 'Zoom média chat',
    de: 'Chat-Medien zoomen',
    nl: 'Zoom chat media',
    sv: 'Zooma chattmedia',
    no: 'Zoom chat-media'
  },
  'features.customization.title': {
    pt: 'Personalização',
    en: 'Customization',
    es: 'Personalización',
    it: 'Personalizzazione',
    fr: 'Personnalisation',
    de: 'Anpassung',
    nl: 'Personalisatie',
    sv: 'Anpassning',
    no: 'Tilpasning'
  },
  'features.customization.manualBlur': {
    pt: 'Borrar manual',
    en: 'Manual blur',
    es: 'Difuminado manual',
    it: 'Sfocatura manuale',
    fr: 'Flou manuel',
    de: 'Manueller Unschärfe',
    nl: 'Handmatige vervaging',
    sv: 'Manuell oskärpa',
    no: 'Manuell uskarphet'
  },
  'features.customization.autoBlur': {
    pt: 'Borrar automático',
    en: 'Auto blur',
    es: 'Difuminado automático',
    it: 'Sfocatura automatica',
    fr: 'Flou automatique',
    de: 'Automatische Unschärfe',
    nl: 'Automatische vervaging',
    sv: 'Automatisk oskärpa',
    no: 'Automatisk uskarphet'
  },
  'features.customization.mediaLink': {
    pt: 'Link na mídia',
    en: 'Media link',
    es: 'Enlace en medios',
    it: 'Link media',
    fr: 'Lien média',
    de: 'Medien-Link',
    nl: 'Media link',
    sv: 'Medialänk',
    no: 'Medialenke'
  },
  'features.customization.textPrice': {
    pt: 'Texto e preço',
    en: 'Text and price',
    es: 'Texto y precio',
    it: 'Testo e prezzo',
    fr: 'Texte et prix',
    de: 'Text und Preis',
    nl: 'Tekst en prijs',
    sv: 'Text och pris',
    no: 'Tekst og pris'
  },
  'features.customization.colorPalette': {
    pt: 'Paleta de cores',
    en: 'Color palette',
    es: 'Paleta de colores',
    it: 'Tavolozza colori',
    fr: 'Palette de couleurs',
    de: 'Farbpalette',
    nl: 'Kleurenpalet',
    sv: 'Färgpalett',
    no: 'Fargepalett'
  },
  'features.customization.socialIcons': {
    pt: 'Ícones sociais',
    en: 'Social icons',
    es: 'Iconos sociales',
    it: 'Icone sociali',
    fr: 'Icônes sociales',
    de: 'Social-Icons',
    nl: 'Sociale iconen',
    sv: 'Sociala ikoner',
    no: 'Sosiale ikoner'
  },
  'features.timing.title': {
    pt: 'Cronômetros',
    en: 'Timing',
    es: 'Temporizadores',
    it: 'Temporizzazione',
    fr: 'Minuterie',
    de: 'Zeitsteuerung',
    nl: 'Timing',
    sv: 'Timing',
    no: 'Timing'
  },
  'features.timing.autoDelete': {
    pt: 'Exclusão automática',
    en: 'Auto delete',
    es: 'Eliminación automática',
    it: 'Eliminazione automatica',
    fr: 'Suppression automatique',
    de: 'Automatisches Löschen',
    nl: 'Automatisch verwijderen',
    sv: 'Automatisk radering',
    no: 'Automatisk sletting'
  },
  'features.timing.mainScreenTimer': {
    pt: 'Timer tela principal',
    en: 'Main screen timer',
    es: 'Temporizador pantalla principal',
    it: 'Timer schermo principale',
    fr: 'Minuteur écran principal',
    de: 'Hauptbildschirm-Timer',
    nl: 'Hoofdscherm timer',
    sv: 'Huvudskärm timer',
    no: 'Hovedskjerm timer'
  },
  'features.timing.autoLock': {
    pt: 'Bloqueio automático',
    en: 'Auto lock',
    es: 'Bloqueo automático',
    it: 'Blocco automatico',
    fr: 'Verrouillage automatique',
    de: 'Automatische Sperre',
    nl: 'Automatische vergrendeling',
    sv: 'Automatisk låsning',
    no: 'Automatisk låsing'
  },
  'features.timing.passwordLock': {
    pt: 'Bloqueio por senha',
    en: 'Password lock',
    es: 'Bloqueo por contraseña',
    it: 'Blocco password',
    fr: 'Verrouillage par mot de passe',
    de: 'Passwort-Sperre',
    nl: 'Wachtwoord vergrendeling',
    sv: 'Lösenordslås',
    no: 'Passordlås'
  },
  'features.vitrine.title': {
    pt: 'Vitrine',
    en: 'Showcase',
    es: 'Vitrina',
    it: 'Vetrina',
    fr: 'Vitrine',
    de: 'Schaufenster',
    nl: 'Etalage',
    sv: 'Skyltfönster',
    no: 'Utstillingsvindu'
  },
  'features.vitrine.backgroundColor': {
    pt: 'Cor de fundo',
    en: 'Background color',
    es: 'Color de fondo',
    it: 'Colore sfondo',
    fr: 'Couleur de fond',
    de: 'Hintergrundfarbe',
    nl: 'Achtergrondkleur',
    sv: 'Bakgrundsfärg',
    no: 'Bakgrunnsfarge'
  },
  'features.vitrine.hide': {
    pt: 'Ocultar vitrine',
    en: 'Hide showcase',
    es: 'Ocultar vitrina',
    it: 'Nascondi vetrina',
    fr: 'Masquer vitrine',
    de: 'Schaufenster verstecken',
    nl: 'Etalage verbergen',
    sv: 'Dölj skyltfönster',
    no: 'Skjul utstillingsvindu'
  },
  'features.vitrine.minimizedText': {
    pt: 'Texto minimizado',
    en: 'Minimized text',
    es: 'Texto minimizado',
    it: 'Testo minimizzato',
    fr: 'Texte minimisé',
    de: 'Minimierter Text',
    nl: 'Geminimaliseerde tekst',
    sv: 'Minimerad text',
    no: 'Minimert tekst'
  },
  'features.chat.title': {
    pt: 'Chat',
    en: 'Chat',
    es: 'Chat',
    it: 'Chat',
    fr: 'Chat',
    de: 'Chat',
    nl: 'Chat',
    sv: 'Chatt',
    no: 'Chat'
  },
  'features.chat.close': {
    pt: 'Fechar chat',
    en: 'Close chat',
    es: 'Cerrar chat',
    it: 'Chiudi chat',
    fr: 'Fermer chat',
    de: 'Chat schließen',
    nl: 'Chat sluiten',
    sv: 'Stäng chatt',
    no: 'Lukk chat'
  },
  'features.chat.hideHistory': {
    pt: 'Ocultar histórico',
    en: 'Hide history',
    es: 'Ocultar historial',
    it: 'Nascondi cronologia',
    fr: 'Masquer historique',
    de: 'Verlauf verstecken',
    nl: 'Geschiedenis verbergen',
    sv: 'Dölj historik',
    no: 'Skjul historikk'
  },
  'features.chat.backgroundColor': {
    pt: 'Cor de fundo',
    en: 'Background color',
    es: 'Color de fondo',
    it: 'Colore sfondo',
    fr: 'Couleur de fond',
    de: 'Hintergrundfarbe',
    nl: 'Achtergrondkleur',
    sv: 'Bakgrundsfärg',
    no: 'Bakgrunnsfarge'
  },
  'features.chat.messageColor': {
    pt: 'Cor das mensagens',
    en: 'Message color',
    es: 'Color de mensajes',
    it: 'Colore messaggi',
    fr: 'Couleur messages',
    de: 'Nachrichten-Farbe',
    nl: 'Berichtkleur',
    sv: 'Meddelandefärg',
    no: 'Meldingsfarge'
  },
  'features.chat.creatorName': {
    pt: 'Nome do criador',
    en: 'Creator name',
    es: 'Nombre del creador',
    it: 'Nome creatore',
    fr: 'Nom créateur',
    de: 'Ersteller-Name',
    nl: 'Naam maker',
    sv: 'Skaparens namn',
    no: 'Skaperens navn'
  },
  'features.chat.creatorPhoto': {
    pt: 'Foto do criador',
    en: 'Creator photo',
    es: 'Foto del creador',
    it: 'Foto creatore',
    fr: 'Photo créateur',
    de: 'Ersteller-Foto',
    nl: 'Foto maker',
    sv: 'Skaparens foto',
    no: 'Skaperens foto'
  },
  'features.chat.hideUpload': {
    pt: 'Ocultar upload',
    en: 'Hide upload',
    es: 'Ocultar subida',
    it: 'Nascondi caricamento',
    fr: 'Masquer téléchargement',
    de: 'Upload verstecken',
    nl: 'Upload verbergen',
    sv: 'Dölj uppladdning',
    no: 'Skjul opplasting'
  },
  'features.chat.adjustBoxHeight': {
    pt: 'Ajustar altura da caixa',
    en: 'Adjust box height',
    es: 'Ajustar altura de caja',
    it: 'Regola altezza box',
    fr: 'Ajuster hauteur boîte',
    de: 'Box-Höhe anpassen',
    nl: 'Box hoogte aanpassen',
    sv: 'Justera boxhöjd',
    no: 'Juster bokshøyde'
  },
  'features.interaction.title': {
    pt: 'Interação',
    en: 'Interaction',
    es: 'Interacción',
    it: 'Interazione',
    fr: 'Interaction',
    de: 'Interaktion',
    nl: 'Interactie',
    sv: 'Interaktion',
    no: 'Interaksjon'
  },
  'features.interaction.likeMedia': {
    pt: 'Curtir mídia',
    en: 'Like media',
    es: 'Me gusta en medios',
    it: 'Like media',
    fr: 'Aimer média',
    de: 'Medien liken',
    nl: 'Media liken',
    sv: 'Gilla media',
    no: 'Lik media'
  },
  'features.interaction.shareToSocial': {
    pt: 'Compartilhar nas redes',
    en: 'Share to social',
    es: 'Compartir en redes',
    it: 'Condividi sui social',
    fr: 'Partager sur réseaux',
    de: 'In sozialen Netzwerken teilen',
    nl: 'Delen op sociale media',
    sv: 'Dela på sociala medier',
    no: 'Del på sosiale medier'
  },
  'features.interaction.statistics': {
    pt: 'Estatísticas',
    en: 'Statistics',
    es: 'Estadísticas',
    it: 'Statistiche',
    fr: 'Statistiques',
    de: 'Statistiken',
    nl: 'Statistieken',
    sv: 'Statistik',
    no: 'Statistikk'
  },
  'features.showAll': {
    pt: 'Mostrar Todas',
    en: 'Show All',
    es: 'Mostrar Todas',
    it: 'Mostra Tutte',
    fr: 'Afficher Toutes',
    de: 'Alle Anzeigen',
    nl: 'Toon Alle',
    sv: 'Visa Alla',
    no: 'Vis Alle'
  },
  'features.hideAll': {
    pt: 'Ocultar Todas',
    en: 'Hide All',
    es: 'Ocultar Todas',
    it: 'Nascondi Tutte',
    fr: 'Masquer Toutes',
    de: 'Alle Verstecken',
    nl: 'Verberg Alle',
    sv: 'Dölj Alla',
    no: 'Skjul Alle'
  },
  'features.included': {
    pt: 'as Funcionalidades',
    en: 'Features',
    es: 'las Funcionalidades',
    it: 'le Funzionalità',
    fr: 'les Fonctionnalités',
    de: 'Features',
    nl: 'Functies',
    sv: 'Funktioner',
    no: 'Funksjoner'
  },
  'features.allIncluded': {
    pt: 'Todas as funcionalidades incluídas',
    en: 'All features included',
    es: 'Todas las funcionalidades incluidas',
    it: 'Tutte le funzionalità incluse',
    fr: 'Toutes les fonctionnalités incluses',
    de: 'Alle Features inklusive',
    nl: 'Alle functies inbegrepen',
    sv: 'Alla funktioner inkluderade',
    no: 'Alle funksjoner inkludert'
  },
  'features.onlyDifference': {
    pt: 'A única diferença são os limites de slots e créditos',
    en: 'The only difference is the slot and credit limits',
    es: 'La única diferencia son los límites de espacios y créditos',
    it: 'L\'unica differenza sono i limiti di slot e crediti',
    fr: 'La seule différence sont les limites d\'emplacements et de crédits',
    de: 'Der einzige Unterschied sind die Slot- und Credit-Limits',
    nl: 'Het enige verschil zijn de slot- en creditlimieten',
    sv: 'Den enda skillnaden är slot- och kreditgränser',
    no: 'Den eneste forskjellen er slot- og kredittgrenser'
  },
  'features.tip': {
    pt: 'Dica:',
    en: 'Tip:',
    es: 'Consejo:',
    it: 'Suggerimento:',
    fr: 'Astuce:',
    de: 'Tipp:',
    nl: 'Tip:',
    sv: 'Tips:',
    no: 'Tips:'
  },
  'features.chooseTip': {
    pt: 'Escolha o plano com base no número de slots e créditos que você precisa. Todas as outras funcionalidades são iguais.',
    en: 'Choose the plan based on the number of slots and credits you need. All other features are the same.',
    es: 'Elige el plan basado en el número de espacios y créditos que necesites. Todas las demás funcionalidades son iguales.',
    it: 'Scegli il piano in base al numero di slot e crediti di cui hai bisogno. Tutte le altre funzionalità sono uguali.',
    fr: 'Choisissez le forfait en fonction du nombre d\'emplacements et de crédits dont vous avez besoin. Toutes les autres fonctionnalités sont identiques.',
    de: 'Wählen Sie den Plan basierend auf der Anzahl der Slots und Credits, die Sie benötigen. Alle anderen Features sind gleich.',
    nl: 'Kies het plan gebaseerd op het aantal slots en credits dat je nodig hebt. Alle andere functies zijn hetzelfde.',
    sv: 'Välj planen baserat på antalet platser och krediter du behöver. Alla andra funktioner är desamma.',
    no: 'Velg planen basert på antall plasser og kreditter du trenger. Alle andre funksjoner er like.'
  },
  
  // Add Credits Dialog
  'addCredits.title': {
    pt: 'Adicionar Créditos',
    en: 'Add Credits',
    es: 'Añadir Créditos',
    it: 'Aggiungi Crediti',
    fr: 'Ajouter des Crédits',
    de: 'Credits Hinzufügen',
    nl: 'Credits Toevoegen',
    sv: 'Lägg Till Krediter',
    no: 'Legg Til Kreditter'
  },
  'addCredits.description': {
    pt: 'Escolha a quantidade de créditos que deseja adicionar à sua conta',
    en: 'Choose the amount of credits you want to add to your account',
    es: 'Elige la cantidad de créditos que quieres añadir a tu cuenta',
    it: 'Scegli la quantità di crediti che vuoi aggiungere al tuo account',
    fr: 'Choisissez la quantité de crédits que vous voulez ajouter à votre compte',
    de: 'Wählen Sie die Anzahl der Credits, die Sie Ihrem Konto hinzufügen möchten',
    nl: 'Kies het aantal credits dat je aan je account wilt toevoegen',
    sv: 'Välj mängden krediter du vill lägga till på ditt konto',
    no: 'Velg mengden kreditter du vil legge til på kontoen din'
  },
  'addCredits.customAmount': {
    pt: 'Quantidade Personalizada',
    en: 'Custom Amount',
    es: 'Cantidad Personalizada',
    it: 'Quantità Personalizzata',
    fr: 'Montant Personnalisé',
    de: 'Benutzerdefinierte Menge',
    nl: 'Aangepaste Hoeveelheid',
    sv: 'Anpassad Mängd',
    no: 'Tilpasset Mengde'
  },
  'addCredits.selectAmount': {
    pt: 'Selecionar quantidade',
    en: 'Select amount',
    es: 'Seleccionar cantidad',
    it: 'Seleziona quantità',
    fr: 'Sélectionner le montant',
    de: 'Menge auswählen',
    nl: 'Hoeveelheid selecteren',
    sv: 'Välj mängd',
    no: 'Velg mengde'
  },
  'addCredits.credits': {
    pt: 'créditos',
    en: 'credits',
    es: 'créditos',
    it: 'crediti',
    fr: 'crédits',
    de: 'Credits',
    nl: 'credits',
    sv: 'krediter',
    no: 'kreditter'
  },
  'addCredits.total': {
    pt: 'Total',
    en: 'Total',
    es: 'Total',
    it: 'Totale',
    fr: 'Total',
    de: 'Gesamt',
    nl: 'Totaal',
    sv: 'Totalt',
    no: 'Totalt'
  },
  'addCredits.willReceive': {
    pt: 'Você receberá',
    en: 'You will receive',
    es: 'Recibirás',
    it: 'Riceverai',
    fr: 'Vous recevrez',
    de: 'Sie erhalten',
    nl: 'Je ontvangt',
    sv: 'Du kommer att få',
    no: 'Du vil motta'
  },
  'addCredits.processing': {
    pt: 'Processando...',
    en: 'Processing...',
    es: 'Procesando...',
    it: 'Elaborazione...',
    fr: 'Traitement...',
    de: 'Verarbeitung...',
    nl: 'Verwerking...',
    sv: 'Bearbetar...',
    no: 'Behandler...'
  },
  'addCredits.continuePayment': {
    pt: 'Continuar com Pagamento',
    en: 'Continue with Payment',
    es: 'Continuar con Pago',
    it: 'Continua con il Pagamento',
    fr: 'Continuer avec le Paiement',
    de: 'Mit Zahlung Fortfahren',
    nl: 'Doorgaan met Betaling',
    sv: 'Fortsätt med Betalning',
    no: 'Fortsett med Betaling'
  },
  
  // Media Showcase
  'mediaShowcase.getVipSlots': {
    pt: 'Obter Slots VIP',
    en: 'Get VIP Slots',
    es: 'Obtener Slots VIP',
    it: 'Ottieni Slot VIP',
    fr: 'Obtenir des Slots VIP',
    de: 'VIP-Slots Erhalten',
    nl: 'VIP Slots Krijgen',
    sv: 'Få VIP Platser',
    no: 'Få VIP Plasser'
  },
  'mediaShowcase.getImageSlot': {
    pt: 'Slot de Imagem',
    en: 'Image Slot',
    es: 'Slot de Imagen',
    it: 'Slot Immagine',
    fr: 'Slot d\'Image',
    de: 'Bild-Slot',
    nl: 'Afbeelding Slot',
    sv: 'Bildplats',
    no: 'Bildeplass'
  },
  'mediaShowcase.getVideoSlot': {
    pt: 'Slot de Vídeo',
    en: 'Video Slot',
    es: 'Slot de Video',
    it: 'Slot Video',
    fr: 'Slot Vidéo',
    de: 'Video-Slot',
    nl: 'Video Slot',
    sv: 'Videoplats',
    no: 'Videoplass'
  },
  'mediaShowcase.uploadPhoto': {
    pt: 'Enviar Foto',
    en: 'Upload Photo',
    es: 'Subir Foto',
    it: 'Carica Foto',
    fr: 'Télécharger Photo',
    de: 'Foto Hochladen',
    nl: 'Foto Uploaden',
    sv: 'Ladda Upp Foto',
    no: 'Last Opp Foto'
  },
  'mediaShowcase.autoDeleteTimer': {
    pt: 'Timer de Exclusão Automática',
    en: 'Auto Delete Timer',
    es: 'Temporizador de Eliminación Automática',
    it: 'Timer di Eliminazione Automatica',
    fr: 'Minuteur de Suppression Automatique',
    de: 'Automatischer Lösch-Timer',
    nl: 'Automatische Verwijder Timer',
    sv: 'Automatisk Raderingstimer',
    no: 'Automatisk Slette-timer'
  },
  'mediaShowcase.cancelAutoDelete': {
    pt: 'Cancelar Exclusão Automática',
    en: 'Cancel Auto Delete',
    es: 'Cancelar Eliminación Automática',
    it: 'Annulla Eliminazione Automatica',
    fr: 'Annuler la Suppression Automatique',
    de: 'Automatisches Löschen Abbrechen',
    nl: 'Automatisch Verwijderen Annuleren',
    sv: 'Avbryt Automatisk Radering',
    no: 'Avbryt Automatisk Sletting'
  },
  'mediaShowcase.replaceImage': {
    pt: 'Substituir Imagem',
    en: 'Replace Image',
    es: 'Reemplazar Imagen',
    it: 'Sostituisci Immagine',
    fr: 'Remplacer l\'Image',
    de: 'Bild Ersetzen',
    nl: 'Afbeelding Vervangen',
    sv: 'Ersätt Bild',
    no: 'Erstatt Bilde'
  },
  'mediaShowcase.removeBlur': {
    pt: 'Remover Desfoque',
    en: 'Remove Blur',
    es: 'Quitar Desenfoque',
    it: 'Rimuovi Sfocatura',
    fr: 'Supprimer le Flou',
    de: 'Unschärfe Entfernen',
    nl: 'Vervaging Verwijderen',
    sv: 'Ta Bort Oskärpa',
    no: 'Fjern Uskarphet'
  },
  'mediaShowcase.applyBlur': {
    pt: 'Aplicar Desfoque',
    en: 'Apply Blur',
    es: 'Aplicar Desenfoque',
    it: 'Applica Sfocatura',
    fr: 'Appliquer le Flou',
    de: 'Unschärfe Anwenden',
    nl: 'Vervaging Toepassen',
    sv: 'Tillämpa Oskärpa',
    no: 'Bruk Uskarphet'
  },
  'mediaShowcase.disableClickUnblur': {
    pt: 'Desabilitar Clique para Desfocar',
    en: 'Disable Click to Unblur',
    es: 'Deshabilitar Clic para Desenfocar',
    it: 'Disabilita Clic per Sfocare',
    fr: 'Désactiver Clic pour Déflouter',
    de: 'Klick zum Entschärfen Deaktivieren',
    nl: 'Klik om te Ontscherpen Uitschakelen',
    sv: 'Inaktivera Klick för att Oskärpa',
    no: 'Deaktiver Klikk for å Fjerne Uskarphet'
  },
  'mediaShowcase.enableClickUnblur': {
    pt: 'Habilitar Clique para Desfocar',
    en: 'Enable Click to Unblur',
    es: 'Habilitar Clic para Desenfocar',
    it: 'Abilita Clic per Sfocare',
    fr: 'Activer Clic pour Déflouter',
    de: 'Klick zum Entschärfen Aktivieren',
    nl: 'Klik om te Ontscherpen Inschakelen',
    sv: 'Aktivera Klick för att Oskärpa',
    no: 'Aktiver Klikk for å Fjerne Uskarphet'
  },
  'mediaShowcase.setPrice': {
    pt: 'Definir Preço',
    en: 'Set Price',
    es: 'Establecer Precio',
    it: 'Imposta Prezzo',
    fr: 'Définir le Prix',
    de: 'Preis Festlegen',
    nl: 'Prijs Instellen',
    sv: 'Ange Pris',
    no: 'Sett Pris'
  },
  'mediaShowcase.setLink': {
    pt: 'Definir Link',
    en: 'Set Link',
    es: 'Establecer Enlace',
    it: 'Imposta Link',
    fr: 'Définir le Lien',
    de: 'Link Festlegen',
    nl: 'Link Instellen',
    sv: 'Ange Länk',
    no: 'Sett Lenke'
  },
  'mediaShowcase.mainScreen': {
    pt: 'Tela Principal',
    en: 'Main Screen',
    es: 'Pantalla Principal',
    it: 'Schermo Principale',
    fr: 'Écran Principal',
    de: 'Hauptbildschirm',
    nl: 'Hoofdscherm',
    sv: 'Huvudskärm',
    no: 'Hovedskjerm'
  },
  'mediaShowcase.configureSlideshow': {
    pt: 'Configurar Slideshow',
    en: 'Configure Slideshow',
    es: 'Configurar Presentación',
    it: 'Configura Slideshow',
    fr: 'Configurer le Diaporama',
    de: 'Diashow Konfigurieren',
    nl: 'Diavoorstelling Configureren',
    sv: 'Konfigurera Bildspel',
    no: 'Konfigurer Lysbildevisning'
  },
  'mediaShowcase.resetTimer': {
    pt: 'Reiniciar Timer',
    en: 'Reset Timer',
    es: 'Reiniciar Temporizador',
    it: 'Resetta Timer',
    fr: 'Réinitialiser le Minuteur',
    de: 'Timer Zurücksetzen',
    nl: 'Timer Resetten',
    sv: 'Återställ Timer',
    no: 'Tilbakestill Timer'
  },
  'mediaShowcase.delete': {
    pt: 'Excluir',
    en: 'Delete',
    es: 'Eliminar',
    it: 'Elimina',
    fr: 'Supprimer',
    de: 'Löschen',
    nl: 'Verwijderen',
    sv: 'Radera',
    no: 'Slett'
  },
  
  // Vitrine
  'vitrine.noMedia': {
    pt: 'Nenhuma mídia encontrada',
    en: 'No media found',
    es: 'No se encontraron medios',
    it: 'Nessun media trovato',
    fr: 'Aucun média trouvé',
    de: 'Keine Medien gefunden',
    nl: 'Geen media gevonden',
    sv: 'Ingen media hittades',
    no: 'Ingen media funnet'
  },
  'vitrine.useButtons': {
    pt: 'Use os botões para adicionar conteúdo',
    en: 'Use the buttons to add content',
    es: 'Usa los botones para añadir contenido',
    it: 'Usa i pulsanti per aggiungere contenuto',
    fr: 'Utilisez les boutons pour ajouter du contenu',
    de: 'Verwenden Sie die Schaltflächen, um Inhalte hinzuzufügen',
    nl: 'Gebruik de knoppen om inhoud toe te voegen',
    sv: 'Använd knapparna för att lägga till innehåll',
    no: 'Bruk knappene for å legge til innhold'
  },
  'vitrine.uploadVideo': {
    pt: 'Enviar Vídeo',
    en: 'Upload Video',
    es: 'Subir Video',
    it: 'Carica Video',
    fr: 'Télécharger Vidéo',
    de: 'Video Hochladen',
    nl: 'Video Uploaden',
    sv: 'Ladda Upp Video',
    no: 'Last Opp Video'
  },
  'vitrine.addImage': {
    pt: 'Adicionar Imagem',
    en: 'Add Image',
    es: 'Añadir Imagen',
    it: 'Aggiungi Immagine',
    fr: 'Ajouter Image',
    de: 'Bild Hinzufügen',
    nl: 'Afbeelding Toevoegen',
    sv: 'Lägg Till Bild',
    no: 'Legg Til Bilde'
  },
  'vitrine.actions': {
    pt: 'Ações',
    en: 'Actions',
    es: 'Acciones',
    it: 'Azioni',
    fr: 'Actions',
    de: 'Aktionen',
    nl: 'Acties',
    sv: 'Åtgärder',
    no: 'Handlinger'
  },
  'vitrine.image': {
    pt: 'Imagem',
    en: 'Image',
    es: 'Imagen',
    it: 'Immagine',
    fr: 'Image',
    de: 'Bild',
    nl: 'Afbeelding',
    sv: 'Bild',
    no: 'Bilde'
  },
  'vitrine.video': {
    pt: 'Vídeo',
    en: 'Video',
    es: 'Video',
    it: 'Video',
    fr: 'Vidéo',
    de: 'Video',
    nl: 'Video',
    sv: 'Video',
    no: 'Video'
  },
  
  // Notifications
  'notifications.loading': {
    pt: 'Carregando notificações...',
    en: 'Loading notifications...',
    es: 'Cargando notificaciones...',
    it: 'Caricamento notifiche...',
    fr: 'Chargement des notifications...',
    de: 'Benachrichtigungen laden...',
    nl: 'Meldingen laden...',
    sv: 'Laddar notifieringar...',
    no: 'Laster varsler...'
  },
  'notifications.empty': {
    pt: 'Nenhuma notificação',
    en: 'No notifications',
    es: 'Sin notificaciones',
    it: 'Nessuna notifica',
    fr: 'Aucune notification',
    de: 'Keine Benachrichtigungen',
    nl: 'Geen meldingen',
    sv: 'Inga notifieringar',
    no: 'Ingen varsler'
  },
  'notifications.clickToRemove': {
    pt: 'Clique para remover',
    en: 'Click to remove',
    es: 'Haz clic para eliminar',
    it: 'Clicca per rimuovere',
    fr: 'Cliquez pour supprimer',
    de: 'Klicken zum Entfernen',
    nl: 'Klik om te verwijderen',
    sv: 'Klicka för att ta bort',
    no: 'Klikk for å fjerne'
  },
  'notifications.credits': {
    pt: 'Créditos',
    en: 'Credits',
    es: 'Créditos',
    it: 'Crediti',
    fr: 'Crédits',
    de: 'Credits',
    nl: 'Credits',
    sv: 'Krediter',
    no: 'Kreditter'
  },
  'notifications.credits_plural': {
    pt: 'créditos',
    en: 'credits',
    es: 'créditos',
    it: 'crediti',
    fr: 'crédits',
    de: 'Credits',
    nl: 'credits',
    sv: 'krediter',
    no: 'kreditter'
  },
  'notifications.credit': {
    pt: 'crédito',
    en: 'credit',
    es: 'crédito',
    it: 'credito',
    fr: 'crédit',
    de: 'Credit',
    nl: 'credit',
    sv: 'kredit',
    no: 'kreditt'
  },
  
  // Palette
  'palette.configPalettes': {
    pt: 'Configurar Paletas',
    en: 'Configure Palettes',
    es: 'Configurar Paletas',
    it: 'Configura Tavolozze',
    fr: 'Configurer les Palettes',
    de: 'Paletten Konfigurieren',
    nl: 'Paletten Configureren',
    sv: 'Konfigurera Paletter',
    no: 'Konfigurer Paletter'
  },
  'palette.title': {
    pt: 'Configuração de Paletas',
    en: 'Palette Configuration',
    es: 'Configuración de Paletas',
    it: 'Configurazione Tavolozze',
    fr: 'Configuration des Palettes',
    de: 'Paletten-Konfiguration',
    nl: 'Palet Configuratie',
    sv: 'Palettkonfiguration',
    no: 'Palettkonfigurasjon'
  },
  'palette.basicPalettes': {
    pt: 'Paletas Básicas',
    en: 'Basic Palettes',
    es: 'Paletas Básicas',
    it: 'Tavolozze Base',
    fr: 'Palettes de Base',
    de: 'Basis-Paletten',
    nl: 'Basis Paletten',
    sv: 'Grundpaletter',
    no: 'Grunnpaletter'
  },
  'palette.homeActive': {
    pt: 'Modo Casa (Ativo)',
    en: 'Home Mode (Active)',
    es: 'Modo Casa (Activo)',
    it: 'Modalità Casa (Attiva)',
    fr: 'Mode Maison (Actif)',
    de: 'Heim-Modus (Aktiv)',
    nl: 'Thuis Modus (Actief)',
    sv: 'Hemläge (Aktiv)',
    no: 'Hjemmemodus (Aktiv)'
  },
  'palette.home': {
    pt: 'Modo Casa',
    en: 'Home Mode',
    es: 'Modo Casa',
    it: 'Modalità Casa',
    fr: 'Mode Maison',
    de: 'Heim-Modus',
    nl: 'Thuis Modus',
    sv: 'Hemläge',
    no: 'Hjemmemodus'
  },
  'palette.professionalActive': {
    pt: 'Modo Profissional (Ativo)',
    en: 'Professional Mode (Active)',
    es: 'Modo Profesional (Activo)',
    it: 'Modalità Professionale (Attiva)',
    fr: 'Mode Professionnel (Actif)',
    de: 'Profi-Modus (Aktiv)',
    nl: 'Professionele Modus (Actief)',
    sv: 'Professionellt Läge (Aktiv)',
    no: 'Profesjonell Modus (Aktiv)'
  },
  'palette.professional': {
    pt: 'Modo Profissional',
    en: 'Professional Mode',
    es: 'Modo Profesional',
    it: 'Modalità Professionale',
    fr: 'Mode Professionnel',
    de: 'Profi-Modus',
    nl: 'Professionele Modus',
    sv: 'Professionellt Läge',
    no: 'Profesjonell Modus'
  },
  'palette.ecommerceActive': {
    pt: 'Modo E-commerce (Ativo)',
    en: 'E-commerce Mode (Active)',
    es: 'Modo E-commerce (Activo)',
    it: 'Modalità E-commerce (Attiva)',
    fr: 'Mode E-commerce (Actif)',
    de: 'E-Commerce-Modus (Aktiv)',
    nl: 'E-commerce Modus (Actief)',
    sv: 'E-handelsläge (Aktiv)',
    no: 'E-handelsmodus (Aktiv)'
  },
  'palette.ecommerce': {
    pt: 'Modo E-commerce',
    en: 'E-commerce Mode',
    es: 'Modo E-commerce',
    it: 'Modalità E-commerce',
    fr: 'Mode E-commerce',
    de: 'E-Commerce-Modus',
    nl: 'E-commerce Modus',
    sv: 'E-handelsläge',
    no: 'E-handelsmodus'
  },
  'palette.fireActive': {
    pt: 'Modo Fire (Ativo)',
    en: 'Fire Mode (Active)',
    es: 'Modo Fuego (Activo)',
    it: 'Modalità Fuoco (Attiva)',
    fr: 'Mode Feu (Actif)',
    de: 'Feuer-Modus (Aktiv)',
    nl: 'Vuur Modus (Actief)',
    sv: 'Eldläge (Aktiv)',
    no: 'Ildmodus (Aktiv)'
  },
  'palette.fire': {
    pt: 'Modo Fire',
    en: 'Fire Mode',
    es: 'Modo Fuego',
    it: 'Modalità Fuoco',
    fr: 'Mode Feu',
    de: 'Feuer-Modus',
    nl: 'Vuur Modus',
    sv: 'Eldläge',
    no: 'Ildmodus'
  },
  'palette.simpleColors': {
    pt: 'Cores Simples',
    en: 'Simple Colors',
    es: 'Colores Simples',
    it: 'Colori Semplici',
    fr: 'Couleurs Simples',
    de: 'Einfache Farben',
    nl: 'Eenvoudige Kleuren',
    sv: 'Enkla Färger',
    no: 'Enkle Farger'
  }
};

// Contexto para idioma
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Detectar idioma preferido ou usar inglês como padrão
    const saved = localStorage.getItem('preferred-language');
    return (saved as Language) || 'en';
  });

  // Salvar idioma preferido
  useEffect(() => {
    localStorage.setItem('preferred-language', language);
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[key];
    return translation ? translation[language] : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Followers system translations
const followersTranslations = {
  'followers.title': {
    pt: 'Seguidores',
    en: 'Followers',
    es: 'Seguidores'
  },
  'followers.follow': {
    pt: 'Seguir',
    en: 'Follow',
    es: 'Seguir'
  },
  'followers.unfollow': {
    pt: 'Deixar de seguir',
    en: 'Unfollow',
    es: 'Dejar de seguir'
  },
  'followers.noFollowers': {
    pt: 'Nenhum seguidor ainda',
    en: 'No followers yet',
    es: 'Aún no hay seguidores'
  },
  'followers.loadingFollowers': {
    pt: 'Carregando seguidores...',
    en: 'Loading followers...',
    es: 'Cargando seguidores...'
  },
  'followers.viewProfile': {
    pt: 'Ver Perfil',
    en: 'View Profile',
    es: 'Ver Perfil'
  },
  'followers.loginToFollow': {
    pt: 'Faça login para seguir criadores',
    en: 'Login to follow creators',
    es: 'Inicia sesión para seguir creadores'
  },
  'followers.cannotFollowSelf': {
    pt: 'Você não pode seguir a si mesmo',
    en: 'You cannot follow yourself',
    es: 'No puedes seguirte a ti mismo'
  },
  'followers.unfollowSuccess': {
    pt: 'Você parou de seguir este criador',
    en: 'You unfollowed this creator',
    es: 'Dejaste de seguir a este creador'
  },
  'followers.followSuccess': {
    pt: 'Agora você está seguindo este criador!',
    en: 'Now you are following this creator!',
    es: '¡Ahora estás siguiendo a este creador!'
  },
  'followers.errorToggle': {
    pt: 'Erro ao processar ação',
    en: 'Error processing action',
    es: 'Error al procesar acción'
  },
  'followers.errorLoad': {
    pt: 'Erro ao carregar seguidores',
    en: 'Error loading followers',
    es: 'Error al cargar seguidores'
  }
};