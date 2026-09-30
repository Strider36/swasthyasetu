/* Sanjeev Astra AI Health Assistant Chatbot Drawer */

const KNOWLEDGE_BASE = {
  greetings: [
    "Hello! I am your Sanjeev Astra AI Healthcare Navigation Assistant. I can help assess symptoms, recommend appropriate care levels, locate nearby facilities, or provide medicine information. How can I help you today?",
    "Hi there! Ask Sanjeev Astra AI about symptoms, care levels, or medications. Remember, my guidance is strictly informational.",
  ],
  medications: [
    {
      keywords: ['paracetamol', 'acetaminophen', 'crocin', 'dolo'],
      response: `<strong>Paracetamol (Acetaminophen):</strong><br>
      • <strong>Purpose:</strong> Pain reliever (analgesic) and fever reducer (antipyretic).<br>
      • <strong>Usage:</strong> Take after food. Standard adult dose is 500mg-1000mg. Do not exceed 4000mg (4g) in 24 hours.<br>
      • <strong>Side Effects:</strong> Generally safe in therapeutic doses. Rare side effects include skin rash.<br>
      • <strong>Warnings:</strong> Overdosing can cause severe liver damage. Avoid alcohol while taking paracetamol.<br><br>
      <em>Disclaimer: Consult a doctor for personalized doses.</em>`
    },
    {
      keywords: ['metformin', 'glucophage'],
      response: `<strong>Metformin:</strong><br>
      • <strong>Purpose:</strong> Oral diabetes medicine that helps control blood sugar levels in Type 2 Diabetes.<br>
      • <strong>Usage:</strong> Usually taken with meals to reduce stomach side effects.<br>
      • <strong>Side Effects:</strong> Nausea, diarrhea, metallic taste, abdominal discomfort.<br>
      • <strong>Warnings:</strong> Contraindicated in severe kidney disease. Risk of lactic acidosis (rare but serious).<br><br>
      <em>Disclaimer: Consult your endocrinologist for dosage changes.</em>`
    },
    {
      keywords: ['aspirin', 'ecotrin'],
      response: `<strong>Aspirin (Acetylsalicylic Acid):</strong><br>
      • <strong>Purpose:</strong> Pain reliever, anti-inflammatory, and blood thinner (prevents clots).<br>
      • <strong>Usage:</strong> Take with food or milk to avoid stomach irritation.<br>
      • <strong>Side Effects:</strong> Stomach upset, easy bruising, heartburn.<br>
      • <strong>Warnings:</strong> Can increase risk of gastrointestinal bleeding. Do not give to children/teenagers due to risk of Reye's syndrome.<br><br>
      <em>Disclaimer: Seek professional advice if taking as daily therapy.</em>`
    },
    {
      keywords: ['amoxicillin', 'mox', 'penicillin'],
      response: `<strong>Amoxicillin (Antibiotic):</strong><br>
      • <strong>Purpose:</strong> Penicillin-class antibiotic used to treat bacterial infections.<br>
      • <strong>Usage:</strong> Take with or without food. Complete the full prescribed course even if you feel better.<br>
      • <strong>Side Effects:</strong> Diarrhea, nausea, yeast infections.<br>
      • <strong>Warnings:</strong> Ineffective against viral infections (like flu, cold). Do not take if allergic to penicillins.<br><br>
      <em>Disclaimer: Must only be taken under direct prescription by a practitioner.</em>`
    },
    {
      keywords: ['atorvastatin', 'lipitor'],
      response: `<strong>Atorvastatin (Lipitor):</strong><br>
      • <strong>Purpose:</strong> Statin medication used to prevent cardiovascular disease and lower cholesterol.<br>
      • <strong>Usage:</strong> Take once daily, at any time of day, with or without food.<br>
      • <strong>Side Effects:</strong> Muscle pain, headache, mild joint discomfort.<br>
      • <strong>Warnings:</strong> Avoid large amounts of grapefruit juice. Monitor liver enzymes periodically.<br><br>
      <em>Disclaimer: Discuss with your cardiologist regarding potential muscle side effects.</em>`
    }
  ],
  symptoms: [
    {
      keywords: ['headache', 'migraine'],
      response: `<strong>Managing Headaches:</strong><br>
      • Rest in a quiet, dark room.<br>
      • Stay well-hydrated (dehydration is a common trigger).<br>
      • Apply a cold compress to your forehead.<br>
      • Consider OTC pain relievers (like paracetamol or ibuprofen) short-term.<br><br>
      <strong>⚠️ Warning:</strong> Seek immediate medical care if the headache is sudden, severe ("thunderclap"), or accompanied by fever, stiff neck, confusion, or difficulty speaking.`
    },
    {
      keywords: ['fever', 'temperature', 'chills'],
      response: `<strong>Fever Guidance:</strong><br>
      • Keep hydrated by drinking water, broths, or rehydration solutions.<br>
      • Get plenty of rest.<br>
      • Take cool baths or use light blankets.<br>
      • Use fever reducers like paracetamol or ibuprofen if uncomfortable.<br><br>
      <strong>⚠️ Warning:</strong> Consult a physician immediately if temperature exceeds 39.4°C (103°F) or if fever persists for more than 3 consecutive days.`
    },
    {
      keywords: ['cough', 'cold', 'sore throat'],
      response: `<strong>Cough & Cold Remedies:</strong><br>
      • Use honey (for children over 1 year) or gargle warm salt water for sore throat relief.<br>
      • Use a humidifier or take a steamy shower to ease congestion.<br>
      • Drink warm fluids like herbal teas or clear soups.<br><br>
      <strong>⚠️ Note:</strong> Colds are viral infections; antibiotics will not cure them. Seek care if you experience shortness of breath, wheezing, or bloody mucus.`
    }
  ],
  definitions: [
    {
      keywords: ['hypertension', 'blood pressure', 'bp'],
      response: `<strong>Hypertension (High Blood Pressure):</strong><br>
      A chronic condition where the force of the blood against your artery walls is consistently too high (usually 130/80 mmHg or higher).<br>
      • <strong>Management:</strong> Low-sodium diet, regular exercise, limiting alcohol, stress management, and prescribed medication (e.g. Lisinopril, Amlodipine).`
    },
    {
      keywords: ['diabetes', 'sugar'],
      response: `<strong>Diabetes Mellitus:</strong><br>
      A metabolic disorder where the body cannot regulate glucose levels in the blood due to insulin deficiency (Type 1) or insulin resistance (Type 2).<br>
      • <strong>Management:</strong> Regular blood glucose monitoring, healthy low-glycemic index meals, active workouts, oral medication (e.g. Metformin) or insulin therapy.`
    },
    {
      keywords: ['cholesterol', 'lipids'],
      response: `<strong>High Cholesterol:</strong><br>
      An excess of fatty deposits (lipids) in your blood, increasing the risk of clogged arteries and cardiovascular incidents.<br>
      • <strong>HDL (Good):</strong> Helps clear cholesterol from bloodstream.<br>
      • <strong>LDL (Bad):</strong> Can build up inside artery walls.<br>
      • <strong>Management:</strong> Avoid trans fats, incorporate soluble fibers, exercise daily, and take statins if recommended.`
    }
  ],
  lifestyle: [
    {
      keywords: ['diet', 'nutrition', 'food'],
      response: `<strong>Healthy Diet Tips:</strong><br>
      • Eat a colorful variety of vegetables, fruits, whole grains, and lean proteins.<br>
      • Limit processed foods, refined sugars, and excessive sodium intake.<br>
      • Keep portion sizes moderate and chew food slowly.`
    },
    {
      keywords: ['exercise', 'workout', 'active'],
      response: `<strong>Exercise Recommendations:</strong><br>
      • Aim for at least 150 minutes of moderate aerobic activity (like brisk walking) or 75 minutes of vigorous activity weekly.<br>
      • Incorporate muscle-strengthening workouts at least twice a week.<br>
      • Avoid sitting for long periods; take standing breaks every hour.`
    },
    {
      keywords: ['sleep', 'insomnia', 'night'],
      response: `<strong>Healthy Sleep Hygiene:</strong><br>
      • Aim for 7 to 9 hours of quality sleep nightly.<br>
      • Maintain a consistent sleep schedule (even on weekends).<br>
      • Keep your bedroom cool, dark, and quiet.<br>
      • Turn off screens (phones, TVs) at least 1 hour before bedtime.`
    }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  const chatFab = document.getElementById('btn-chat-fab');
  const chatDrawer = document.getElementById('chat-drawer');
  const closeChat = document.getElementById('btn-close-chat');
  const chatInput = document.getElementById('chat-input');
  const sendChatBtn = document.getElementById('btn-send-chat');

  if (!chatFab || !chatDrawer) return;

  // Toggle drawer open
  chatFab.addEventListener('click', () => {
    chatDrawer.style.right = '0px';
  });

  // Close drawer
  const closeDrawer = () => {
    chatDrawer.style.right = '-400px';
  };

  if (closeChat) closeChat.addEventListener('click', closeDrawer);

  // Send message bindings
  const sendMessage = () => {
    const text = chatInput.value.trim();
    if (!text) return;

    appendUserMessage(text);
    chatInput.value = '';
    
    // Trigger AI loading and reply
    showTypingIndicator();
    setTimeout(() => {
      removeTypingIndicator();
      replyAI(text);
    }, 800);
  };

  if (sendChatBtn) sendChatBtn.addEventListener('click', sendMessage);
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });
  }
});

function appendUserMessage(text) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const msg = document.createElement('div');
  msg.style.alignSelf = 'flex-end';
  msg.style.maxWidth = '80%';
  msg.style.backgroundColor = 'var(--primary)';
  msg.style.color = 'white';
  msg.style.padding = '12px 16px';
  msg.style.borderRadius = 'var(--radius-md) 0 var(--radius-md) var(--radius-md)';
  msg.style.fontSize = '0.85rem';
  msg.style.lineHeight = '1.5';
  msg.textContent = text;

  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

function showTypingIndicator() {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const indicator = document.createElement('div');
  indicator.id = 'chat-typing-indicator';
  indicator.className = 'skeleton';
  indicator.style.alignSelf = 'flex-start';
  indicator.style.maxWidth = '60%';
  indicator.style.padding = '10px 14px';
  indicator.style.borderRadius = '0 var(--radius-md) var(--radius-md) var(--radius-md)';
  indicator.style.fontSize = '0.8rem';
  indicator.textContent = 'Sanjeev Astra AI is thinking...';

  container.appendChild(indicator);
  container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
  const el = document.getElementById('chat-typing-indicator');
  if (el) el.remove();
}

// Simulated keyword reply router
function replyAI(userInput) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const lower = userInput.toLowerCase();
  let replyText = '';

  // 1. Check medications
  const matchMed = KNOWLEDGE_BASE.medications.find(med => 
    med.keywords.some(kw => lower.includes(kw))
  );

  // 2. Check symptoms
  const matchSymptom = KNOWLEDGE_BASE.symptoms.find(sym => 
    sym.keywords.some(kw => lower.includes(kw))
  );

  // 3. Check definitions
  const matchDef = KNOWLEDGE_BASE.definitions.find(def => 
    def.keywords.some(kw => lower.includes(kw))
  );

  // 4. Check lifestyle
  const matchLife = KNOWLEDGE_BASE.lifestyle.find(life => 
    life.keywords.some(kw => lower.includes(kw))
  );

  // Route matches
  if (matchMed) {
    replyText = matchMed.response;
  } else if (matchSymptom) {
    replyText = matchSymptom.response;
  } else if (matchDef) {
    replyText = matchDef.response;
  } else if (matchLife) {
    replyText = matchLife.response;
  } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    replyText = KNOWLEDGE_BASE.greetings[Math.floor(Math.random() * KNOWLEDGE_BASE.greetings.length)];
  } else {
    // Default fallback
    replyText = `I couldn't identify the specific medicine or term. Here are some general recommendations:<br>
    • Drink 8-10 glasses of water daily.<br>
    • Log active tablets inside your <strong>Medications Vault</strong> to monitor adherence.<br>
    • Search details about common parameters (e.g. BP, Hypertension, diabetes).<br><br>
    <strong>Important:</strong> My capabilities are informational. Please consult a qualified doctor for any medical treatment plans or diagnosis.`;
  }

  const msg = document.createElement('div');
  msg.style.alignSelf = 'flex-start';
  msg.style.maxWidth = '85%';
  msg.style.backgroundColor = 'var(--background)';
  msg.style.padding = '12px 16px';
  msg.style.borderRadius = '0 var(--radius-md) var(--radius-md) var(--radius-md)';
  msg.style.fontSize = '0.85rem';
  msg.style.lineHeight = '1.5';
  msg.innerHTML = replyText;

  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}
