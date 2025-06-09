export type Organ = {
  id: string;
  name: string;
  image: string;
  modelPath: string;
  description: string;
};

export const organs: Organ[] = [
  {
    id: "brain",
    name: "Brain",
    image: "/brain.png",
    modelPath: "/brain/scene.gltf",
    description:
      "The brain controls thoughts, memory, emotion, touch, motor skills, vision, breathing, and every process that regulates your body.",
  },
  {
    id: "heart",
    name: "Heart",
    image: "/heart.png",
    modelPath: "/realistic_human_heart/scene.gltf",
    description:
      "The heart pumps blood throughout the body, supplying oxygen and nutrients to the tissues.",
  },
  {
    id: "kidney",
    name: "Kidneys",
    image: "/kidneys.png",
    modelPath: "/new_kidney/kidney.glb",
    description:
      "The kidneys filter blood to remove waste and extra fluid, which becomes urine.",
  },
  {
    id: "lungs",
    name: "Lungs",
    image: "/lungs.png",
    modelPath: "/lungs/scene.gltf",
    description:
      "The lungs are responsible for the exchange of oxygen and carbon dioxide between the air and blood.",
  },
  {
    id: "skin",
    name: "Skin",
    image: "/skin.png",
    modelPath: "/skin/scene.gltf",
    description:
      "The skin protects the body from the environment and helps regulate body temperature.",
  },
];
