// Types for educational content
export interface AnatomicalContent {
  id: string;
  name: {
    en: string;
    fil: string;
  };
  shortDescription: {
    en: string;
    fil: string;
  };
  detailedDescription: {
    en: string;
    fil: string;
  };
  functions: {
    en: string[];
    fil: string[];
  };
  parts: AnatomicalPart[];
  facts: {
    en: string[];
    fil: string[];
  };
  audioUrls?: {
    en?: string;
    fil?: string;
  };
}

export interface AnatomicalPart {
  id: string;
  name: {
    en: string;
    fil: string;
  };
  description: {
    en: string;
    fil: string;
  };
  position: {
    x: number;
    y: number;
    z: number;
  };
  labelOffset: {
    x: number;
    y: number;
  };
}

// Educational content for all organs
export const anatomicalData: Record<string, AnatomicalContent> = {
  heart: {
    id: "heart",
    name: {
      en: "Heart",
      fil: "Puso"
    },
    shortDescription: {
      en: "A muscular organ that pumps blood throughout your body",
      fil: "Isang organ na kalamang na nagbobomba ng dugo sa buong katawan"
    },
    detailedDescription: {
      en: "The heart is a vital organ that acts as a pump to circulate blood throughout the body. It has four chambers: two atria (upper chambers) and two ventricles (lower chambers). The heart beats about 100,000 times per day, pumping approximately 2,000 gallons of blood.",
      fil: "Ang puso ay isang mahalagang organ na kumikilos bilang bomba upang iikot ang dugo sa buong katawan. May apat itong silid: dalawang atria (itaas na mga silid) at dalawang ventricles (ibabang mga silid). Ang puso ay tumitibok ng humigit-kumulang 100,000 beses sa isang araw, na nagbobomba ng humigit-kumulang 2,000 gallon ng dugo."
    },
    functions: {
      en: [
        "Pumps oxygenated blood to body tissues",
        "Returns deoxygenated blood to the lungs",
        "Maintains blood circulation",
        "Regulates blood pressure"
      ],
      fil: [
        "Nagbobomba ng may-oxygen na dugo sa mga tisyu ng katawan",
        "Nagbabalik ng walang-oxygen na dugo sa mga baga",
        "Pinapanatili ang sirkulasyon ng dugo",
        "Nireregulate ang presyon ng dugo"
      ]
    },
    parts: [
      {
        id: "left_ventricle",
        name: {
          en: "Left Ventricle",
          fil: "Kaliwang Ventricle"
        },
        description: {
          en: "The strongest chamber that pumps oxygen-rich blood to the body",
          fil: "Ang pinakamalakas na silid na nagbobomba ng mayamang-oxygen na dugo sa katawan"
        },
        position: { x: -0.5, y: -0.3, z: 0 },
        labelOffset: { x: -100, y: 50 }
      },
      {
        id: "right_ventricle",
        name: {
          en: "Right Ventricle",
          fil: "Kanang Ventricle"
        },
        description: {
          en: "Pumps deoxygenated blood to the lungs for oxygenation",
          fil: "Nagbobomba ng walang-oxygen na dugo sa mga baga para sa pagkakakuha ng oxygen"
        },
        position: { x: 0.5, y: -0.3, z: 0 },
        labelOffset: { x: 100, y: 50 }
      },
      {
        id: "left_atrium",
        name: {
          en: "Left Atrium",
          fil: "Kaliwang Atrium"
        },
        description: {
          en: "Receives oxygen-rich blood from the lungs",
          fil: "Tumatanggap ng mayamang-oxygen na dugo mula sa mga baga"
        },
        position: { x: -0.3, y: 0.4, z: 0 },
        labelOffset: { x: -80, y: -50 }
      },
      {
        id: "right_atrium",
        name: {
          en: "Right Atrium",
          fil: "Kanang Atrium"
        },
        description: {
          en: "Receives deoxygenated blood from the body",
          fil: "Tumatanggap ng walang-oxygen na dugo mula sa katawan"
        },
        position: { x: 0.3, y: 0.4, z: 0 },
        labelOffset: { x: 80, y: -50 }
      }
    ],
    facts: {
      en: [
        "Your heart beats about 100,000 times per day",
        "The heart is about the size of your fist",
        "A healthy heart pumps about 2,000 gallons of blood daily",
        "The heart has its own electrical system"
      ],
      fil: [
        "Ang inyong puso ay tumitibok ng humigit-kumulang 100,000 beses sa isang araw",
        "Ang puso ay halos kasing laki ng inyong kamao",
        "Ang malusog na puso ay nagbobomba ng humigit-kumulang 2,000 gallon ng dugo araw-araw",
        "Ang puso ay may sariling sistema ng kuryente"
      ]
    }
  },

  brain: {
    id: "brain",
    name: {
      en: "Brain",
      fil: "Utak"
    },
    shortDescription: {
      en: "The control center of your body that manages thoughts, movements, and emotions",
      fil: "Ang sentro ng kontrol ng inyong katawan na namamahala sa mga iniisip, galaw, at damdamin"
    },
    detailedDescription: {
      en: "The brain is the most complex organ in the human body. It contains approximately 86 billion neurons that communicate through trillions of connections. The brain controls all bodily functions, processes information, stores memories, and enables consciousness and thought.",
      fil: "Ang utak ay ang pinakakomplikadong organ sa katawan ng tao. Naglalaman ito ng humigit-kumulang 86 bilyong neurons na nakikipag-ugnayan sa pamamagitan ng mga trilyong koneksyon. Kinokontrol ng utak ang lahat ng pag-andar ng katawan, pinoproseso ang impormasyon, nag-iimbak ng mga alaala, at nagbibigay-daan sa kamalayan at pag-iisip."
    },
    functions: {
      en: [
        "Controls thought and reasoning",
        "Manages movement and coordination",
        "Processes sensory information",
        "Stores and retrieves memories",
        "Regulates emotions and behavior"
      ],
      fil: [
        "Kinokontrol ang pag-iisip at pagkakamatwiran",
        "Pinapamahalaan ang paggalaw at koordinasyon",
        "Pinoproseso ang impormasyon mula sa mga pandama",
        "Nag-iimbak at kumukuha ng mga alaala",
        "Nireregulate ang mga emosyon at pag-uugali"
      ]
    },
    parts: [
      {
        id: "cerebrum",
        name: {
          en: "Cerebrum",
          fil: "Cerebrum"
        },
        description: {
          en: "The largest part of the brain responsible for thinking and voluntary movements",
          fil: "Ang pinakamalaking bahagi ng utak na responsable sa pag-iisip at kusang mga galaw"
        },
        position: { x: 0, y: 0.3, z: 0 },
        labelOffset: { x: -120, y: -40 }
      },
      {
        id: "cerebellum",
        name: {
          en: "Cerebellum",
          fil: "Cerebellum"
        },
        description: {
          en: "Controls balance, coordination, and fine motor movements",
          fil: "Kumokontrol sa balanse, koordinasyon, at pinong mga galaw"
        },
        position: { x: 0, y: -0.4, z: -0.3 },
        labelOffset: { x: 100, y: 60 }
      },
      {
        id: "brainstem",
        name: {
          en: "Brain Stem",
          fil: "Brainstem"
        },
        description: {
          en: "Controls vital functions like breathing, heart rate, and blood pressure",
          fil: "Kumokontrol sa mahahalagang pag-andar tulad ng paghinga, tibok ng puso, at presyon ng dugo"
        },
        position: { x: 0, y: -0.6, z: 0 },
        labelOffset: { x: 0, y: 80 }
      }
    ],
    facts: {
      en: [
        "The brain uses about 20% of your body's energy",
        "You have about 86 billion brain cells",
        "The brain generates about 12-25 watts of electricity",
        "Your brain is about 75% water"
      ],
      fil: [
        "Ginagamit ng utak ang humigit-kumulang 20% ng enerhiya ng inyong katawan",
        "Mayroon kayong humigit-kumulang 86 bilyong brain cells",
        "Ang utak ay gumagawa ng humigit-kumulang 12-25 watts ng kuryente",
        "Ang inyong utak ay humigit-kumulang 75% tubig"
      ]
    }
  },

  lungs: {
    id: "lungs",
    name: {
      en: "Lungs",
      fil: "Baga"
    },
    shortDescription: {
      en: "Organs responsible for breathing and gas exchange",
      fil: "Mga organ na responsable sa paghinga at palitan ng gas"
    },
    detailedDescription: {
      en: "The lungs are a pair of spongy, air-filled organs located on either side of the chest. They are responsible for the exchange of oxygen and carbon dioxide between the air we breathe and our blood. Each lung contains millions of tiny air sacs called alveoli where gas exchange occurs.",
      fil: "Ang mga baga ay pares ng malambot at puno ng hangin na mga organ na matatagpuan sa magkabilang gilid ng dibdib. Responsable ang mga ito sa palitan ng oxygen at carbon dioxide sa pagitan ng hangin na aming nilalanghap at ng aming dugo. Ang bawat baga ay naglalaman ng milyun-milyong maliliit na air sacs na tinatawag na alveoli kung saan nangyayari ang palitan ng gas."
    },
    functions: {
      en: [
        "Brings oxygen into the body",
        "Removes carbon dioxide from the blood",
        "Helps regulate blood pH",
        "Filters small particles from the air"
      ],
      fil: [
        "Nagdadala ng oxygen sa katawan",
        "Nag-aalis ng carbon dioxide mula sa dugo",
        "Tumutulong sa pag-regulate ng pH ng dugo",
        "Nagsasala ng maliliit na particle mula sa hangin"
      ]
    },
    parts: [
      {
        id: "left_lung",
        name: {
          en: "Left Lung",
          fil: "Kaliwang Baga"
        },
        description: {
          en: "Has two lobes and is slightly smaller to make room for the heart",
          fil: "May dalawang lobe at bahagyang mas maliit upang magbigay ng lugar para sa puso"
        },
        position: { x: -0.4, y: 0, z: 0 },
        labelOffset: { x: -120, y: 0 }
      },
      {
        id: "right_lung",
        name: {
          en: "Right Lung",
          fil: "Kanang Baga"
        },
        description: {
          en: "Has three lobes and is slightly larger than the left lung",
          fil: "May tatlong lobe at bahagyang mas malaki kaysa sa kaliwang baga"
        },
        position: { x: 0.4, y: 0, z: 0 },
        labelOffset: { x: 120, y: 0 }
      },
      {
        id: "bronchi",
        name: {
          en: "Bronchi",
          fil: "Bronchi"
        },
        description: {
          en: "Main airways that branch from the trachea into each lung",
          fil: "Pangunahing daanan ng hangin na nagsasanga mula sa trachea papunta sa bawat baga"
        },
        position: { x: 0, y: 0.3, z: 0 },
        labelOffset: { x: 0, y: -60 }
      }
    ],
    facts: {
      en: [
        "You breathe about 20,000 times per day",
        "Your lungs contain about 300 million alveoli",
        "The surface area of your lungs is about the size of a tennis court",
        "You can survive with just one lung"
      ],
      fil: [
        "Humihinga kayo ng humigit-kumulang 20,000 beses sa isang araw",
        "Ang inyong mga baga ay naglalaman ng humigit-kumulang 300 milyong alveoli",
        "Ang surface area ng inyong mga baga ay halos kasing laki ng tennis court",
        "Maaari kayong mabuhay kahit may isang baga lamang"
      ]
    }
  },

  kidney: {
    id: "kidney",
    name: {
      en: "Kidneys",
      fil: "Bato"
    },
    shortDescription: {
      en: "Bean-shaped organs that filter waste and excess water from your blood",
      fil: "Mga organ na hugis-sitaw na nagsasala ng basura at sobrang tubig mula sa inyong dugo"
    },
    detailedDescription: {
      en: "The kidneys are a pair of bean-shaped organs that filter waste products and excess water from the blood to form urine. They also help regulate blood pressure, produce red blood cells, and maintain the body's chemical balance. Each kidney contains about one million filtering units called nephrons.",
      fil: "Ang mga bato ay pares ng mga organ na hugis-sitaw na nagsasala ng mga basurang produkto at sobrang tubig mula sa dugo upang mabuo ang ihi. Tumutulong din ang mga ito sa pag-regulate ng presyon ng dugo, paggawa ng mga pulang selula ng dugo, at pagpapanatili ng balanse ng kemikal sa katawan. Ang bawat bato ay naglalaman ng humigit-kumulang isang milyong filtering units na tinatawag na nephrons."
    },
    functions: {
      en: [
        "Filters waste from the blood",
        "Regulates blood pressure",
        "Produces red blood cells",
        "Maintains electrolyte balance",
        "Controls acid-base balance"
      ],
      fil: [
        "Nagsasala ng basura mula sa dugo",
        "Nireregulate ang presyon ng dugo",
        "Gumagawa ng mga pulang selula ng dugo",
        "Pinapanatili ang balanse ng electrolyte",
        "Kinokontrol ang balanse ng acid-base"
      ]
    },
    parts: [
      {
        id: "left_kidney",
        name: {
          en: "Left Kidney",
          fil: "Kaliwang Bato"
        },
        description: {
          en: "Filters blood and produces urine, positioned slightly higher than the right kidney",
          fil: "Nagsasala ng dugo at gumagawa ng ihi, nakaposisyon na bahagyang mas mataas kaysa sa kanang bato"
        },
        position: { x: -0.3, y: 0.2, z: 0 },
        labelOffset: { x: -100, y: -50 }
      },
      {
        id: "right_kidney",
        name: {
          en: "Right Kidney",
          fil: "Kanang Bato"
        },
        description: {
          en: "Filters blood and produces urine, positioned slightly lower due to the liver",
          fil: "Nagsasala ng dugo at gumagawa ng ihi, nakaposisyon na bahagyang mas mababa dahil sa atay"
        },
        position: { x: 0.3, y: 0, z: 0 },
        labelOffset: { x: 100, y: -50 }
      },
      {
        id: "nephrons",
        name: {
          en: "Nephrons",
          fil: "Nephrons"
        },
        description: {
          en: "Microscopic filtering units within each kidney",
          fil: "Mga mikroskopikong filtering units sa loob ng bawat bato"
        },
        position: { x: 0, y: 0, z: 0 },
        labelOffset: { x: 0, y: 80 }
      }
    ],
    facts: {
      en: [
        "Your kidneys filter about 50 gallons of blood daily",
        "Each kidney has about 1 million nephrons",
        "Kidneys produce about 1-2 liters of urine per day",
        "You can live normally with one healthy kidney"
      ],
      fil: [
        "Ang inyong mga bato ay nagsasala ng humigit-kumulang 50 gallon ng dugo araw-araw",
        "Ang bawat bato ay may humigit-kumulang 1 milyong nephrons",
        "Ang mga bato ay gumagawa ng humigit-kumulang 1-2 litro ng ihi bawat araw",
        "Maaari kayong mamuhay nang normal kahit may isang malusog na bato lamang"
      ]
    }
  },

  skin: {
    id: "skin",
    name: {
      en: "Skin",
      fil: "Balat"
    },
    shortDescription: {
      en: "The largest organ that protects your body and regulates temperature",
      fil: "Ang pinakamalaking organ na nagpoprotekta sa inyong katawan at nireregulate ang temperatura"
    },
    detailedDescription: {
      en: "The skin is the largest organ of the human body, covering the entire external surface. It consists of three main layers: the epidermis (outer layer), dermis (middle layer), and hypodermis (deepest layer). The skin serves as a protective barrier, regulates body temperature, and contains sensory receptors.",
      fil: "Ang balat ay ang pinakamalaking organ ng katawan ng tao, na sumasaklaw sa buong panlabas na ibabaw. Binubuo ito ng tatlong pangunahing layer: ang epidermis (panlabas na layer), dermis (gitnang layer), at hypodermis (pinakamalalim na layer). Ang balat ay nagsisilbing protective barrier, nireregulate ang temperatura ng katawan, at naglalaman ng mga sensory receptors."
    },
    functions: {
      en: [
        "Protects against infections and injuries",
        "Regulates body temperature",
        "Prevents water loss",
        "Produces vitamin D",
        "Provides sensory information"
      ],
      fil: [
        "Nagpoprotekta laban sa mga impeksyon at pinsala",
        "Nireregulate ang temperatura ng katawan",
        "Pinipigilan ang pagkawala ng tubig",
        "Gumagawa ng vitamin D",
        "Nagbibigay ng impormasyon mula sa mga pandama"
      ]
    },
    parts: [
      {
        id: "epidermis",
        name: {
          en: "Epidermis",
          fil: "Epidermis"
        },
        description: {
          en: "The outermost layer that provides waterproofing and protection",
          fil: "Ang pinakamataas na layer na nagbibigay ng waterproofing at proteksyon"
        },
        position: { x: 0, y: 0.4, z: 0.5 },
        labelOffset: { x: -100, y: -60 }
      },
      {
        id: "dermis",
        name: {
          en: "Dermis",
          fil: "Dermis"
        },
        description: {
          en: "The middle layer containing blood vessels, nerves, and hair follicles",
          fil: "Ang gitnang layer na naglalaman ng mga ugat ng dugo, nerve, at hair follicles"
        },
        position: { x: 0, y: 0, z: 0.3 },
        labelOffset: { x: 0, y: 0 }
      },
      {
        id: "hypodermis",
        name: {
          en: "Hypodermis",
          fil: "Hypodermis"
        },
        description: {
          en: "The deepest layer that insulates and cushions the body",
          fil: "Ang pinakamalalim na layer na nag-iinsulate at gumagawa ng cushion sa katawan"
        },
        position: { x: 0, y: -0.4, z: 0.1 },
        labelOffset: { x: 100, y: 60 }
      }
    ],
    facts: {
      en: [
        "Your skin weighs about 8 pounds",
        "You shed about 30,000 dead skin cells per minute",
        "Skin renews itself every 28 days",
        "Your skin contains about 5 million sensory receptors"
      ],
      fil: [
        "Ang inyong balat ay tumitimbang ng humigit-kumulang 8 pounds",
        "Nalalaglag kayo ng humigit-kumulang 30,000 patay na skin cells bawat minuto",
        "Ang balat ay nagre-renew ng sarili bawat 28 araw",
        "Ang inyong balat ay naglalaman ng humigit-kumulang 5 milyong sensory receptors"
      ]
    }
  }
};

// Language type
export type Language = 'en' | 'fil';

// Helper function to get content in specific language
export const getLocalizedContent = (content: { en: string; fil: string }, language: Language): string => {
  return content[language] || content.en;
};

// Helper function to get localized array content
export const getLocalizedArray = (content: { en: string[]; fil: string[] }, language: Language): string[] => {
  return content[language] || content.en;
};