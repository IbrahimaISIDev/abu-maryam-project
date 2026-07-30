/** Lien WhatsApp vers un contact précis (numéro nettoyé des espaces/tirets/parenthèses/+). */
export function buildWhatsAppContactLink(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, "").replace(/^\+/, "");
  return `https://wa.me/${cleaned}`;
}

/** Lien WhatsApp de partage avec un texte pré-rempli (pas de destinataire précis). */
export function buildWhatsAppShareLink(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
