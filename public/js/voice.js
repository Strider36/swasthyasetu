/* Sanjeev Astra Multilingual Voice Assistant & Symptom Guidance Engine */
import { getLanguage, t } from './i18n.js';

// Language codes for SpeechRecognition
const SPEECH_LANG_MAP = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN'
};

// Symptom classification matrices
const SYMPTOM_RULES = [
  {
    level: 'levelUrgent',
    badgeClass: 'badge-danger',
    color: '#EF4444',
    keywords: [
      // English
      'chest pain', 'heart', 'heart attack', 'breath', 'breathing', 'stroke', 'unconscious', 'fainted',
      'bleeding', 'blood vomit', 'choking', 'paralysis', 'severe burn', 'head injury', 'trauma', 'poison',
      // Hindi
      'छाती में दर्द', 'सीने में दर्द', 'सांस', 'सांस फूलना', 'बेहोश', 'खून', 'दौरा', 'हार्ट अटैक', 'जल गया', 'सिर में चोट',
      // Marathi
      'छातीत दुखणे', 'श्वास', 'श्वास घेण्यास त्रास', 'बेशुद्ध', 'रक्त', 'हार्ट अटॅक', 'भाजणे', 'डोक्याला मार'
    ],
    guidance: {
      en: 'Potential emergency situation detected. Do not delay. Call 108 or activate Medical SOS immediately.',
      hi: 'गंभीर आपातकालीन स्थिति का संकेत। देरी न करें। तुरंत 108 डायल करें या मेडिकल SOS शुरू करें।',
      mr: 'गंभीर आपत्कालीन परिस्थितीचे संकेत. विलंब करू नका. लगेच 108 डायल करा किंवा वैद्यकीय SOS सुरू करा.'
    }
  },
  {
    level: 'levelClinic',
    badgeClass: 'badge-warning',
    color: '#F59E0B',
    keywords: [
      // English
      'high fever', 'fever for days', 'vomiting', 'diarrhea', 'severe pain', 'stomach pain', 'fracture', 'rash', 'infection', 'dizziness',
      // Hindi
      'तेज बुखार', 'उल्टी', 'दस्त', 'पेट दर्द', 'चक्कर', 'टूटी हड्डी', 'संक्रमण', 'खांसी',
      // Marathi
      'तीव्र ताप', 'उलटी', 'जुलाब', 'पोटदुखी', 'चक्कर', 'हाड मोडणे', 'संसर्ग', 'खोकला'
    ],
    guidance: {
      en: 'Moderate symptoms observed. A clinical examination at the nearest Primary Health Centre (PHC) is recommended.',
      hi: 'मध्यम लक्षण पाए गए। नज़दीकी प्राथमिक स्वास्थ्य केंद्र (PHC) में डॉक्टर से जांच कराने की सलाह दी जाती है।',
      mr: 'मध्यम लक्षणे आढळली. जवळच्या प्राथमिक आरोग्य केंद्रात (PHC) डॉक्टरांकडून तपासणी करून घेण्याचा सल्ला दिला जातो.'
    }
  },
  {
    level: 'levelHome',
    badgeClass: 'badge-success',
    color: '#2DD4BF',
    keywords: [
      // English
      'mild headache', 'cold', 'sneezing', 'tired', 'fatigue', 'mild sore throat', 'hydration', 'minor scratch',
      // Hindi
      'हल्का सिरदर्द', 'जुकाम', 'छींक', 'थकान', 'हल्का दर्द', 'खरोंच',
      // Marathi
      'हलके डोकेदुखी', 'सर्दी', 'शिंका', 'थकवा', 'घसा खवखवणे'
    ],
    guidance: {
      en: 'Mild symptoms noted. Rest, adequate oral rehydration, and self-monitoring at home are suggested.',
      hi: 'हल्के लक्षण दर्ज किए गए। घर पर आराम, भरपूर पानी/तरल पदार्थ और निगरानी रखने की सलाह दी जाती है।',
      mr: 'सौम्य लक्षणे आढळली. घरी विश्रांती, भरपूर पाणी पिणे आणि लक्ष ठेवण्याचा सल्ला दिला जातो.'
    }
  }
];

export class VoiceAssistant {
  constructor(options = {}) {
    this.onResult = options.onResult || null;
    this.onError = options.onError || null;
    this.onStatusChange = options.onStatusChange || null;
    
    this.recognition = null;
    this.isListening = false;
    this.initRecognition();
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.supported = false;
      return;
    }

    this.supported = true;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.onStatusChange) this.onStatusChange('listening');
    };

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      this.isListening = false;
      if (this.onStatusChange) this.onStatusChange('processing');
      this.processSymptomText(transcript);
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      if (this.onStatusChange) this.onStatusChange('error');
      if (this.onError) this.onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onStatusChange) this.onStatusChange('idle');
    };
  }

  startListening() {
    if (!this.supported) {
      if (this.onError) this.onError('not_supported');
      return;
    }

    const lang = getLanguage();
    this.recognition.lang = SPEECH_LANG_MAP[lang] || 'en-IN';

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('SpeechRecognition start error:', e);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // Assess spoken or typed symptoms and return preliminary guidance
  processSymptomText(rawText) {
    const text = (rawText || '').toLowerCase().trim();
    const currentLang = getLanguage();

    if (!text) {
      return null;
    }

    let matchedRule = null;
    for (const rule of SYMPTOM_RULES) {
      const match = rule.keywords.some(kw => text.includes(kw.toLowerCase()));
      if (match) {
        matchedRule = rule;
        break;
      }
    }

    // Default to clinic review if uncertain
    if (!matchedRule) {
      matchedRule = SYMPTOM_RULES[1]; // moderate / clinic
    }

    const careLevelKey = `voice.${matchedRule.level}`;
    const assessmentTitle = t('voice.assessment', 'Preliminary Assessment');
    const careLevelLabel = t(careLevelKey, matchedRule.level);
    const specificAdvice = matchedRule.guidance[currentLang] || matchedRule.guidance.en;
    const disclaimer = t('voice.disclaimer', 'This is a preliminary guidance tool, not a medical diagnosis. Consult a doctor for any illness.');

    const result = {
      transcript: rawText,
      levelKey: matchedRule.level,
      assessmentTitle,
      careLevelLabel,
      specificAdvice,
      badgeClass: matchedRule.badgeClass,
      color: matchedRule.color,
      disclaimer,
      isEmergency: matchedRule.level === 'levelUrgent'
    };

    if (this.onResult) {
      this.onResult(result);
    }

    return result;
  }
}
