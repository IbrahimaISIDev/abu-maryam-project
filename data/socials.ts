export interface SocialLink {
  id: "telegram" | "telegram-group" | "facebook" | "youtube" | "whatsapp" | "tiktok";
  label: string;
  href: string;
}

// Liens réels fournis par l'équipe — ne pas inventer d'URL ici.
// WhatsApp et TikTok restent à renseigner.
export const socialLinks: SocialLink[] = [
  {
    id: "telegram",
    label: "Telegram",
    href: "https://t.me/waxtaanimamniangmbaye",
  },
  {
    id: "telegram-group",
    label: "Groupe Telegram",
    href: "https://t.me/+UBSZClauopToLcuv",
  },
  {
    id: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/share/1AsXZQfNVN/",
  },
  {
    id: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/@oustazniangmbayetvofficiel6251",
  },
];
