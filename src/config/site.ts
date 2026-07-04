export const siteConfig = {
  name: "Beyond School PPDB",
  description: "Penerimaan Peserta Didik Baru - Beyond School",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/images/og.png",
  links: {
    twitter: "https://twitter.com/beyondschool",
    github: "https://github.com/beyondschool",
  },
};

export type SiteConfig = typeof siteConfig;
