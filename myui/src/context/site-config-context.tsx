import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../lib/api";

export interface SiteConfig {
  hero: {
    titleAr: string;
    titleEn: string;
    subtitleAr: string;
    subtitleEn: string;
    primaryButtonAr: string;
    primaryButtonEn: string;
    secondaryButtonAr: string;
    secondaryButtonEn: string;
  };
  stats: {
    labelAr: string;
    labelEn: string;
    value: string;
  }[];
  features: {
    titleAr: string;
    titleHighlightAr: string;
    titleEn: string;
    titleHighlightEn: string;
    subtitleAr: string;
    subtitleEn: string;
    items: {
      iconName: string;
      titleAr: string;
      titleEn: string;
      descriptionAr: string;
      descriptionEn: string;
    }[];
  };
  cta: {
    titleAr: string;
    titleEn: string;
    titleHighlightAr: string;
    titleHighlightEn: string;
    buttonAr: string;
    buttonEn: string;
  };
  navbar: {
    logoInitialAr: string;
    logoInitialEn: string;
    logoTitleAr: string;
    logoTitleEn: string;
    customerServiceAr: string;
    customerServiceEn: string;
  };
  footer: {
    companyNameAr: string;
    companyNameEn: string;
    descriptionAr: string;
    descriptionEn: string;
    copyrightAr: string;
    copyrightEn: string;
    madeWithAr: string;
    madeWithEn: string;
  };
  systems: {
    sectionLabelAr: string;
    sectionLabelEn: string;
    titleAr: string;
    titleEn: string;
    titleHighlightAr: string;
    titleHighlightEn: string;
    subtitleAr: string;
    subtitleEn: string;
    ctaAr: string;
    ctaEn: string;
    viewAllAr: string;
    viewAllEn: string;
  };
  appearance: {
    primaryColor: string;
    accentColor: string;
    showSupportButton: boolean;
    announcementAr: string;
    announcementEn: string;
    showAnnouncement: boolean;
  };
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    addressAr: string;
    addressEn: string;
    websiteUrl: string;
    socials: {
      facebook: string;
      twitter: string;
      instagram: string;
      linkedin: string;
    };
  };
  integrations?: {
    telegram?: {
      botToken?: string;
      chatId?: string;
      enabled?: boolean;
    };
  };
}

const defaultConfig: SiteConfig = {
  hero: {
    titleAr: "وفر الوقت والمال وزد من مستوى مبيعاتك",
    titleEn: "Save Time and Money and Boost Your Sales",
    subtitleAr: "مع تطبيقات العسكريان لإدارة شركات التوزيع",
    subtitleEn: "With Alaskarian applications for distribution companies management",
    primaryButtonAr: "ابدأ الآن",
    primaryButtonEn: "Get Started",
    secondaryButtonAr: "تعرف علينا",
    secondaryButtonEn: "Learn More",
  },
  stats: [
    { labelAr: "عميل نشط", labelEn: "Active Client", value: "1500+" },
    { labelAr: "نظام مفعل", labelEn: "Active System", value: "45" },
    { labelAr: "دعم فني", labelEn: "Support", value: "24/7" },
  ],
  features: {
    titleAr: "لماذا تختار",
    titleHighlightAr: "العسكريان",
    titleEn: "Why Choose",
    titleHighlightEn: "Alaskarian",
    subtitleAr: "نقدم قيمة استثنائية من خلال التزامنا بالجودة والابتكار ونجاح العملاء",
    subtitleEn: "We provide exceptional value through our commitment to quality, innovation, and customer success",
    items: [
      {
        iconName: "Shield",
        titleAr: "موثوق وآمن",
        titleEn: "Reliable & Secure",
        descriptionAr: "أمان على مستوى المؤسسات مع ضمان وقت تشغيل 99.9% لراحة بالك",
        descriptionEn: "Enterprise-grade security with 99.9% uptime guarantee for your peace of mind",
      },
      {
        iconName: "Zap",
        titleAr: "سرعة فائقة",
        titleEn: "Lightning Fast",
        descriptionAr: "أداء محسن يضمن أوقات استجابة سريعة عبر جميع أنظمتنا",
        descriptionEn: "Optimized performance ensuring quick response times across all our systems",
      },
      {
        iconName: "Clock",
        titleAr: "دعم 24/7",
        titleEn: "24/7 Support",
        descriptionAr: "فريق دعم فني على مدار الساعة جاهز لمساعدتك في أي وقت",
        descriptionEn: "Round-the-clock technical support team ready to assist you anytime",
      },
      {
        iconName: "Headphones",
        titleAr: "تدريب متخصص",
        titleEn: "Expert Training",
        descriptionAr: "برامج تدريبية شاملة لمساعدة فريقك على إتقان أنظمتنا",
        descriptionEn: "Comprehensive training programs to help your team master our systems",
      },
      {
        iconName: "Cloud",
        titleAr: "قائم على السحابة",
        titleEn: "Cloud-Based",
        descriptionAr: "الوصول إلى بياناتك من أي مكان مع بنيتنا التحتية السحابية الآمنة",
        descriptionEn: "Access your data anywhere with our secure cloud infrastructure",
      },
      {
        iconName: "Lock",
        titleAr: "خصوصية البيانات",
        titleEn: "Data Privacy",
        descriptionAr: "بياناتك محمية بتشفير متقدم وسياسات خصوصية صارمة",
        descriptionEn: "Your data is protected with advanced encryption and strict privacy policies",
      }
    ]
  },
  cta: {
    titleAr: "اصنع نظامك",
    titleEn: "Create Your Own",
    titleHighlightAr: "الخاص!",
    titleHighlightEn: "System!",
    buttonAr: "انضم الآن",
    buttonEn: "Join Now"
  },
  navbar: {
    logoInitialAr: "ع",
    logoInitialEn: "A",
    logoTitleAr: "العسكريان للحلول البرمجية",
    logoTitleEn: "Alaskarian Tech",
    customerServiceAr: "خدمة العملاء",
    customerServiceEn: "Customer Service"
  },
  footer: {
    companyNameAr: "العسكريان للحلول البرمجية",
    companyNameEn: "Alaskarian Tech",
    descriptionAr: "مزود رائد للحلول البرمجية متخصص في إدارة التوزيع وأتمتة المبيعات وأنظمة ذكاء الأعمال.",
    descriptionEn: "Leading software solutions provider specializing in distribution management, sales automation, and business intelligence systems.",
    copyrightAr: "جميع الحقوق محفوظة.",
    copyrightEn: "All rights reserved.",
    madeWithAr: "صُنع بإتقان في العراق",
    madeWithEn: "Made with excellence in Iraq"
  },
  systems: {
    sectionLabelAr: "قسم الأنظمة",
    sectionLabelEn: "Systems Section",
    titleAr: "أنظمة",
    titleEn: "Al-Askaryan",
    titleHighlightAr: "العسكريان",
    titleHighlightEn: "Systems",
    subtitleAr: "تنظم أعمالك مهما يكون نوع عملك",
    subtitleEn: "Organize your business no matter what type of work you do",
    ctaAr: "اصنع نظامك",
    ctaEn: "Build Your System",
    viewAllAr: "عرض الكل",
    viewAllEn: "View All"
  },
  appearance: {
    primaryColor: "#0891b2", // cyan-600
    accentColor: "#2563eb", // blue-600
    showSupportButton: true,
    announcementAr: "بدأ العرض الصيفي! خصم 20% على جميع الأنظمة",
    announcementEn: "Summer offer started! 20% off on all systems",
    showAnnouncement: true,
  },
  contact: {
    email: "info@alaskarian.com",
    phone: "5252",
    whatsapp: "9647700000000",
    addressAr: "العراق، سامراء",
    addressEn: "Samarra, Iraq",
    websiteUrl: "/location",
    socials: {
      facebook: "https://facebook.com",
      twitter: "https://x.com",
      instagram: "https://instagram.com",
      linkedin: "https://linkedin.com",
    },
  },
  integrations: {
    telegram: {
      botToken: "",
      chatId: "",
      enabled: false
    }
  }
};

interface SiteConfigContextType {
  config: SiteConfig;
  updateConfig: (newConfig: Partial<SiteConfig>) => void;
  resetConfig: () => void;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

export interface SiteConfigProviderProps {
  children: React.ReactNode
  skipRemoteLoad?: boolean
  initialConfig?: Partial<SiteConfig>
  loadingMessage?: string
}

export function SiteConfigProvider({
  children,
  skipRemoteLoad = false,
  initialConfig,
  loadingMessage = "جاري تحميل لوحة التحكم...",
}: SiteConfigProviderProps) {
  const [config, setConfig] = useState<SiteConfig>({
    ...defaultConfig,
    ...initialConfig,
    hero: { ...defaultConfig.hero, ...initialConfig?.hero },
    features: { ...defaultConfig.features, ...initialConfig?.features },
    cta: { ...defaultConfig.cta, ...initialConfig?.cta },
    navbar: { ...defaultConfig.navbar, ...initialConfig?.navbar },
    footer: { ...defaultConfig.footer, ...initialConfig?.footer },
    systems: { ...defaultConfig.systems, ...initialConfig?.systems },
    appearance: { ...defaultConfig.appearance, ...initialConfig?.appearance },
    contact: {
      ...defaultConfig.contact,
      ...initialConfig?.contact,
      socials: {
        ...defaultConfig.contact.socials,
        ...initialConfig?.contact?.socials,
      },
    },
    integrations: {
      ...defaultConfig.integrations,
      ...initialConfig?.integrations,
      telegram: {
        ...defaultConfig.integrations?.telegram,
        ...initialConfig?.integrations?.telegram,
      },
    },
  });
  const [isLoading, setIsLoading] = useState(!skipRemoteLoad);

  useEffect(() => {
    if (skipRemoteLoad) return;

    apiFetch("/api/config")
      .then(res => res.json())
      .then(data => {
        if (data && data.hero) {
          setConfig({
            ...defaultConfig,
            ...data,
            hero: { ...defaultConfig.hero, ...data.hero },
            features: { ...defaultConfig.features, ...data.features },
            cta: { ...defaultConfig.cta, ...(data.cta || {}) },
            navbar: { ...defaultConfig.navbar, ...(data.navbar || {}) },
            footer: { ...defaultConfig.footer, ...(data.footer || {}) },
            systems: { ...defaultConfig.systems, ...(data.systems || {}) },
            appearance: { ...defaultConfig.appearance, ...(data.appearance || {}) },
            contact: {
              ...defaultConfig.contact,
              ...data.contact,
              socials: {
                ...defaultConfig.contact.socials,
                ...(data.contact?.socials || {}),
              },
            },
            stats: Array.isArray(data.stats) ? data.stats : defaultConfig.stats,
            integrations: {
              ...defaultConfig.integrations,
              ...(data.integrations || {}),
              telegram: {
                ...defaultConfig.integrations?.telegram,
                ...(data.integrations?.telegram || {}),
              },
            },
          });
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load config from DB", err);
        setIsLoading(false);
      });
  }, [skipRemoteLoad]);

  const updateConfig = async (newConfig: Partial<SiteConfig>) => {
    const updated = { ...config, ...newConfig };
    try {
      const response = await apiFetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (response.ok) {
        setConfig(updated);
      }
    } catch (err) {
      console.error("Failed to update config in DB", err);
    }
  };

  const resetConfig = async () => {
    await updateConfig(defaultConfig);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-white font-bold text-2xl">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="animate-pulse font-cairo">{loadingMessage}</div>
      </div>
    );
  }

  return (
    <SiteConfigContext.Provider value={{ config, updateConfig, resetConfig }}>
      {children}
    </SiteConfigContext.Provider>
  );
}


export function useSiteConfig() {
  const context = useContext(SiteConfigContext);
  if (context === undefined) {
    throw new Error("useSiteConfig must be used within a SiteConfigProvider");
  }
  return context;
}
