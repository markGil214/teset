# Audio Implementation Guide

## Directory Structure

To implement audio narration, create the following directory structure in the `public` folder:

```
public/
├── audio/
│   ├── en/
│   │   ├── heart_introduction.mp3
│   │   ├── heart_left_ventricle.mp3
│   │   ├── heart_right_ventricle.mp3
│   │   ├── heart_left_atrium.mp3
│   │   ├── heart_right_atrium.mp3
│   │   ├── heart_system_info.mp3
│   │   ├── brain_introduction.mp3
│   │   ├── brain_cerebrum.mp3
│   │   ├── brain_cerebellum.mp3
│   │   ├── brain_system_info.mp3
│   │   ├── lungs_introduction.mp3
│   │   ├── lungs_left_lung.mp3
│   │   ├── lungs_right_lung.mp3
│   │   ├── lungs_bronchi.mp3
│   │   ├── lungs_system_info.mp3
│   │   ├── kidney_introduction.mp3
│   │   ├── kidney_renal_cortex.mp3
│   │   ├── kidney_renal_medulla.mp3
│   │   ├── kidney_renal_pelvis.mp3
│   │   ├── kidney_system_info.mp3
│   │   ├── skin_introduction.mp3
│   │   ├── skin_epidermis.mp3
│   │   ├── skin_dermis.mp3
│   │   ├── skin_hypodermis.mp3
│   │   └── skin_system_info.mp3
│   └── fil/
│       ├── heart_introduction.mp3
│       ├── heart_left_ventricle.mp3
│       ├── heart_right_ventricle.mp3
│       ├── heart_left_atrium.mp3
│       ├── heart_right_atrium.mp3
│       ├── heart_system_info.mp3
│       ├── brain_introduction.mp3
│       ├── brain_cerebrum.mp3
│       ├── brain_cerebellum.mp3
│       ├── brain_system_info.mp3
│       ├── lungs_introduction.mp3
│       ├── lungs_left_lung.mp3
│       ├── lungs_right_lung.mp3
│       ├── lungs_bronchi.mp3
│       ├── lungs_system_info.mp3
│       ├── kidney_introduction.mp3
│       ├── kidney_renal_cortex.mp3
│       ├── kidney_renal_medulla.mp3
│       ├── kidney_renal_pelvis.mp3
│       ├── kidney_system_info.mp3
│       ├── skin_introduction.mp3
│       ├── skin_epidermis.mp3
│       ├── skin_dermis.mp3
│       ├── skin_hypodermis.mp3
│       └── skin_system_info.mp3
```

## Sample Audio Content Scripts

### Heart Introduction (English)

"Welcome to the cardiovascular system exploration. The heart is a muscular organ that pumps blood throughout your body, delivering oxygen and nutrients to every cell. Let's explore its main parts."

### Heart Left Ventricle (English)

"This is the left ventricle, the heart's most powerful chamber. It pumps oxygen-rich blood through the aorta to supply your entire body. Its thick muscular walls generate the pressure needed for circulation."

### Heart Introduction (Filipino)

"Maligayang pagdating sa cardiovascular system exploration. Ang puso ay isang muscular organ na nag-pump ng dugo sa buong katawan, naghahatid ng oxygen at nutrients sa bawat cell. Tuklasin natin ang mga pangunahing bahagi nito."

### Heart Left Ventricle (Filipino)

"Ito ang left ventricle, ang pinaka-malakas na chamber ng puso. Nag-pump ito ng oxygen-rich blood sa pamamagitan ng aorta upang ma-supply ang buong katawan. Ang makapal na muscular walls nito ay gumagawa ng pressure na kailangan para sa circulation."

## Implementation in ARLabel Component

To add audio playback to the AR labels, modify the ARLabel component:

```typescript
import AudioService from "../services/audioService";

// In the ARLabel component, add audio button
<button
  onClick={async (e) => {
    e.stopPropagation();
    const audioService = AudioService.getInstance();
    await audioService.playAnatomicalPointAudio(
      organId, // Pass this as a prop
      point.id,
      language
    );
  }}
  style={{
    marginLeft: "10px",
    padding: "4px 8px",
    backgroundColor: "#4ecdc4",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  }}
>
  🔊 Listen
</button>;
```

## Text-to-Speech Alternative

If creating audio files is not feasible, you can use the Web Speech API:

```typescript
// Add to audioService.ts
async playTextToSpeech(text: string, language: 'en' | 'fil'): Promise<void> {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'en' ? 'en-US' : 'tl-PH';
    utterance.rate = 0.8;
    utterance.volume = 0.7;

    window.speechSynthesis.speak(utterance);
  } else {
    console.warn('Speech synthesis not supported');
  }
}
```

## Usage in Components

```typescript
// Play organ introduction when AR model is detected
useEffect(() => {
  if (organModel && !modelLoading) {
    const audioService = AudioService.getInstance();
    audioService.playOrganIntroduction(organId, language);
  }
}, [organModel, modelLoading, organId, language]);

// Play anatomical point audio when label is clicked
const handleLabelClick = async (pointId: string) => {
  const audioService = AudioService.getInstance();
  await audioService.playAnatomicalPointAudio(organId, pointId, language);
  setSelectedLabelId(pointId);
};
```

## Audio Recording Tips

1. **Quality**: Use clear, professional-sounding recordings
2. **Duration**: Keep each clip under 30 seconds for better user experience
3. **Format**: Use MP3 for better browser compatibility
4. **Volume**: Normalize all audio files to consistent volume levels
5. **Background**: Record in a quiet environment with minimal background noise

## Integration Steps

1. Create the audio directory structure
2. Record or generate audio files for all anatomical points
3. Update the ARLabel component to include audio playback
4. Add audio controls to the main AR interface
5. Test audio playback across different devices and browsers
