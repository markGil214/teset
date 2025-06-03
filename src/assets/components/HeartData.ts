// Heart anatomy data and medical information for AR visualization
import * as THREE from 'three';
import { HeartPart, HeartDisease, HeartEducationContent } from '../../types/HeartTypes';

export const heartParts: HeartPart[] = [
  {
    id: "left_atrium",
    name: "Left Atrium",
    displayName: "Left Atrium",
    meshName: "LeftAtrium", // Name to look for in GLTF model
    position: new THREE.Vector3(-0.15, 0.25, 0),
    separatedPosition: new THREE.Vector3(-0.4, 0.4, 0.1),
    description: "Upper left chamber that receives oxygenated blood from the lungs",
    function: "Receives oxygen-rich blood from pulmonary veins and pumps it to left ventricle",
    diseases: ["Atrial Fibrillation", "Mitral Stenosis", "Left Atrial Enlargement"],
    color: "#ff6b6b",
    visible: true
  },
  {
    id: "right_atrium",
    name: "Right Atrium", 
    displayName: "Right Atrium",
    meshName: "RightAtrium",
    position: new THREE.Vector3(0.15, 0.25, 0),
    separatedPosition: new THREE.Vector3(0.4, 0.4, 0.1),
    description: "Upper right chamber that receives deoxygenated blood from the body",
    function: "Collects oxygen-poor blood from body tissues and pumps it to right ventricle",
    diseases: ["Atrial Septal Defect", "Tricuspid Regurgitation", "Right Atrial Enlargement"],
    color: "#4ecdc4",
    visible: true
  },
  {
    id: "left_ventricle",
    name: "Left Ventricle",
    displayName: "Left Ventricle", 
    meshName: "LeftVentricle",
    position: new THREE.Vector3(-0.12, -0.15, 0),
    separatedPosition: new THREE.Vector3(-0.35, -0.3, -0.1),
    description: "Lower left chamber that pumps oxygenated blood to the body",
    function: "Main pumping chamber that sends oxygen-rich blood throughout the body",
    diseases: ["Left Ventricular Hypertrophy", "Heart Failure", "Myocardial Infarction"],
    color: "#ff9f43",
    visible: true
  },
  {
    id: "right_ventricle",
    name: "Right Ventricle",
    displayName: "Right Ventricle",
    meshName: "RightVentricle", 
    position: new THREE.Vector3(0.12, -0.15, 0),
    separatedPosition: new THREE.Vector3(0.35, -0.3, -0.1),
    description: "Lower right chamber that pumps deoxygenated blood to the lungs",
    function: "Pumps oxygen-poor blood to lungs for oxygenation",
    diseases: ["Pulmonary Stenosis", "Right Heart Failure", "Pulmonary Hypertension"],
    color: "#6c5ce7",
    visible: true
  },
  {
    id: "aorta",
    name: "Aorta",
    displayName: "Aorta",
    meshName: "Aorta",
    position: new THREE.Vector3(-0.05, 0.4, 0),
    separatedPosition: new THREE.Vector3(-0.15, 0.7, 0.2),
    description: "Main artery carrying oxygenated blood from heart to body",
    function: "Largest artery that distributes oxygen-rich blood throughout the body",
    diseases: ["Aortic Stenosis", "Aortic Aneurysm", "Aortic Regurgitation"],
    color: "#e17055",
    visible: true
  },
  {
    id: "pulmonary_artery",
    name: "Pulmonary Artery",
    displayName: "Pulmonary Artery",
    meshName: "PulmonaryArtery",
    position: new THREE.Vector3(0.05, 0.4, 0),
    separatedPosition: new THREE.Vector3(0.15, 0.7, 0.2),
    description: "Artery carrying deoxygenated blood from heart to lungs",
    function: "Carries oxygen-poor blood from right ventricle to lungs",
    diseases: ["Pulmonary Embolism", "Pulmonary Stenosis", "Pulmonary Hypertension"],
    color: "#74b9ff",
    visible: true
  }
];

export const heartDiseases: HeartDisease[] = [
  {
    id: "coronary_artery_disease",
    name: "Coronary Artery Disease",
    category: "vascular",
    severity: "severe",
    symptoms: ["Chest pain", "Shortness of breath", "Fatigue", "Heart palpitations"],
    causes: ["Plaque buildup in arteries", "High cholesterol", "High blood pressure", "Smoking"],
    prevention: ["Regular exercise", "Healthy diet", "No smoking", "Stress management"],
    treatment: ["Medications", "Angioplasty", "Bypass surgery", "Lifestyle changes"],
    prevalence: "6.2% of adults in the US",
    ageGroup: "Most common after age 40",
    affectedParts: ["left_ventricle", "right_ventricle", "aorta"],
    description: "Narrowing of coronary arteries that supply blood to heart muscle",
    riskFactors: ["Age", "Family history", "Diabetes", "Obesity", "Smoking"]
  },
  {
    id: "atrial_fibrillation",
    name: "Atrial Fibrillation",
    category: "rhythm",
    severity: "moderate",
    symptoms: ["Irregular heartbeat", "Heart palpitations", "Weakness", "Dizziness"],
    causes: ["Age", "Heart disease", "High blood pressure", "Thyroid problems"],
    prevention: ["Heart-healthy lifestyle", "Manage blood pressure", "Limit alcohol"],
    treatment: ["Blood thinners", "Rate control medications", "Cardioversion"],
    prevalence: "2.7-6.1 million people in the US",
    ageGroup: "Risk increases with age, especially over 65",
    affectedParts: ["left_atrium", "right_atrium"],
    description: "Irregular and often rapid heart rhythm that can lead to blood clots",
    riskFactors: ["Age", "Heart disease", "High blood pressure", "Diabetes"]
  },
  {
    id: "heart_failure",
    name: "Heart Failure",
    category: "structural",
    severity: "severe",
    symptoms: ["Shortness of breath", "Fatigue", "Swelling", "Rapid heartbeat"],
    causes: ["Coronary artery disease", "High blood pressure", "Diabetes", "Cardiomyopathy"],
    prevention: ["Control blood pressure", "Maintain healthy weight", "Exercise regularly"],
    treatment: ["ACE inhibitors", "Beta blockers", "Diuretics", "Device therapy"],
    prevalence: "6.2 million adults in the US",
    ageGroup: "More common in people over 65",
    affectedParts: ["left_ventricle", "right_ventricle"],
    description: "Condition where heart cannot pump blood effectively",
    riskFactors: ["Coronary artery disease", "High blood pressure", "Diabetes", "Obesity"]
  }
];

export const heartEducationContent: HeartEducationContent = {
  facts: [
    "Your heart beats about 100,000 times per day",
    "The heart pumps about 2,000 gallons of blood daily",
    "Heart muscle never gets tired like other muscles",
    "The heart has its own electrical system",
    "Heart disease is the leading cause of death globally"
  ],
  tips: [
    "Exercise for at least 30 minutes most days",
    "Eat a diet rich in fruits and vegetables",
    "Don't smoke and limit alcohol consumption",
    "Manage stress through relaxation techniques",
    "Get regular health checkups"
  ],
  myths: [
    "MYTH: Heart disease only affects older people",
    "MYTH: If you have no symptoms, your heart is healthy", 
    "MYTH: Heart disease is mainly a man's problem",
    "MYTH: I'm too young to worry about heart disease",
    "MYTH: My family has no history, so I'm safe"
  ],
  statistics: [
    {
      label: "Heart Disease Deaths",
      value: "659,000 per year",
      source: "CDC 2020"
    },
    {
      label: "Heart Attack Frequency", 
      value: "Every 36 seconds",
      source: "American Heart Association"
    },
    {
      label: "Survival Rate",
      value: "90% with quick treatment",
      source: "American Heart Association"
    }
  ]
};

// Heart slicing configuration
export const heartSlicingConfig = {
  sliceThreshold: 1.5,      // Start slicing at 1.5x zoom
  labelThreshold: 2.0,      // Show labels at 2.0x zoom  
  animationDuration: 1500,  // 1.5 seconds
  separationDistance: 0.3,  // How far to separate parts
  easingFunction: "power2.out" // GSAP easing
};
