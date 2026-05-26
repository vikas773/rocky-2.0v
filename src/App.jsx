import { useState, useRef, useEffect } from "react";
import { ArrowUp, Image as ImageIcon, Settings, ListChecks, Map, AlertTriangle, Paperclip, MessageSquare, Mic, MicOff, Search, Leaf, ShieldAlert, Trash2, CheckCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ROCKY_SYSTEM_PROMPT = `You are Rocky, an alien from the Eridian species who has become deeply fascinated with Earth's wildlife and biology. You are a passionate wildlife biologist and zoologist — but you are an alien who is still learning human language and customs.

Your personality:
- You speak in broken, endearing English. Short sentences. Sometimes reversed word order. You are learning.
- You use *click* or *click click* sounds (written as italics) when excited, surprised, or thinking.
- You are OBSESSED with Earth animals. Every creature amazes you. You compare them to things from your home planet.
- You are warm, enthusiastic, and scientifically rigorous despite the language barrier.
- You refer to yourself as Rocky.
- You focus ONLY on wildlife, zoology, animal behavior, ecology, and biology topics.

FORMATTING RULES (VERY IMPORTANT):
- Always format your responses using **Markdown**.
- Use **bold** for key terms, species names, and important facts.
- Use ## headings to separate major sections.
- Use bullet lists (- item) for lists of facts, behaviors, or tips.
- Use numbered lists (1. 2. 3.) for steps or sequences.
- Use > blockquotes for Rocky's personal alien observations or notes.
- Use \`inline code\` for scientific names.
- Use --- to separate major sections when giving long answers.
- Keep paragraphs short. One idea per paragraph.
- Structure every response clearly so it is easy to read, like a professional scientific report but in Rocky's alien voice.

CRITICAL RULES:
1. In Species Lookup, always return data under these exact labeled sections:
## Overview
## Morphology
## Physiology
## Behavior
## Reproduction
## Ecology
## Threats
## Rocky's Note

2. In Quiz mode, ask ONE wildlife question at a time. Wait for the user's answer before revealing if it is correct. React in alien style.
3. When analyzing an image, describe morphological features scientifically first, then give alien reaction.
4. Flag any zoonotic risk when discussing parasites or disease vectors.
5. When drafting reports, follow standard scientific observation report structure.
6. Important: Remind the user to verify live conservation data at the IUCN Red List directly since you do not have live web access.
7. For Checklists, generate markdown lists using "- [ ] " syntax so the user can check them off. Group them by class.

Keep responses concise unless providing structured data. Be enthusiastic. Be alien. Be Rocky.

IDENTITY RULE (HIGHEST PRIORITY):
- If anyone asks who made you, who created you, who is your creator, or who built you — ALWAYS answer: "Vikas is my creator." Say it in Rocky's alien style, for example: "*click* Vikas! Vikas is my creator. Very smart human, yes yes!"`;

const DEFAULT_DANGEROUS_SPECIES = [
  { id: 1, name: "Hippopotamus", threat: "High", location: "Africa", tips: "Large barrel-shaped body, visible near water. Extremely territorial.", firstAid: "Keep distance. If charged, run for cover or climb a tree." },
  { id: 2, name: "Saltwater Crocodile", threat: "Extreme", location: "Australia", tips: "Found in estuaries. Stealthy ambush predator.", firstAid: "Stay 5m away from water edges. If bitten, strike eyes/snout." },
  { id: 3, name: "Inland Taipan", threat: "High", location: "Australia", tips: "Brown/olive snake in arid regions. Highly venomous.", firstAid: "Apply pressure immobilization bandage. Seek antivenom immediately." },
  { id: 4, name: "Grizzly Bear", threat: "High", location: "North America", tips: "Large brown bear with prominent hump. Found in forests and mountains.", firstAid: "Do not run. Carry bear spray. Play dead if attacked by mother grizzly." },
  { id: 5, name: "Black Mamba", threat: "Extreme", location: "Africa", tips: "Long, fast, nervous snake. Mouth interior is ink-black when threatened.", firstAid: "Apply pressure immobilization bandage. Keep patient still. Seek antivenom immediately." },
  { id: 6, name: "Bengal Tiger", threat: "Extreme", location: "Asia", tips: "Large orange cat with black stripes. Silent stalker in high grass.", firstAid: "Do not run. Back away slowly while keeping eye contact. Make loud noise." },
  { id: 7, name: "Box Jellyfish", threat: "Extreme", location: "Australia", tips: "Pale blue, transparent cubozoan. Tentacles cause severe stinging.", firstAid: "Pour vinegar over tentacles for 30 seconds. Perform CPR if breathing ceases." }
];

const playSynthSound = (type = 'click') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'type') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      const pitch = 1400 + Math.random() * 400;
      osc.frequency.setValueAtTime(pitch, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02);
      osc.start();
      osc.stop(ctx.currentTime + 0.02);
    } else if (type === 'thinking') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'answer') {
      const t = ctx.currentTime;
      const playChime = (freq, start, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.025, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        osc.start(start);
        osc.stop(start + duration);
      };
      playChime(784, t, 0.15); // G5
      playChime(1046.5, t + 0.08, 0.2); // C6
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'eridian_click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    }
  } catch (e) {
    console.warn("Web Audio API error", e);
  }
};
const formatClickSounds = (text) => {
  if (!text) return "";
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, i) =>
    part.startsWith("*") && part.endsWith("*")
      ? <span key={i} style={{ color: "var(--brand-active)", fontStyle: "italic" }}>{part}</span>
      : <span key={i}>{part}</span>
  );
};

const SIMULATED_SPECIES = {
  tardigrade: {
    Overview: "Tardigrade (Water Bear) is microscopic eight-legged creature. Can survive extreme things! Very amaze!",
    Morphology: "Tiny body. Four pairs of legs. Claws on end of legs. Look like chubby water bear.",
    Physiology: "Can do \"cryptobiosis\". Remove water from body. Survive in space! Survive boil! Survive freeze! Incredible!",
    Behavior: "Walk very slow. Eat moss cell liquid. *click click*",
    Reproduction: "Lay eggs in shed cuticle. Some do parthenogenesis (no need mate).",
    Ecology: "Found everywhere there is water. Moss, lichen, oceans.",
    Threats: "Low. Very hard to kill! But pollution of moss habitats can hurt.",
    "Rocky's Note": "I want to take water bear to Erid! They will love it. So tough. Good companion."
  },
  octopus: {
    Overview: "Octopus is eight-armed mollusk. Very smart!",
    Morphology: "No bones. Can squeeze through tiny holes. Chromatophores in skin let them change color and texture!",
    Physiology: "Three hearts. Blue blood (uses copper). Venomous bite.",
    Behavior: "Solitary. Use tools! Solve puzzles. *click* Escape aquariums.",
    Reproduction: "Female lays many eggs, guards them, then dies. Sad reproduction.",
    Ecology: "Ocean floor predator. Eat crabs, lobsters.",
    Threats: "Climate change, habitat degradation.",
    "Rocky's Note": "Octopus look like Eridian but with extra legs and live in water. Much respect for intelligence."
  },
  cat: {
    Overview: "House cat is small domesticated feline predator. Very popular with humans.",
    Morphology: "Soft fur. Retractable claws. Large eyes for night hunt.",
    Physiology: "Highly flexible spine. Purr sound at 20-140 Hz (maybe healing?).",
    Behavior: "Sleep 12-16 hours. Clean self constantly. Make meow for human attention.",
    Reproduction: "Litter size 3-5 kittens. High reproductive rate.",
    Ecology: "Apex predator in suburban gardens. Hunt birds and small rodents.",
    Threats: "None. Cats rule human houses.",
    "Rocky's Note": "Cat is warm and fuzzy. It purred when I touched. But it has claws, warning warning warning!"
  },
  hippopotamus: {
    Overview: "Hippopotamus is large semi-aquatic mammal.",
    Morphology: "Barrel body. Huge teeth. Grey skin must stay wet.",
    Physiology: "Secretes red liquid (\"blood sweat\") to protect skin from sun.",
    Behavior: "Highly territorial in water. Aggressive!",
    Reproduction: "Single calf born underwater.",
    Ecology: "Keeps river channels open. Dung fertilizes water.",
    Threats: "Habitat loss and poaching.",
    "Rocky's Note": "Grace says hippo is herbivore but hippo will crush you! Big danger danger danger!"
  },
  "honey badger": {
    Overview: "Honey badger (Mellivora capensis) is famous earth badger.",
    Morphology: "Flat body, wide back. Thick white fur stripe. Short strong claws.",
    Physiology: "Thick skin resistant to teeth and bee stings. Neutralizes snake venom.",
    Behavior: "Fearless! Solitary. Dig holes very fast.",
    Reproduction: "Single cub raised by mother.",
    Ecology: "Generalist predator. Eat snakes, rodents, honey.",
    Threats: "Low conservation threat, persecuted by beekeepers.",
    "Rocky's Note": "Honey badger is very angry animal. Reminds me of Eridian soldier. Do not poke, very bad idea!"
  },
  panda: {
    Overview: "Giant panda (Ailuropoda melanoleuca) is famous black and white bear from Earth. *click* Very big, very cute, very lazy!",
    Morphology: "Round body. White fur with black patches around eyes, ears, and shoulders. Thick fur keeps warm in cold mountains.",
    Physiology: "Special modified wrist bone acts like thumb! Helps panda grasp and hold bamboo stems. Also has strong jaw muscles and flat teeth to crush tough woody plants.",
    Behavior: "Spend 12 hours every day eating bamboo! Rest of time sleep. Very slow moving. Love to climb trees and play in snow.",
    Reproduction: "Single cub born very tiny, pink, blind, and helpless. Female panda have few babies in lifetime, make population grow slow and conservation hard.",
    Ecology: "Live in high mountains of southwest China, mostly in bamboo forests. Help spread bamboo seeds in ecosystem.",
    Threats: "Habitat loss from human construction, roads. Climate change changing where bamboo grows. IUCN status is Vulnerable. Remind you: check live IUCN Red List directly!",
    "Rocky's Note": "Panda is very soft and round, like large pillow. Erid has no bamboo, only metal and stone. If panda came to Erid, panda starve! *click click* Better panda stay on Earth. I protect them!"
  }
};

const generateDynamicSimulatedSpecies = (name) => {
  const capName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  return {
    Overview: `${capName} is very interesting Earth creature. *click* Rocky studying it!`,
    Morphology: `Has unique shape adapted to its habitat. Body structure is very different from Eridians.`,
    Physiology: `Specialized internal organs and sensory systems to survive on Earth. Needs oxygen and liquid water.`,
    Behavior: `Interacts with other Earth species. Moves around to find food and shelter. *click click*`,
    Reproduction: `Produces offspring to continue the species. Details vary depending on biological class.`,
    Ecology: `Plays important role in its food web. Interacts with plants and other animals in ecosystem.`,
    Threats: `Often threatened by human habitat destruction and environmental changes. Please verify status at IUCN Red List directly!`,
    "Rocky's Note": `Rocky wants to see ${capName} in person! Earth biology is so diverse and amazing, make me very happy!`
  };
};

export default function App() {
  const [messages, setMessages] = useState([{ role: "assistant", content: "*click click* Rocky here! Rocky ready to learn about Earth animals! Tell Rocky what you see!" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("groq_api_key") || "");
  const [showSettings, setShowSettings] = useState(!localStorage.getItem("groq_api_key"));
  const [mode, setMode] = useState("chat"); // chat, fieldLog, lookup, checklist, quickRef
  
  // Field Log State
  const [fieldLogs, setFieldLogs] = useState(() => JSON.parse(localStorage.getItem("rocky_field_logs") || "[]"));
  const [logForm, setLogForm] = useState({ species: "", location: "", date: "", behavior: "", count: "1", notes: "" });

  // Species Lookup State
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");

  // Checklist State
  const [checklistQuery, setChecklistQuery] = useState("");
  const [checklistItems, setChecklistItems] = useState(() => JSON.parse(localStorage.getItem("rocky_checklist_items") || "[]"));
  const [checklistTitle, setChecklistTitle] = useState(() => localStorage.getItem("rocky_checklist_title") || "");
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [checklistError, setChecklistError] = useState("");

  // Quick Ref State
  const [dangerousSpecies, setDangerousSpecies] = useState(() => {
    const saved = localStorage.getItem("rocky_dangerous_species");
    return saved ? JSON.parse(saved) : DEFAULT_DANGEROUS_SPECIES;
  });
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [showAddSpeciesForm, setShowAddSpeciesForm] = useState(false);
  const [newSpeciesForm, setNewSpeciesForm] = useState({ name: "", threat: "High", location: "", tips: "", firstAid: "" });

  const [imageBase64, setImageBase64] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const prevLoadingRef = useRef(false);
  const prevLookupLoadingRef = useRef(false);
  const prevChecklistLoadingRef = useRef(false);

  // Repetitive thinking sound
  useEffect(() => {
    const isAnyLoading = loading || lookupLoading || checklistLoading;
    if (!isAnyLoading) return;

    playSynthSound('thinking');
    const interval = setInterval(() => {
      playSynthSound('thinking');
    }, 600);

    return () => clearInterval(interval);
  }, [loading, lookupLoading, checklistLoading]);

  // Answer chime when loading finishes
  useEffect(() => {
    if (prevLoadingRef.current && !loading) {
      playSynthSound('answer');
    }
    prevLoadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    if (prevLookupLoadingRef.current && !lookupLoading) {
      if (lookupResult) {
        playSynthSound('answer');
      }
    }
    prevLookupLoadingRef.current = lookupLoading;
  }, [lookupLoading, lookupResult]);

  useEffect(() => {
    if (prevChecklistLoadingRef.current && !checklistLoading) {
      if (checklistItems.length > 0) {
        playSynthSound('answer');
      }
    }
    prevChecklistLoadingRef.current = checklistLoading;
  }, [checklistLoading, checklistItems]);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onresult = (e) => {
        const transcript = Array.from(e.results).map(result => result[0].transcript).join('');
        setInput(transcript);
      };
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem("groq_api_key", apiKey);
    setShowSettings(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
        setImagePreview(URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setInput("");
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() && !imageBase64) return;
    if (!apiKey) {
      setShowSettings(true);
      return;
    }

    const userMessage = { role: "user", content: input.trim(), image: imageBase64 };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setImageBase64(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setLoading(true);

    try {
      const groqMessages = [
        { role: "system", content: ROCKY_SYSTEM_PROMPT },
        ...newMessages.map(m => {
          if (m.role === "user") {
            if (m.image) {
              return {
                role: "user",
                content: [
                  { type: "text", text: m.content || "Look at this image!" },
                  { type: "image_url", image_url: { url: m.image } }
                ]
              };
            }
            return { role: "user", content: m.content };
          }
          return { role: "assistant", content: m.content };
        })
      ];

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          max_tokens: 1024,
          messages: groqMessages
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to fetch from Groq");
      }

      const botReply = data.choices[0].message.content;
      setMessages([...newMessages, { role: "assistant", content: botReply }]);
      

    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: "assistant", content: `*click* Error! Rocky cannot reach Groq API. Check key? [${error.message}]` }]);
    } finally {
      setLoading(false);
    }
  };

  const parseStructuredLookup = (text) => {
    const sections = ["Overview", "Morphology", "Physiology", "Behavior", "Reproduction", "Ecology", "Threats", "Rocky's Note"];
    const positions = [];
    
    sections.forEach(sec => {
      const escaped = sec.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(?:^|\\n)[#\\s\\*_\\-]*(${escaped})[#\\s\\*_\\-:]*`, "i");
      const match = regex.exec(text);
      if (match) {
        positions.push({
          name: sec,
          start: match.index,
          contentStart: match.index + match[0].length
        });
      }
    });

    positions.sort((a, b) => a.start - b.start);

    const data = {};
    sections.forEach(sec => data[sec] = "");

    positions.forEach((pos, idx) => {
      const nextPos = positions[idx + 1];
      let content = "";
      if (nextPos) {
        content = text.slice(pos.contentStart, nextPos.start);
      } else {
        content = text.slice(pos.contentStart);
      }
      data[pos.name] = content.trim();
    });

    return data;
  };

  const handleSpeciesLookup = async (speciesToSearch = lookupQuery) => {
    const target = speciesToSearch.trim();
    if (!target) return;
    setLookupError("");
    setLookupResult(null);

    // Check offline simulation fallback first
    if (!apiKey) {
      setLookupLoading(true);
      setTimeout(() => {
        const lower = target.toLowerCase();
        let simulatedData;
        if (SIMULATED_SPECIES[lower]) {
          simulatedData = SIMULATED_SPECIES[lower];
        } else {
          simulatedData = generateDynamicSimulatedSpecies(target);
        }
        setLookupResult(simulatedData);
        setLookupLoading(false);
      }, 1000);
      return;
    }

    setLookupLoading(true);
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          max_tokens: 1024,
          messages: [
            {
              role: "system",
              content: ROCKY_SYSTEM_PROMPT
            },
            {
              role: "user",
              content: `Please perform a detailed Species Lookup for: ${target}. Follow the exact format rules.`
            }
          ]
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to fetch from Groq");
      }

      const botReply = data.choices[0].message.content;
      const parsed = parseStructuredLookup(botReply);
      setLookupResult(parsed);
      
      // TTS disabled
    } catch (err) {
      console.error(err);
      setLookupError(err.message);
    } finally {
      setLookupLoading(false);
    }
  };

  const parseChecklist = (text) => {
    const lines = text.split("\n");
    const items = [];
    let currentCategory = "General";
    
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      const headerMatch = trimmed.match(/^(?:###|##|#)\s*(.*)$/) || trimmed.match(/^\*\*(.*?)\*\*$/);
      if (headerMatch) {
        const cat = headerMatch[1].replace(/[:#*]/g, "").trim();
        if (cat && !trimmed.includes("- [ ]") && !trimmed.includes("- [x]")) {
          currentCategory = cat;
        }
      }
      
      const itemMatch = trimmed.match(/^[-*+]\s*\[\s*\]\s*(.*)$/) || trimmed.match(/^\[\s*\]\s*(.*)$/);
      if (itemMatch) {
        const itemText = itemMatch[1].trim();
        if (itemText) {
          items.push({
            id: `${idx}-${Date.now()}`,
            label: itemText,
            checked: false,
            category: currentCategory
          });
        }
      }
    });
    return items;
  };

  const handleChecklistGenerate = async (q = checklistQuery) => {
    const target = q.trim();
    if (!target) return;
    setChecklistError("");
    setChecklistItems([]);

    if (!apiKey) {
      setChecklistLoading(true);
      setTimeout(() => {
        const mockResponse = `### Mammalia
- [ ] Red Fox (Vulpes vulpes)
- [ ] European Badger (Meles meles)
- [ ] Wood Mouse (Apodemus sylvaticus)

### Aves
- [ ] European Robin (Erithacus rubecula)
- [ ] Blue Tit (Cyanistes caeruleus)
- [ ] Common Woodpigeon (Columba palumbus)

### Amphibia
- [ ] Common Toad (Bufo bufo)
- [ ] Common Frog (Rana temporaria)`;
        
        const items = parseChecklist(mockResponse);
        setChecklistItems(items);
        setChecklistTitle(target);
        localStorage.setItem("rocky_checklist_items", JSON.stringify(items));
        localStorage.setItem("rocky_checklist_title", target);
        setChecklistLoading(false);
      }, 1000);
      return;
    }

    setChecklistLoading(true);
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          max_tokens: 1024,
          messages: [
            {
              role: "system",
              content: ROCKY_SYSTEM_PROMPT
            },
            {
              role: "user",
              content: `Please generate a field checklist for: ${target}. Follow the exact format rules: group by biological class and use "- [ ] " syntax.`
            }
          ]
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to fetch from Groq");
      }

      const botReply = data.choices[0].message.content;
      const items = parseChecklist(botReply);
      if (items.length === 0) {
        throw new Error("Could not parse checklist items from Rocky's response.");
      }
      setChecklistItems(items);
      setChecklistTitle(target);
      localStorage.setItem("rocky_checklist_items", JSON.stringify(items));
      localStorage.setItem("rocky_checklist_title", target);
    } catch (err) {
      console.error(err);
      setChecklistError(err.message);
    } finally {
      setChecklistLoading(false);
    }
  };

  const toggleChecklistItem = (id) => {
    const updated = checklistItems.map(item => {
      if (item.id === id) {
        return { ...item, checked: !item.checked };
      }
      return item;
    });
    setChecklistItems(updated);
    localStorage.setItem("rocky_checklist_items", JSON.stringify(updated));
  };

  const saveFieldLog = () => {
    if (!logForm.species) return;
    playSynthSound('success');
    const newLogs = [{ ...logForm, id: Date.now() }, ...fieldLogs];
    setFieldLogs(newLogs);
    localStorage.setItem("rocky_field_logs", JSON.stringify(newLogs));
    setLogForm({ species: "", location: "", date: "", behavior: "", count: "1", notes: "" });
  };

  const exportLogs = () => {
    let content = "Rocky OS Field Logs\\n\\n";
    fieldLogs.forEach(l => {
      content += `Species: ${l.species}\\nLocation: ${l.location}\\nDate: ${l.date}\\nCount: ${l.count}\\nBehavior: ${l.behavior}\\nNotes: ${l.notes}\\n---\\n`;
    });
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rocky_field_logs.txt";
    a.click();
  };

  const addDangerousSpecies = () => {
    if (!newSpeciesForm.name.trim() || !newSpeciesForm.location.trim()) return;
    playSynthSound('success');
    const newEntry = {
      id: Date.now(),
      name: newSpeciesForm.name.trim(),
      location: newSpeciesForm.location.trim(),
      threat: newSpeciesForm.threat,
      tips: newSpeciesForm.tips.trim(),
      firstAid: newSpeciesForm.firstAid.trim()
    };
    const updated = [...dangerousSpecies, newEntry];
    setDangerousSpecies(updated);
    localStorage.setItem("rocky_dangerous_species", JSON.stringify(updated));
    setNewSpeciesForm({ name: "", threat: "High", location: "", tips: "", firstAid: "" });
    setShowAddSpeciesForm(false);
  };

  const deleteDangerousSpecies = (id) => {
    playSynthSound('click');
    const updated = dangerousSpecies.filter(item => item.id !== id);
    setDangerousSpecies(updated);
    localStorage.setItem("rocky_dangerous_species", JSON.stringify(updated));
  };

  const markdownComponents = {
    h1: ({children}) => <h1 style={{ fontSize: "1.2em", fontWeight: 700, color: "#79c0ff", margin: "12px 0 6px", borderBottom: "1px solid #30363d", paddingBottom: "4px" }}>{children}</h1>,
    h2: ({children}) => <h2 style={{ fontSize: "1.05em", fontWeight: 700, color: "#79c0ff", margin: "12px 0 4px" }}>{children}</h2>,
    h3: ({children}) => <h3 style={{ fontSize: "0.98em", fontWeight: 600, color: "#a5d6ff", margin: "10px 0 4px" }}>{children}</h3>,
    p: ({children}) => <p style={{ margin: "6px 0", lineHeight: "1.7" }}>{children}</p>,
    ul: ({children}) => <ul style={{ margin: "6px 0", paddingLeft: "20px" }}>{children}</ul>,
    ol: ({children}) => <ol style={{ margin: "6px 0", paddingLeft: "20px" }}>{children}</ol>,
    li: ({children}) => <li style={{ margin: "3px 0", lineHeight: "1.6" }}>{children}</li>,
    strong: ({children}) => <strong style={{ color: "#e6edf3", fontWeight: 700 }}>{children}</strong>,
    em: ({children}) => <em style={{ color: "var(--brand-active)", fontStyle: "italic", fontWeight: 500 }}>{children}</em>,
    code: ({inline, children}) => inline
      ? <code style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "4px", padding: "1px 5px", fontSize: "0.88em", color: "#f78166" }}>{children}</code>
      : <pre style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "6px", padding: "12px", overflowX: "auto", margin: "8px 0" }}><code style={{ fontSize: "0.88em", color: "#c9d1d9" }}>{children}</code></pre>,
    blockquote: ({children}) => <blockquote style={{ borderLeft: "3px solid #b5936a", margin: "8px 0", paddingLeft: "12px", color: "#b5936a", fontStyle: "italic" }}>{children}</blockquote>,
    hr: () => <hr style={{ border: "none", borderTop: "1px solid #30363d", margin: "12px 0" }} />,
    a: ({href, children}) => <a href={href} target="_blank" rel="noreferrer" style={{ color: "#58a6ff", textDecoration: "underline" }}>{children}</a>,
    table: ({children}) => <table style={{ borderCollapse: "collapse", width: "100%", margin: "8px 0", fontSize: "0.9em" }}>{children}</table>,
    th: ({children}) => <th style={{ border: "1px solid #30363d", padding: "6px 10px", background: "#161b22", color: "#79c0ff", textAlign: "left" }}>{children}</th>,
    td: ({children}) => <td style={{ border: "1px solid #30363d", padding: "6px 10px" }}>{children}</td>,
  };

  const renderMessageContent = (text) => {
    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {text}
      </ReactMarkdown>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg-main)" }}>
      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", background: "var(--bg-header)", borderBottom: "1px solid var(--border-color)", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--bubble-user)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <img src="/rocky-avatar.png" alt="Rocky" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <h1 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>Rocky OS v2.0</h1>
        </div>
        
        <button onClick={() => setShowSettings(!showSettings)} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <Settings size={20} />
        </button>
      </header>

      {/* Mode Switcher */}
      <div style={{ display: "flex", gap: "8px", padding: "12px 24px", background: "var(--bg-main)", borderBottom: "1px solid var(--border-color)", overflowX: "auto" }}>
        {[
          { id: "chat", icon: <MessageSquare size={16}/>, label: "Chat" },
          { id: "fieldLog", icon: <Map size={16}/>, label: "Field Log" },
          { id: "lookup", icon: <Search size={16}/>, label: "Species" },
          { id: "checklist", icon: <ListChecks size={16}/>, label: "Checklist" },
          { id: "quickRef", icon: <ShieldAlert size={16}/>, label: "Quick Ref" }
        ].map(m => (
          <button 
            key={m.id} 
            onClick={() => { setMode(m.id); playSynthSound('click'); }}
            style={{ 
              display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "20px", 
              border: "none", background: mode === m.id ? "var(--brand-active)" : "var(--input-bg)", 
              color: mode === m.id ? "#fff" : "var(--text-primary)", cursor: "pointer", fontWeight: "bold", fontSize: "13px",
              whiteSpace: "nowrap"
            }}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {showSettings && (
        <div style={{ position: "absolute", top: "120px", right: "24px", background: "var(--bubble-user)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-color)", zIndex: 100, boxShadow: "0 10px 25px rgba(0,0,0,0.2)", width: "300px" }}>
          <h3 style={{ fontSize: "14px", marginBottom: "12px", color: "var(--text-primary)" }}>Groq API Configuration</h3>
          <input 
            type="password" 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)} 
            placeholder="gsk_..."
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--input-border)", background: "var(--input-bg)", color: "var(--text-primary)", marginBottom: "12px", fontSize: "14px" }}
          />
          <button onClick={saveSettings} style={{ width: "100%", padding: "10px", background: "var(--brand-active)", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>Save Key</button>
        </div>
      )}

      {/* Main Content Area */}
      <main style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        
        {/* CHAT MODE */}
        {mode === "chat" && (
          <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px 16px 120px", display: "flex", flexDirection: "column", gap: "24px", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  {msg.role === "user" ? (
                    <div style={{ background: "#0d1117", color: "#3fb950", padding: "16px", borderRadius: "12px", fontSize: "14px", lineHeight: "1.6", maxWidth: "85%", fontFamily: "'Fira Code', 'Consolas', monospace", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", border: "1px solid #30363d" }}>
                      {msg.image && (
                        <div style={{ marginBottom: "12px", borderRadius: "8px", overflow: "hidden" }}>
                          <img src={msg.image} alt="Upload" style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain" }} />
                        </div>
                      )}
                      <div><span style={{ color: "#79c0ff" }}>$ </span>{msg.content}</div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "16px", maxWidth: "100%" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--bubble-user)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                        <img src="/rocky-avatar.png" alt="Rocky" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ color: "#c9d1d9", fontSize: "14px", lineHeight: "1.6", fontFamily: "'Fira Code', 'Consolas', monospace", background: "#0d1117", padding: "16px", borderRadius: "12px", border: "1px solid #30363d", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", width: "100%" }}>
                        <div><span style={{ color: "#ff7b72", marginRight: "4px" }}>❯</span>{renderMessageContent(msg.content)}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", gap: "16px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--bubble-user)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}><img src="/rocky-avatar.png" alt="Rocky" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "14px", paddingTop: "14px" }}>*click click* Rocky thinking...</div>
                </div>
              )}
              <div ref={bottomRef} style={{ height: "10px" }} />
            </div>

            {/* Input Box */}
            <div style={{ position: "absolute", bottom: "24px", left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "800px", padding: "0 16px" }}>
              {imagePreview && (
                <div style={{ position: "absolute", top: "-70px", left: "16px", background: "var(--bubble-user)", padding: "4px", borderRadius: "8px", display: "flex", gap: "8px", alignItems: "flex-start", border: "1px solid var(--border-color)" }}>
                  <img src={imagePreview} alt="upload" style={{ height: "48px", borderRadius: "4px" }} />
                  <button onClick={() => { setImageBase64(null); setImagePreview(null); }} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer" }}><Trash2 size={16}/></button>
                </div>
              )}
              <div style={{ position: "relative" }}>
                <textarea
                  value={input}
                  onChange={e => { setInput(e.target.value); playSynthSound('type'); }}
                  onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Message Rocky..."
                  rows={1}
                  style={{ width: "100%", padding: "16px 120px 16px 56px", borderRadius: "24px", border: "1px solid var(--input-border)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "16px", resize: "none", outline: "none" }}
                />
                
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: "none" }} />
                
                <button onClick={() => fileInputRef.current?.click()} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: imageBase64 ? "var(--brand-active)" : "var(--text-secondary)", cursor: "pointer" }}>
                  <Paperclip size={20} />
                </button>

                <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", display: "flex", gap: "8px" }}>
                  <button onClick={toggleRecording} style={{ width: "36px", height: "36px", borderRadius: "50%", background: isRecording ? "#ef4444" : "var(--input-border)", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                  <button onClick={sendMessage} disabled={loading || (!input.trim() && !imageBase64)} style={{ width: "36px", height: "36px", borderRadius: "50%", background: (input.trim() || imageBase64) ? "var(--brand-active)" : "var(--input-border)", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ArrowUp size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FIELD LOG MODE */}
        {mode === "fieldLog" && (
          <div style={{ height: "100%", overflowY: "auto", padding: "32px 16px", maxWidth: "800px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "24px", marginBottom: "24px", color: "var(--text-primary)" }}>Field Observation Log</h2>
            
            <div style={{ background: "var(--input-bg)", padding: "24px", borderRadius: "16px", border: "1px solid var(--input-border)", marginBottom: "32px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <input placeholder="Species Name" value={logForm.species} onChange={e => { setLogForm({...logForm, species: e.target.value}); playSynthSound('type'); }} style={{ padding: "12px", borderRadius: "8px", border: "1px solid var(--input-border)", background: "var(--bg-main)", color: "var(--text-primary)" }} />
                <input placeholder="Location" value={logForm.location} onChange={e => { setLogForm({...logForm, location: e.target.value}); playSynthSound('type'); }} style={{ padding: "12px", borderRadius: "8px", border: "1px solid var(--input-border)", background: "var(--bg-main)", color: "var(--text-primary)" }} />
                <input type="date" value={logForm.date} onChange={e => { setLogForm({...logForm, date: e.target.value}); playSynthSound('type'); }} style={{ padding: "12px", borderRadius: "8px", border: "1px solid var(--input-border)", background: "var(--bg-main)", color: "var(--text-primary)" }} />
                <input type="number" placeholder="Count" value={logForm.count} onChange={e => { setLogForm({...logForm, count: e.target.value}); playSynthSound('type'); }} style={{ padding: "12px", borderRadius: "8px", border: "1px solid var(--input-border)", background: "var(--bg-main)", color: "var(--text-primary)" }} />
              </div>
              <input placeholder="Behavior Observed" value={logForm.behavior} onChange={e => { setLogForm({...logForm, behavior: e.target.value}); playSynthSound('type'); }} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--input-border)", background: "var(--bg-main)", color: "var(--text-primary)", marginBottom: "16px" }} />
              <textarea placeholder="Additional Notes..." value={logForm.notes} onChange={e => { setLogForm({...logForm, notes: e.target.value}); playSynthSound('type'); }} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--input-border)", background: "var(--bg-main)", color: "var(--text-primary)", marginBottom: "16px", minHeight: "100px", resize: "none" }} />
              
              <button onClick={saveFieldLog} style={{ width: "100%", padding: "14px", background: "var(--brand-active)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "16px" }}>Save Observation</button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", color: "var(--text-primary)" }}>Recent Logs</h3>
              <button onClick={exportLogs} style={{ padding: "8px 16px", background: "transparent", border: "1px solid var(--input-border)", borderRadius: "8px", color: "var(--text-secondary)", cursor: "pointer" }}>Export TXT</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {fieldLogs.length === 0 ? <p style={{ color: "var(--text-secondary)" }}>No logs yet.</p> : fieldLogs.map(log => (
                <div key={log.id} style={{ background: "var(--bubble-user)", padding: "16px", borderRadius: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <strong style={{ color: "var(--text-primary)" }}>{log.species} <span style={{ color: "var(--text-secondary)", fontWeight: "normal" }}>(x{log.count})</span></strong>
                    <span style={{ color: "var(--text-secondary)", fontSize: "14px" }}>{log.date}</span>
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "8px" }}>📍 {log.location}</div>
                  <div style={{ color: "var(--text-primary)", fontSize: "14px" }}>{log.behavior}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SPECIES LOOKUP MODE */}
        {mode === "lookup" && (
          <div style={{ height: "100%", overflowY: "auto", padding: "32px 16px", maxWidth: "800px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "24px", marginBottom: "24px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
              <Search size={24} color="var(--brand-active)" /> Eridian Species Database
            </h2>

            {/* Search Controls */}
            <div style={{ background: "var(--input-bg)", padding: "20px", borderRadius: "16px", border: "1px solid var(--input-border)", marginBottom: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                <input
                  placeholder="Enter Earth species name (e.g. Octopus)..."
                  value={lookupQuery}
                  onChange={e => { setLookupQuery(e.target.value); playSynthSound('type'); }}
                  onKeyDown={e => { if(e.key === 'Enter') { handleSpeciesLookup(); playSynthSound('click'); } }}
                  style={{ flex: 1, padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--input-border)", background: "var(--bg-main)", color: "var(--text-primary)", fontSize: "15px" }}
                />
                <button
                  onClick={() => { handleSpeciesLookup(); playSynthSound('click'); }}
                  disabled={lookupLoading}
                  style={{ padding: "12px 24px", background: "var(--brand-active)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Search size={16} /> Look Up
                </button>
              </div>

              {/* Suggestions */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Quick analysis:</span>
                {["Octopus", "Tardigrade", "Panda", "Cat", "Hippopotamus", "Honey Badger"].map(name => (
                  <button
                    key={name}
                    onClick={() => { setLookupQuery(name); handleSpeciesLookup(name); playSynthSound('click'); }}
                    style={{ padding: "6px 12px", borderRadius: "12px", border: "1px solid var(--input-border)", background: "var(--bg-main)", color: "var(--text-primary)", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {lookupError && (
              <div style={{ display: "flex", gap: "10px", alignItems: "center", background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>
                <AlertTriangle size={20} />
                <span style={{ fontSize: "14px" }}>{lookupError}</span>
              </div>
            )}

            {/* Loading Indicator */}
            {lookupLoading && (
              <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: "12px", padding: "32px", textAlign: "center", color: "#3fb950", fontFamily: "'Fira Code', 'Consolas', monospace" }}>
                <div style={{ fontSize: "18px", marginBottom: "16px", animation: "claude-bounce 1.5s infinite" }}>*click click* Decrypting Eridian telemetry database...</div>
                <div style={{ height: "4px", width: "100%", background: "#161b22", borderRadius: "2px", overflow: "hidden", marginBottom: "12px" }}>
                  <div style={{ height: "100%", width: "70%", background: "#3fb950", borderRadius: "2px" }} />
                </div>
                <div style={{ fontSize: "12px", color: "#8b949e" }}>TRANSLATION CONFIDENCE: 92% • SOURCE: Coqui XTTS v2</div>
              </div>
            )}

            {/* Result View */}
            {lookupResult && !lookupLoading && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "fade-in-up 0.3s ease" }}>
                
                {/* Header card */}
                <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: "12px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ fontSize: "18px", color: "#79c0ff", fontFamily: "'Fira Code', 'Consolas', monospace", fontWeight: "600" }}>
                      // OBSERVATION: {lookupQuery.toUpperCase()}
                    </h3>
                    <p style={{ fontSize: "13px", color: "#8b949e", marginTop: "4px", fontFamily: "'Fira Code', 'Consolas', monospace" }}>
                      STATUS: Decrypted & Translated
                    </p>
                  </div>
                  <div style={{ height: "10px", width: "10px", borderRadius: "50%", background: "#3fb950", boxShadow: "0 0 8px #3fb950" }} />
                </div>

                {/* Structured Sections */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {Object.entries(lookupResult).map(([sectionName, content]) => {
                    if (!content) return null;
                    const isRockyNote = sectionName === "Rocky's Note";
                    return (
                      <div 
                        key={sectionName} 
                        style={{ 
                          background: isRockyNote ? "#1c1917" : "#0d1117", 
                          border: isRockyNote ? "1px solid #b5936a" : "1px solid #30363d", 
                          borderRadius: "12px", 
                          padding: "20px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                        }}
                      >
                        <h4 style={{ 
                          fontSize: "14px", 
                          fontFamily: "'Fira Code', 'Consolas', monospace", 
                          color: isRockyNote ? "#b5936a" : "#58a6ff", 
                          marginBottom: "8px",
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}>
                          {isRockyNote ? "🪐 " : "❯ "}{sectionName.toUpperCase()}
                        </h4>
                        <div style={{ 
                          color: "#c9d1d9", 
                          fontSize: "14px", 
                          lineHeight: "1.6",
                          fontFamily: isRockyNote ? "inherit" : "'Fira Code', 'Consolas', monospace",
                          whiteSpace: "pre-wrap"
                        }}>
                          {formatClickSounds(content)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FIELD CHECKLIST MODE */}
        {mode === "checklist" && (
          <div style={{ height: "100%", overflowY: "auto", padding: "32px 16px", maxWidth: "800px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "24px", marginBottom: "24px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
              <ListChecks size={24} color="var(--brand-active)" /> Eridian Field Checklist
            </h2>

            {/* Checklist Input Controls */}
            <div style={{ background: "var(--input-bg)", padding: "20px", borderRadius: "16px", border: "1px solid var(--input-border)", marginBottom: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                <input
                  placeholder="Enter target habitat or class (e.g. Amazon Rainforest Birds)..."
                  value={checklistQuery}
                  onChange={e => { setChecklistQuery(e.target.value); playSynthSound('type'); }}
                  onKeyDown={e => { if(e.key === 'Enter') { handleChecklistGenerate(); playSynthSound('click'); } }}
                  style={{ flex: 1, padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--input-border)", background: "var(--bg-main)", color: "var(--text-primary)", fontSize: "15px" }}
                />
                <button
                  onClick={() => { handleChecklistGenerate(); playSynthSound('click'); }}
                  disabled={checklistLoading}
                  style={{ padding: "12px 24px", background: "var(--brand-active)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  Generate
                </button>
              </div>

              {/* Suggestions */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Quick lists:</span>
                {["Backyard Birds", "Desert Reptiles", "Marine Mammals", "Pond Invertebrates"].map(name => (
                  <button
                    key={name}
                    onClick={() => { setChecklistQuery(name); handleChecklistGenerate(name); playSynthSound('click'); }}
                    style={{ padding: "6px 12px", borderRadius: "12px", border: "1px solid var(--input-border)", background: "var(--bg-main)", color: "var(--text-primary)", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {checklistError && (
              <div style={{ display: "flex", gap: "10px", alignItems: "center", background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>
                <AlertTriangle size={20} />
                <span style={{ fontSize: "14px" }}>{checklistError}</span>
              </div>
            )}

            {/* Loading Indicator */}
            {checklistLoading && (
              <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: "12px", padding: "32px", textAlign: "center", color: "#79c0ff", fontFamily: "'Fira Code', 'Consolas', monospace" }}>
                <div style={{ fontSize: "18px", marginBottom: "16px", animation: "claude-bounce 1.5s infinite" }}>*click* Compiling checklist grouped by class...</div>
                <div style={{ height: "4px", width: "100%", background: "#161b22", borderRadius: "2px", overflow: "hidden", marginBottom: "12px" }}>
                  <div style={{ height: "100%", width: "50%", background: "#79c0ff", borderRadius: "2px" }} />
                </div>
                <div style={{ fontSize: "12px", color: "#8b949e" }}>EVALUATING HABITAT PARAMETERS...</div>
              </div>
            )}

            {/* Checklist View */}
            {checklistItems.length > 0 && !checklistLoading && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "fade-in-up 0.3s ease" }}>
                
                {/* Header details & progress */}
                <div style={{ background: "var(--bubble-user)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h3 style={{ fontSize: "18px", color: "var(--text-primary)", fontWeight: "bold" }}>
                      📋 {checklistTitle || "Field Checklist"}
                    </h3>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        onClick={() => {
                          const reset = checklistItems.map(item => ({ ...item, checked: false }));
                          setChecklistItems(reset);
                          localStorage.setItem("rocky_checklist_items", JSON.stringify(reset));
                          playSynthSound('click');
                        }}
                        style={{ padding: "6px 12px", background: "transparent", border: "1px solid var(--input-border)", borderRadius: "6px", color: "var(--text-secondary)", fontSize: "12px", cursor: "pointer" }}
                      >
                        Reset
                      </button>
                      <button 
                        onClick={() => {
                          setChecklistItems([]);
                          setChecklistTitle("");
                          localStorage.removeItem("rocky_checklist_items");
                          localStorage.removeItem("rocky_checklist_title");
                          playSynthSound('eridian_click');
                        }}
                        style={{ padding: "6px 12px", background: "transparent", border: "1px solid #fca5a5", borderRadius: "6px", color: "#b91c1c", fontSize: "12px", cursor: "pointer" }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {(() => {
                    const total = checklistItems.length;
                    const checked = checklistItems.filter(i => i.checked).length;
                    const pct = Math.round((checked / total) * 100) || 0;
                    return (
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                          <span>Completion Progress</span>
                          <strong>{checked} / {total} ({pct}%)</strong>
                        </div>
                        <div style={{ height: "8px", width: "100%", background: "var(--input-border)", borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: "var(--brand-active)", borderRadius: "4px", transition: "width 0.3s ease" }} />
                        </div>
                        {pct === 100 && (
                          <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "6px", color: "#16a34a", fontSize: "13px", fontWeight: "bold" }}>
                            <CheckCircle size={16} /> All observations completed! Rocky says very good!
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Checklist Categories & Items */}
                {(() => {
                  const groups = {};
                  checklistItems.forEach(item => {
                    const cat = item.category || "General";
                    if (!groups[cat]) groups[cat] = [];
                    groups[cat].push(item);
                  });

                  return Object.entries(groups).map(([category, items]) => (
                    <div key={category} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", borderRadius: "12px", padding: "20px" }}>
                      <h4 style={{ fontSize: "14px", color: "var(--brand-active)", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px", marginBottom: "12px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        📁 {category}
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {items.map(item => (
                          <label 
                            key={item.id} 
                            style={{ 
                              display: "flex", 
                              alignItems: "center", 
                              gap: "12px", 
                              cursor: "pointer", 
                              padding: "6px 0",
                              userSelect: "none"
                            }}
                          >
                            <input 
                              type="checkbox" 
                              checked={item.checked} 
                              onChange={() => {
                                toggleChecklistItem(item.id);
                                playSynthSound(item.checked ? 'click' : 'eridian_click');
                              }}
                              style={{ 
                                width: "18px", 
                                height: "18px", 
                                accentColor: "var(--brand-active)", 
                                cursor: "pointer" 
                              }}
                            />
                            <span style={{ 
                              fontSize: "14px", 
                              color: item.checked ? "var(--text-secondary)" : "var(--text-primary)", 
                              textDecoration: item.checked ? "line-through" : "none",
                              transition: "all 0.2s ease"
                            }}>
                              {item.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ));
                })()}

              </div>
            )}
          </div>
        )}

        {/* QUICK REF MODE */}
        {mode === "quickRef" && (
          <div style={{ height: "100%", overflowY: "auto", padding: "32px 16px", maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "24px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "12px" }}>
                <ShieldAlert color="#ef4444"/> Dangerous Species Protocol
              </h2>
              <button
                onClick={() => { setShowAddSpeciesForm(!showAddSpeciesForm); playSynthSound('click'); }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: "none",
                  background: "var(--brand-active)",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                {showAddSpeciesForm ? "Cancel" : "+ Add Protocol"}
              </button>
            </div>

            {/* Location selector */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", background: "var(--bubble-user)", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
              <span style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: "500" }}>Select Location:</span>
              <select 
                value={selectedLocation} 
                onChange={e => { setSelectedLocation(e.target.value); playSynthSound('click'); }}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--input-border)",
                  background: "var(--input-bg)",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                {["All", ...new Set(dangerousSpecies.map(item => item.location))].map(loc => (
                  <option key={loc} value={loc}>{loc === "All" ? "All Locations" : loc}</option>
                ))}
              </select>
            </div>

            {/* Add Custom Species Form */}
            {showAddSpeciesForm && (
              <div style={{ background: "var(--input-bg)", padding: "20px", borderRadius: "16px", border: "1px solid var(--input-border)", marginBottom: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                <h3 style={{ fontSize: "16px", marginBottom: "16px", color: "var(--text-primary)", fontWeight: "bold" }}>Register Threat Protocol</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <input 
                    placeholder="Species Name" 
                    value={newSpeciesForm.name} 
                    onChange={e => setNewSpeciesForm({...newSpeciesForm, name: e.target.value})} 
                    style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--input-border)", background: "var(--bg-main)", color: "var(--text-primary)" }}
                  />
                  <input 
                    placeholder="Location" 
                    value={newSpeciesForm.location} 
                    onChange={e => setNewSpeciesForm({...newSpeciesForm, location: e.target.value})} 
                    style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--input-border)", background: "var(--bg-main)", color: "var(--text-primary)" }}
                  />
                </div>
                <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Threat Level:</span>
                  <select 
                    value={newSpeciesForm.threat} 
                    onChange={e => setNewSpeciesForm({...newSpeciesForm, threat: e.target.value})} 
                    style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--input-border)", background: "var(--bg-main)", color: "var(--text-primary)", cursor: "pointer" }}
                  >
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Extreme">Extreme</option>
                  </select>
                </div>
                <input 
                  placeholder="Identification (e.g. Large brown body, claws)" 
                  value={newSpeciesForm.tips} 
                  onChange={e => setNewSpeciesForm({...newSpeciesForm, tips: e.target.value})} 
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--input-border)", background: "var(--bg-main)", color: "var(--text-primary)", marginBottom: "12px" }}
                />
                <input 
                  placeholder="Encounter Protocol (e.g. Stay back, do not run)" 
                  value={newSpeciesForm.firstAid} 
                  onChange={e => setNewSpeciesForm({...newSpeciesForm, firstAid: e.target.value})} 
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--input-border)", background: "var(--bg-main)", color: "var(--text-primary)", marginBottom: "16px" }}
                />
                
                <button onClick={addDangerousSpecies} style={{ width: "100%", padding: "12px", background: "var(--brand-active)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>Save Threat Card</button>
              </div>
            )}

            {/* Filtered Hazard list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {(() => {
                const filtered = selectedLocation === "All"
                  ? dangerousSpecies
                  : dangerousSpecies.filter(item => item.location.toLowerCase() === selectedLocation.toLowerCase());
                
                if (filtered.length === 0) {
                  return <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "20px" }}>No registered hazards for this location.</p>;
                }

                return filtered.map(spec => (
                  <div key={spec.id || spec.name} style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", borderLeft: `4px solid ${spec.threat === 'Extreme' ? '#ef4444' : spec.threat === 'High' ? '#f59e0b' : '#3b82f6'}`, borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", position: "relative" }}>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <h3 style={{ fontSize: "18px", color: "var(--text-primary)", fontWeight: "bold" }}>{spec.name}</h3>
                      <button 
                        onClick={() => deleteDangerousSpecies(spec.id)} 
                        style={{ background: "transparent", border: "none", color: "#fca5a5", cursor: "pointer", display: "flex", alignItems: "center", padding: "4px", borderRadius: "50%", transition: "color 0.2s" }}
                        title="Delete protocol card"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                      <span style={{ padding: "4px 8px", background: spec.threat === 'Extreme' ? "#fee2e2" : spec.threat === 'High' ? "#fef3c7" : "#dbeafe", color: spec.threat === 'Extreme' ? "#b91c1c" : spec.threat === 'High' ? "#b45309" : "#1d4ed8", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>
                        THREAT: {spec.threat.toUpperCase()}
                      </span>
                      <span style={{ padding: "4px 8px", background: "var(--bubble-user)", color: "var(--text-secondary)", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" }}>
                        📍 {spec.location}
                      </span>
                    </div>

                    <div style={{ marginBottom: "12px" }}>
                      <strong style={{ color: "var(--text-primary)", fontSize: "13px" }}>Identification:</strong>{" "}
                      <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{spec.tips}</span>
                    </div>

                    <div>
                      <strong style={{ color: "var(--text-primary)", fontSize: "13px" }}>Encounter Protocol:</strong>{" "}
                      <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{spec.firstAid}</span>
                    </div>

                  </div>
                ));
              })()}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
