export const TRACE_COLORS = {
  black: "#050606",
  graphite: "#101313",
  surface: "#171B1B",
  surfaceRaised: "#202625",
  border: "#2D3533",
  silver: "#F1F3F0",
  muted: "#A4AEAA",
  quiet: "#6F7A76",
  accent: "#8FE3C2",
  accentDim: "#25483C",
  warning: "#E5B77A",
} as const;

export const DEVELOPER = {
  name: "Nitin Kumar",
  credit: "Built by Nitin Kumar",
  copyright: "© 2026 Nitin Kumar",
  bio: "A nursing student building useful software in the margins between study, care and curiosity.",
  supportWhy: "Voluntary support helps fund nursing studies, development resources, device testing and continued project development.",
  website: "https://portfolio-blush-three-98.vercel.app/",
  instagram: "https://instagram.com/odincalm0",
  linkedin: "https://www.linkedin.com/in/nitin-kumar-35a0a7279",
  email: "mailto:odincalm@proton.me",
  github: "https://github.com/odincalm",
  profileSourcePage: "https://ibb.co/KcspXxbW",
  profileDirectImage: "https://i.ibb.co/rKpRm2FH/nitin.png",
} as const;

export const PAYMENTS = {
  upiId: "bholanitin308@okicici",
  wiseLink: "https://wise.com/pay/business/nitinkumar34?utm_source=quick_pay",
  wiseQrSourcePage: "https://ibb.co/nNBB06vk",
  wiseQrDirectImage: "https://i.ibb.co/0RKKXmSJ/wise.jpg",
  upiQrSourcePage: "https://ibb.co/HyWT8xY",
  upiQrDirectImage: "https://i.ibb.co/1NDGWdK/qr.jpg",
  internationalGuidance: "International donations: Please send more than US$5 and less than US$10,000. Check the payment provider's restrictions before completing your donation. Transactions outside this range may not be accepted and are subject to the provider's refund process.",
} as const;

export type AssetStatus = "placeholder" | "verified";

export const REQUIRED_ASSETS = {
  profile: { key: "profile", label: "Developer profile photo", localPath: "assets/images/developer-profile.png", sourcePage: DEVELOPER.profileSourcePage, status: "placeholder" as AssetStatus },
  upiQr: { key: "upiQr", label: "Verified UPI QR", localPath: "assets/images/upi-qr.jpg", sourcePage: PAYMENTS.upiQrSourcePage, status: "placeholder" as AssetStatus },
  wiseQr: { key: "wiseQr", label: "Wise QR", localPath: "assets/images/wise-qr.jpg", sourcePage: PAYMENTS.wiseQrSourcePage, status: "placeholder" as AssetStatus },
} as const;

export const TAB_LABELS = ["Home", "Timeline", "Capture", "Collections", "Settings"] as const;
