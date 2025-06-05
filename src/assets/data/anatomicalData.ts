// Heart anatomical data for Phase 3: Anatomical Labeling System
export interface AnatomicalPoint {
  id: string;
  position: { x: number; y: number; z: number };
  title: {
    en: string;
    fil: string;
  };
  description: {
    en: string;
    fil: string;
  };
  detailedInfo: {
    en: string;
    fil: string;
  };
  funFact: {
    en: string;
    fil: string;
  };
}

export interface OrganEducationalData {
  organId: string;
  anatomicalPoints: AnatomicalPoint[];
  systemInformation: {
    title: {
      en: string;
      fil: string;
    };
    overview: {
      en: string;
      fil: string;
    };
    functions: {
      en: string[];
      fil: string[];
    };
  };
}

export const anatomicalEducationalData: OrganEducationalData[] = [
  {
    organId: "heart",
    anatomicalPoints: [
      {
        id: "left_atrium",
        position: { x: -0.15, y: 0.25, z: 0.1 },
        title: {
          en: "Left Atrium",
          fil: "Kaliwang Atrium"
        },
        description: {
          en: "Upper left chamber that receives oxygenated blood from the lungs",
          fil: "Itaas na kaliwang silid na tumatanggap ng oxygen-rich blood mula sa mga baga"
        },
        detailedInfo: {
          en: "The left atrium receives oxygen-rich blood from the lungs through four pulmonary veins. When it contracts, it pushes blood into the left ventricle through the mitral valve.",
          fil: "Ang kaliwang atrium ay tumatanggap ng oxygen-rich blood mula sa mga baga sa pamamagitan ng apat na pulmonary veins. Kapag ito ay kumikilos, itutulak niya ang dugo sa kaliwang ventricle sa pamamagitan ng mitral valve."
        },
        funFact: {
          en: "Your left atrium is about the size of a golf ball!",
          fil: "Ang inyong kaliwang atrium ay tungkol sa laki ng golf ball!"
        }
      },
      {
        id: "right_atrium",
        position: { x: 0.15, y: 0.25, z: 0.1 },
        title: {
          en: "Right Atrium",
          fil: "Kanang Atrium"
        },
        description: {
          en: "Upper right chamber that receives deoxygenated blood from the body",
          fil: "Itaas na kanang silid na tumatanggap ng deoxygenated blood mula sa katawan"
        },
        detailedInfo: {
          en: "The right atrium collects deoxygenated blood returning from the body through the superior and inferior vena cava. It then pumps this blood to the right ventricle.",
          fil: "Ang kanang atrium ay kumukuha ng deoxygenated blood na bumabalik mula sa katawan sa pamamagitan ng superior at inferior vena cava. Pagkatapos nito ay ito ay nagpadala ng dugong ito sa kanang ventricle."
        },
        funFact: {
          en: "The right atrium has a natural pacemaker called the sinoatrial node!",
          fil: "Ang kanang atrium ay may natural na pacemaker na tinatawag na sinoatrial node!"
        }
      },
      {
        id: "left_ventricle",
        position: { x: -0.15, y: -0.15, z: 0.1 },
        title: {
          en: "Left Ventricle",
          fil: "Kaliwang Ventricle"
        },
        description: {
          en: "Lower left chamber that pumps oxygenated blood to the entire body",
          fil: "Ibabang kaliwang silid na nagbobomba ng oxygenated blood sa buong katawan"
        },
        detailedInfo: {
          en: "The left ventricle is the heart's main pumping chamber. It has the thickest muscular walls and generates the highest pressure to pump blood throughout the entire body via the aorta.",
          fil: "Ang kaliwang ventricle ay ang pangunahing pumping chamber ng puso. Ito ay may pinakamakapal na muscular walls at bumubuo ng pinakamataas na presyon upang bombahin ang dugo sa buong katawan sa pamamagitan ng aorta."
        },
        funFact: {
          en: "Your left ventricle pumps about 2,000 gallons of blood daily!",
          fil: "Ang inyong kaliwang ventricle ay nagbobomba ng humigit-kumulang 2,000 gallons ng dugo araw-araw!"
        }
      },
      {
        id: "right_ventricle",
        position: { x: 0.15, y: -0.15, z: 0.1 },
        title: {
          en: "Right Ventricle",
          fil: "Kanang Ventricle"
        },
        description: {
          en: "Lower right chamber that pumps deoxygenated blood to the lungs",
          fil: "Ibabang kanang silid na nagbobomba ng deoxygenated blood sa mga baga"
        },
        detailedInfo: {
          en: "The right ventricle pumps deoxygenated blood to the lungs through the pulmonary artery. It has thinner walls than the left ventricle since it needs less pressure to reach the nearby lungs.",
          fil: "Ang kanang ventricle ay nagbobomba ng deoxygenated blood sa mga baga sa pamamagitan ng pulmonary artery. Ito ay may mas manipis na dingding kaysa sa kaliwang ventricle dahil kailangan nito ng mas kaunting presyon upang maabot ang malapit na mga baga."
        },
        funFact: {
          en: "The right ventricle pumps the same amount of blood as the left, but with less pressure!",
          fil: "Ang kanang ventricle ay nagbobomba ng parehong dami ng dugo tulad ng kaliwa, ngunit may mas kaunting presyon!"
        }
      },
      {
        id: "aorta",
        position: { x: -0.05, y: 0.35, z: 0.15 },
        title: {
          en: "Aorta",
          fil: "Aorta"
        },
        description: {
          en: "Main artery that carries oxygenated blood from the heart to the body",
          fil: "Pangunahing arteries na nagdadala ng oxygenated blood mula sa puso patungo sa katawan"
        },
        detailedInfo: {
          en: "The aorta is the largest artery in the human body, about the diameter of a garden hose. It arches over the heart and branches out to supply blood to all parts of the body except the lungs.",
          fil: "Ang aorta ay ang pinakamalaking arteries sa katawan ng tao, tungkol sa diameter ng garden hose. Ito ay umuukit sa ibabaw ng puso at nagiging sanga upang magbigay ng dugo sa lahat ng bahagi ng katawan maliban sa mga baga."
        },
        funFact: {
          en: "If stretched out, your aorta would be about 1 foot long!",
          fil: "Kung inunat, ang inyong aorta ay magiging humigit-kumulang 1 talampakan ang haba!"
        }
      },
      {
        id: "pulmonary_artery",
        position: { x: 0.05, y: 0.35, z: 0.15 },
        title: {
          en: "Pulmonary Artery",
          fil: "Pulmonary Artery"
        },
        description: {
          en: "Artery that carries deoxygenated blood from the heart to the lungs",
          fil: "Arteries na nagdadala ng deoxygenated blood mula sa puso patungo sa mga baga"
        },
        detailedInfo: {
          en: "The pulmonary artery is unique because it's the only artery that carries deoxygenated blood. It splits into left and right branches to supply both lungs for oxygenation.",
          fil: "Ang pulmonary artery ay natatangi dahil ito lang ang artery na nagdadala ng deoxygenated blood. Ito ay naghahati sa kaliwa at kanang mga sanga upang magbigay sa parehong mga baga para sa oxygenation."
        },
        funFact: {
          en: "The pulmonary artery is the only artery that carries deoxygenated blood!",
          fil: "Ang pulmonary artery ay ang tanging artery na nagdadala ng deoxygenated blood!"
        }
      }
    ],
    systemInformation: {
      title: {
        en: "Cardiovascular System",
        fil: "Cardiovascular System"
      },
      overview: {
        en: "The heart is a muscular organ that pumps blood throughout the body, delivering oxygen and nutrients to tissues and removing waste products.",
        fil: "Ang puso ay isang muscular organ na nagbobomba ng dugo sa buong katawan, naghahatid ng oxygen at nutrients sa mga tissue at nag-aalis ng mga waste products."
      },
      functions: {
        en: [
          "Pumps oxygenated blood to body tissues",
          "Returns deoxygenated blood to lungs",
          "Maintains blood circulation",
          "Regulates blood pressure"
        ],
        fil: [
          "Nagbobomba ng oxygenated blood sa mga tissue ng katawan",
          "Nagbabalik ng deoxygenated blood sa mga baga",
          "Nagpapanatili ng blood circulation",
          "Nag-regulate ng blood pressure"
        ]
      }
    }
  }
];
