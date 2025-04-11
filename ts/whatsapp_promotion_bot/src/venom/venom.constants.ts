export const VENOM_CONTACTS = process.env.VENOM_CONTACTS?.split(',') ?? [];

export const DEFAULT_MESSAGE = `
  🛍️ *Super Promoções! Chinelo Nuvem!* 🛍️🔥
  🩴 *Chinelo Nuvem*
  De *R$ 34,90* por apenas *R$ 29,70*!
  ✅ Extremamente macio e confortável
  ✅ Design moderno e estiloso
  ✅ Ideal para relaxar em casa ou no dia a dia
  📌 *Garanta já o seu:* 👉 ${process.env.VENOM_LINK}
  🚀 *Estoque limitado! Aproveite antes que acabe!* 💨
`;
