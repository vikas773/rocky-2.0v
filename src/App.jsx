import { useState, useRef, useEffect } from "react";
import { ArrowUp, Image as ImageIcon, Settings, ListChecks, Map, AlertTriangle, Paperclip, MessageSquare, Mic, MicOff, Search, Leaf, ShieldAlert, Trash2, CheckCircle, GitFork, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import WorldMap from "./WorldMap";

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

const REGIONAL_ENDEMIC_SPECIES = {
  na: {
    name: "North America",
    description: "Diverse continent stretching from Arctic tundra to volcanic lakes of Mexico, featuring ancient relic species and rare birds.",
    species: [
      {
        name: "California Condor",
        scientificName: "Gymnogyps californianus",
        status: "Critically Endangered",
        rarity: "Rarest land bird in North America",
        description: "Largest North American land bird. Incredible wingspan of 3 meters. Rocky think it looks like giant black flying sky-beast from Outer Rim!",
        details: "Rocky's analysis shows only around 500 left in the wild. They feed on large carrion and play a vital ecological role as cleaners."
      },
      {
        name: "Axolotl",
        scientificName: "Ambystoma mexicanum",
        status: "Critically Endangered",
        rarity: "Endemic to Lake Xochimilco, Mexico",
        description: "A permanent larva salamander that never grows up (neoteny). They can regenerate limbs, organs, and even parts of their brain! Rocky is amazed! Eridians need this superpower, yes yes!",
        details: "Virtually extinct in the wild due to water pollution and introduced fish. Possesses incredible scientific value for regeneration research."
      },
      {
        name: "Vancouver Island Marmot",
        scientificName: "Marmota vancouverensis",
        status: "Critically Endangered",
        rarity: "Canada's rarest mammal",
        description: "A large squirrel-like burrowing rodent found only in the subalpine meadows of Vancouver Island. Extremely cute, *click click*!",
        details: "Predated by cougars and wolves. Captive breeding programs are currently keeping the species from total extinction."
      }
    ]
  },
  sa: {
    name: "South America",
    description: "Home of the massive Amazon basin and the Galapagos Islands, containing unparalleled evolutionary uniqueness.",
    species: [
      {
        name: "Galápagos Giant Tortoise",
        scientificName: "Chelonoidis niger",
        status: "Vulnerable / Endangered",
        rarity: "Endemic to Galápagos Islands",
        description: "Massive reptiles living over 100 years. They walk very slow, like Eridian stone-crabs. Charles Darwin studied them!",
        details: "Exploited by sailors for meat in the 19th century. Now protected by strict conservation zones and artificial breeding facilities."
      },
      {
        name: "Golden Lion Tamarin",
        scientificName: "Leontopithecus rosalia",
        status: "Endangered",
        rarity: "Atlantic Forest endemic (Brazil)",
        description: "Small monkey with a striking mane of golden fur. They look like tiny suns leaping through the green canopy! Highly social, *click click*!",
        details: "Threatened by severe forest fragmentation. Reintroduction programs have successfully increased their numbers in the wild."
      },
      {
        name: "Pink River Dolphin",
        scientificName: "Inia geoffrensis",
        status: "Endangered",
        rarity: "Amazon River basin endemic",
        description: "Also known as Boto. Warm pink color. They can rotate their necks to navigate through flooded forest branches. Mind-blowing, yes!",
        details: "Their pink hue is caused by scar tissue from play or fighting. Threatened by mercury pollution from gold mining and river dams."
      }
    ]
  },
  eu: {
    name: "Europe",
    description: "An ancient landscape populated by Europe's rarest felines, cave dwellers, and heavy forest bison.",
    species: [
      {
        name: "Iberian Lynx",
        scientificName: "Lynx pardinus",
        status: "Endangered / Vulnerable",
        rarity: "Rarest wild cat species on Earth",
        description: "Medium-sized cat with a spotted coat, short tail, and ear tufts. Rocky think it has face of very serious philosopher.",
        details: "Once down to under 100 individuals, conservation efforts have brought them back to over 1,000. Diet consists almost entirely of wild rabbits."
      },
      {
        name: "Saiga Antelope",
        scientificName: "Saiga tatarica",
        status: "Near Threatened",
        rarity: "Eurasian Steppe specialist",
        description: "Has a giant bulbous inflatable nose (proboscis) that filters dust and warms cold winter air. Rocky nose is smaller, but also filters space dust, *click*!",
        details: "Experienced a massive die-off in 2015 due to bacteria triggered by humidity. Undergoing recovery in Kazakhstan steppes."
      },
      {
        name: "Olm",
        scientificName: "Proteus anguinus",
        status: "Vulnerable",
        rarity: "Endemic to Dinaric Alps caves",
        description: "Blind cave salamander with pale skin and external red gills. Known as the 'Human Fish'. Can live up to 10 years without eating! Ultimate survivalist!",
        details: "Lives in complete darkness in underwater caves of Slovenia and Croatia. Highly sensitive to water pollution."
      }
    ]
  },
  af: {
    name: "Africa",
    description: "Diverse savanna, rainforest, and island biomes containing rare mountain primates and isolated island lemurs.",
    species: [
      {
        name: "Ring-tailed Lemur",
        scientificName: "Lemur catta",
        status: "Endangered",
        rarity: "Endemic to Madagascar",
        description: "Primate with distinctive black-and-white ringed tail. Madagascar was separated from Africa for 80 million years, creating Lemur wonderland, *click*!",
        details: "Madagascar holds 100% of the world's wild lemurs. Habitat loss from slash-and-burn agriculture is their primary threat."
      },
      {
        name: "Ethiopian Wolf",
        scientificName: "Canis simensis",
        status: "Endangered",
        rarity: "Africa's rarest canid",
        description: "Reddish-orange fur with white markings. Lives in high-altitude afro-alpine grasslands. Specialist hunter of giant mole-rats!",
        details: "Fewer than 500 remain, split into isolated populations. Main threats are habitat loss, domestic dogs, and fragmentation."
      },
      {
        name: "Shoebill Stork",
        scientificName: "Balaeniceps rex",
        status: "Vulnerable",
        rarity: "East African swamp specialist",
        description: "Huge bird with a massive shoe-shaped bill and a dinosaur-like stare. Stays completely still for hours, then strikes like lightning! Terrifying, *click click*!",
        details: "Feeds on lungfish, baby crocodiles, and snakes. Nesting sites are threatened by fire, cattle grazing, and illegal trade."
      }
    ]
  },
  as: {
    name: "Asia",
    description: "Vast continent containing high-altitude snow leopards, volcanic dragons, and bamboo-forest giants.",
    species: [
      {
        name: "Giant Panda",
        scientificName: "Ailuropoda melanoleuca",
        status: "Vulnerable",
        rarity: "Endemic to South Central China",
        description: "Chubby bear with black patches around eyes. Eats 12 to 38 kilograms of bamboo every single day! Bamboo is grass, not meat. Rocky love bamboo scent, yes!",
        details: "Conservation efforts (including reforestation) helped raise their status from Endangered to Vulnerable. Their digestive tract is still carnivore-like."
      },
      {
        name: "Komodo Dragon",
        scientificName: "Varanus komodoensis",
        status: "Endangered",
        rarity: "Endemic to Lesser Sunda Islands, Indonesia",
        description: "Largest living species of lizard, growing up to 3 meters. Possesses toxic bite. Rocky think they are like mini-dinosaurs from ancient Earth history!",
        details: "Protected in Komodo National Park. Threatened by rising sea levels and habitat encroachment outside park boundaries."
      },
      {
        name: "Snow Leopard",
        scientificName: "Panthera uncia",
        status: "Vulnerable",
        rarity: "High Central Asia mountain specialist",
        description: "Ghost of the Mountains. Has a thick tail used for balance and as a blanket in freezing temperatures. Gorgeous white fur, *click*!",
        details: "Adapted to steep, rugged terrains above 3,000 meters. Poaching and loss of natural prey are ongoing challenges."
      }
    ]
  },
  oc: {
    name: "Oceania",
    description: "Australia, New Zealand, and surrounding island nations featuring isolated monotremes, flightless birds, and marsupials.",
    species: [
      {
        name: "Platypus",
        scientificName: "Ornithorhynchus anatinus",
        status: "Near Threatened",
        rarity: "Endemic to Eastern Australia",
        description: "Has duck bill, beaver tail, otter feet, lays eggs, and has venomous spur! Rocky is convinced this is genetic experiment by Eridian scientists! Incredible creature, *click*!",
        details: "One of only five surviving species of monotremes (mammals that lay eggs). Detects prey using electroreception in muddy water."
      },
      {
        name: "Kakapo",
        scientificName: "Strigops habroptila",
        status: "Critically Endangered",
        rarity: "World's only flightless parrot (New Zealand)",
        description: "Large, green, nocturnal parrot that cannot fly, only climbs and glides. Smells like sweet honey/flowers! Rocky nose loves this smell!",
        details: "Fewer than 250 individuals left on predator-free sanctuary islands. Known for their low-frequency 'booming' mating calls."
      },
      {
        name: "Tasmanian Devil",
        scientificName: "Sarcophilus harrisii",
        status: "Endangered",
        rarity: "Endemic to Tasmania",
        description: "World's largest surviving carnivorous marsupial. Known for loud screeches and powerful bite force relative to body size. Very cranky, *click click*!",
        details: "Decimated by Devil Facial Tumor Disease (DFTD), a contagious cancer. Breeding programs and vaccine research are active."
      }
    ]
  }
};

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
  const [selectedMapRegion, setSelectedMapRegion] = useState("na");
  
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

  // Taxonomy State
  const [taxonomyQuery, setTaxonomyQuery] = useState("");
  const [taxonomyResult, setTaxonomyResult] = useState(null);
  const [taxonomyLoading, setTaxonomyLoading] = useState(false);
  const [taxonomyError, setTaxonomyError] = useState("");

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

  const sendMessage = async (overrideText) => {
    const textToSubmit = typeof overrideText === 'string' ? overrideText : input;
    if (!textToSubmit.trim() && !imageBase64) return;
    if (!apiKey) {
      setShowSettings(true);
      return;
    }

    const userMessage = { role: "user", content: textToSubmit.trim(), image: imageBase64 };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    if (typeof overrideText !== 'string') {
      setInput("");
    }
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

  const SIMULATED_TAXONOMY = {
    lion: { commonName: "Lion", kingdom: "Animalia", phylum: "Chordata", class_: "Mammalia", order: "Carnivora", family: "Felidae", genus: "Panthera", species: "Panthera leo", rockyNote: "King of Earth savanna! Rocky very impressed by mane. Erid has no manes.", funFact: "A lion's roar can be heard from 8 km away. On Erid, we communicate by bioluminescent skin pulses — much quieter!" },
    cat: { commonName: "Domestic Cat", kingdom: "Animalia", phylum: "Chordata", class_: "Mammalia", order: "Carnivora", family: "Felidae", genus: "Felis", species: "Felis catus", rockyNote: "Small lion that live in human house! Very confusing to Rocky.", funFact: "Cats spend 70% of their lives sleeping. Rocky also enjoys this activity during Eridian winter." },
    eagle: { commonName: "Bald Eagle", kingdom: "Animalia", phylum: "Chordata", class_: "Aves", order: "Accipitriformes", family: "Accipitridae", genus: "Haliaeetus", species: "Haliaeetus leucocephalus", rockyNote: "Flying hunter with white head! Can see 4x better than Rocky. Incredible!", funFact: "A bald eagle can spot a rabbit from 3.2 km away. Eridians evolved sonar instead of super-vision." },
    dolphin: { commonName: "Bottlenose Dolphin", kingdom: "Animalia", phylum: "Chordata", class_: "Mammalia", order: "Artiodactyla", family: "Delphinidae", genus: "Tursiops", species: "Tursiops truncatus", rockyNote: "Water mammal who smile always! They use sound to see, like some Eridians!", funFact: "Dolphins have names for each other — unique signature whistles. Rocky finds this very relatable!" },
    elephant: { commonName: "African Elephant", kingdom: "Animalia", phylum: "Chordata", class_: "Mammalia", order: "Proboscidea", family: "Elephantidae", genus: "Loxodonta", species: "Loxodonta africana", rockyNote: "Biggest land animal! Nose is also a hand! Rocky very envious of trunk.", funFact: "Elephants can communicate through infrasound over 10 km. Rocky's species also uses low-frequency vibrations." },
    octopus: { commonName: "Common Octopus", kingdom: "Animalia", phylum: "Mollusca", class_: "Cephalopoda", order: "Octopoda", family: "Octopodidae", genus: "Octopus", species: "Octopus vulgaris", rockyNote: "Eight arms, three hearts, blue blood! Most Eridian-like Earth creature Rocky has found!", funFact: "An octopus has 9 brains — one central and one per arm. This is similar to Eridian distributed neural architecture!" },
    shark: { commonName: "Great White Shark", kingdom: "Animalia", phylum: "Chordata", class_: "Chondrichthyes", order: "Lamniformes", family: "Lamnidae", genus: "Carcharodon", species: "Carcharodon carcharias", rockyNote: "Apex ocean predator! Has been on Earth 400 million years. Much respect.", funFact: "Great white sharks can detect one drop of blood in 100 liters of water. Rocky's species detects chemical signals in air similarly." },
    "blue whale": { commonName: "Blue Whale", kingdom: "Animalia", phylum: "Chordata", class_: "Mammalia", order: "Artiodactyla", family: "Balaenopteridae", genus: "Balaenoptera", species: "Balaenoptera musculus", rockyNote: "BIGGEST animal ever on Earth! Heart size of a car! Rocky cannot comprehend this size.", funFact: "A blue whale's heart beats only 2 times per minute when diving. Rocky's species has 4 hearts, all beating fast." },
  };

  const parseTaxonomyFromAI = (text) => {
    const get = (label) => {
      const regex = new RegExp(`${label}[:\\s]+([^\\n]+)`, 'i');
      const match = regex.exec(text);
      return match ? match[1].replace(/[*_`]/g, '').trim() : '?';
    };
    return {
      commonName: get('Common Name') || get('Animal'),
      kingdom: get('Kingdom'),
      phylum: get('Phylum'),
      class_: get('Class'),
      order: get('Order'),
      family: get('Family'),
      genus: get('Genus'),
      species: get('Species'),
      rockyNote: get("Rocky'?s? Note") || get('Note'),
      funFact: get('Fun Fact') || get('Eridian Fact'),
    };
  };

  const handleTaxonomyLookup = async (q = taxonomyQuery) => {
    const target = q.trim();
    if (!target) return;
    setTaxonomyError("");
    setTaxonomyResult(null);
    setTaxonomyLoading(true);

    if (!apiKey) {
      setTimeout(() => {
        const lower = target.toLowerCase();
        const result = SIMULATED_TAXONOMY[lower] || {
          commonName: target.charAt(0).toUpperCase() + target.slice(1),
          kingdom: "Animalia", phylum: "Chordata", class_: "?", order: "?", family: "?", genus: "?",
          species: `? ${target.toLowerCase()}`,
          rockyNote: `Rocky does not have offline data for ${target}. Enter API key for full lookup!`,
          funFact: "Add your Groq API key in Settings to unlock live taxonomy for any creature on Earth!"
        };
        setTaxonomyResult(result);
        setTaxonomyLoading(false);
      }, 800);
      return;
    }

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          max_tokens: 512,
          messages: [
            { role: "system", content: ROCKY_SYSTEM_PROMPT },
            { role: "user", content: `Give me the complete taxonomic classification for: ${target}. Format EXACTLY like this (one per line):\nCommon Name: ...\nKingdom: ...\nPhylum: ...\nClass: ...\nOrder: ...\nFamily: ...\nGenus: ...\nSpecies: ...\nRocky's Note: (one sentence alien reaction in Rocky's voice)\nFun Fact: (one interesting biological fact)` }
          ]
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Groq API error");
      const parsed = parseTaxonomyFromAI(data.choices[0].message.content);
      setTaxonomyResult(parsed);
    } catch (err) {
      setTaxonomyError(err.message);
    } finally {
      setTaxonomyLoading(false);
    }
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

      <div className="mode-switcher-container">
        {[
          { id: "chat", icon: <MessageSquare size={16}/>, label: "Chat" },
          { id: "lookup", icon: <Search size={16}/>, label: "Species" },
          { id: "checklist", icon: <ListChecks size={16}/>, label: "Checklist" },
          { id: "quickRef", icon: <ShieldAlert size={16}/>, label: "Quick Ref" },
          { id: "taxonomy", icon: <GitFork size={16}/>, label: "Taxonomy" },
          { id: "map", icon: <Map size={16}/>, label: "Map" },
          { id: "fieldLog", icon: <BookOpen size={16}/>, label: "Field Log" }
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

        {/* MAP EXPLORER MODE */}
        {mode === "map" && (
          <div style={{ height: "100%", overflowY: "auto", padding: "24px", maxWidth: "1100px", margin: "0 auto", width: "100%" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>🗺️ Biogeographical Map Explorer</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
              *click click* Click on any region on the map below to discover Rocky's records of endemic or rare Earth species!
            </p>

            <div className="map-grid-responsive">
              {/* Left Column: Interactive Map */}
              <div style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--text-secondary)" }}>
                    Selected Region: <span style={{ color: "var(--brand-active)" }}>{REGIONAL_ENDEMIC_SPECIES[selectedMapRegion]?.name || "None"}</span>
                  </span>
                  {selectedMapRegion && (
                    <button 
                      onClick={() => { setSelectedMapRegion(""); playSynthSound('click'); }} 
                      style={{ background: "transparent", border: "none", color: "var(--brand-active)", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
                    >
                      Clear Selection
                    </button>
                  )}
                </div>
                
                <WorldMap 
                  selectedRegion={selectedMapRegion} 
                  onRegionClick={(region) => {
                    setSelectedMapRegion(region);
                    playSynthSound('click');
                  }} 
                />

                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginTop: "8px" }}>
                  {Object.entries(REGIONAL_ENDEMIC_SPECIES).map(([code, reg]) => (
                    <button
                      key={code}
                      onClick={() => { setSelectedMapRegion(code); playSynthSound('click'); }}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "14px",
                        border: "1px solid var(--input-border)",
                        background: selectedMapRegion === code ? "var(--brand-active)" : "var(--bg-main)",
                        color: selectedMapRegion === code ? "#ffffff" : "var(--text-primary)",
                        fontSize: "12px",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      {reg.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Species List / Region Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {selectedMapRegion ? (
                  <div style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", borderRadius: "16px", padding: "24px", height: "100%", display: "flex", flexDirection: "column" }}>
                    <div style={{ borderBottom: "2px solid var(--border-color)", paddingBottom: "16px", marginBottom: "20px" }}>
                      <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "var(--text-primary)", margin: "0 0 6px 0" }}>
                        📍 {REGIONAL_ENDEMIC_SPECIES[selectedMapRegion].name}
                      </h3>
                      <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: "1.5", margin: 0 }}>
                        {REGIONAL_ENDEMIC_SPECIES[selectedMapRegion].description}
                      </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto", maxHeight: "500px", paddingRight: "4px" }}>
                      {REGIONAL_ENDEMIC_SPECIES[selectedMapRegion].species.map((spec) => (
                        <div 
                          key={spec.name} 
                          style={{ 
                            background: "var(--bg-main)", 
                            border: "1px solid var(--input-border)", 
                            borderRadius: "12px", 
                            padding: "16px", 
                            boxShadow: "0 2px 6px rgba(0,0,0,0.01)" 
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                            <div>
                              <h4 style={{ fontSize: "16px", fontWeight: "bold", color: "var(--text-primary)", margin: 0 }}>{spec.name}</h4>
                              <span style={{ fontSize: "12px", color: "var(--brand-active)", fontStyle: "italic" }}>{spec.scientificName}</span>
                            </div>
                            <span 
                              style={{ 
                                padding: "4px 8px", 
                                background: spec.status.includes("Critically") ? "#fee2e2" : spec.status.includes("Endangered") ? "#fef3c7" : "#dbeafe", 
                                color: spec.status.includes("Critically") ? "#b91c1c" : spec.status.includes("Endangered") ? "#b45309" : "#1d4ed8", 
                                borderRadius: "4px", 
                                fontSize: "11px", 
                                fontWeight: "bold" 
                              }}
                            >
                              {spec.status.toUpperCase()}
                            </span>
                          </div>

                          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "12px", fontWeight: "500" }}>
                            🏷️ {spec.rarity}
                          </div>

                          <p style={{ color: "var(--text-secondary)", fontSize: "13px", fontStyle: "italic", borderLeft: "3px solid var(--brand-active)", paddingLeft: "10px", margin: "0 0 12px 0", lineHeight: "1.4" }}>
                            *click* "{spec.description}"
                          </p>

                          <p style={{ color: "var(--text-primary)", fontSize: "13px", margin: "0 0 16px 0", lineHeight: "1.5" }}>
                            {spec.details}
                          </p>

                          {/* Quick Actions Row */}
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <button
                              onClick={() => {
                                setMode("chat");
                                playSynthSound('click');
                                sendMessage(`Tell me about the ${spec.name} (${spec.scientificName}), Rocky!`);
                              }}
                              style={{
                                flex: 1,
                                minWidth: "100px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px",
                                padding: "8px 12px",
                                borderRadius: "8px",
                                border: "none",
                                background: "var(--brand-active)",
                                color: "#ffffff",
                                fontSize: "12px",
                                fontWeight: "bold",
                                cursor: "pointer",
                                transition: "opacity 0.2s"
                              }}
                              title="Ask Rocky about this in chat"
                            >
                              <MessageSquare size={13} /> Ask Rocky
                            </button>

                            <button
                              onClick={() => {
                                setLookupQuery(spec.name);
                                handleSpeciesLookup(spec.name);
                                setMode("lookup");
                                playSynthSound('click');
                              }}
                              style={{
                                flex: 1,
                                minWidth: "100px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px",
                                padding: "8px 12px",
                                borderRadius: "8px",
                                border: "1px solid var(--input-border)",
                                background: "var(--input-bg)",
                                color: "var(--text-primary)",
                                fontSize: "12px",
                                fontWeight: "bold",
                                cursor: "pointer"
                              }}
                              title="Look up in Species database"
                            >
                              <Search size={13} /> Database
                            </button>

                            <button
                              onClick={() => {
                                setTaxonomyQuery(spec.name);
                                handleTaxonomyLookup(spec.name);
                                setMode("taxonomy");
                                playSynthSound('click');
                              }}
                              style={{
                                flex: 1,
                                minWidth: "100px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px",
                                padding: "8px 12px",
                                borderRadius: "8px",
                                border: "1px solid var(--input-border)",
                                background: "var(--input-bg)",
                                color: "var(--text-primary)",
                                fontSize: "12px",
                                fontWeight: "bold",
                                cursor: "pointer"
                              }}
                              title="Look up biological taxonomy tree"
                            >
                              <GitFork size={13} /> Taxonomy
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", borderRadius: "16px", padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: "16px", height: "100%", minHeight: "300px" }}>
                    <span style={{ fontSize: "40px" }}>🗺️</span>
                    <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "var(--text-primary)", margin: 0 }}>Select a Region</h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "13px", margin: 0, maxWidth: "250px", textAlign: "center", lineHeight: "1.5" }}>
                      *click click* Select a region on the map or click the buttons to explore Rocky's regional wildlife logs.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAXONOMY MODE */}
        {mode === "taxonomy" && (
          <div style={{ height: "100%", overflowY: "auto", padding: "24px", maxWidth: "700px", margin: "0 auto", width: "100%" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>🧬 Taxonomy Explorer</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "20px" }}>*click* Rocky show you full classification tree of any Earth creature!</p>

            <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
              <input
                value={taxonomyQuery}
                onChange={e => setTaxonomyQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleTaxonomyLookup()}
                placeholder="e.g. Lion, Eagle, Blue Whale..."
                style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--input-border)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "14px" }}
              />
              <button
                onClick={() => handleTaxonomyLookup()}
                disabled={taxonomyLoading}
                style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "var(--brand-active)", color: "#fff", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}
              >
                {taxonomyLoading ? "..." : "Classify"}
              </button>
            </div>

            {taxonomyError && (
              <div style={{ background: "#3d1f1f", border: "1px solid #ef4444", borderRadius: "8px", padding: "12px", color: "#ef4444", fontSize: "13px", marginBottom: "16px" }}>
                ⚠️ {taxonomyError}
              </div>
            )}

            {taxonomyResult && (
              <div style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: "12px", padding: "24px" }}>
                <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#79c0ff", marginBottom: "6px" }}>{taxonomyResult.commonName}</h3>
                <p style={{ color: "#b5936a", fontStyle: "italic", fontSize: "14px", marginBottom: "24px" }}>*click click* {taxonomyResult.rockyNote}</p>

                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {[
                    { rank: "Kingdom",  emoji: "🌍", value: taxonomyResult.kingdom,  color: "#ff7b72" },
                    { rank: "Phylum",   emoji: "🧩", value: taxonomyResult.phylum,   color: "#ffa657" },
                    { rank: "Class",    emoji: "📦", value: taxonomyResult.class_,   color: "#f0e060" },
                    { rank: "Order",    emoji: "📋", value: taxonomyResult.order,    color: "#7ee787" },
                    { rank: "Family",   emoji: "👨‍👩‍👧", value: taxonomyResult.family,   color: "#79c0ff" },
                    { rank: "Genus",    emoji: "🔬", value: taxonomyResult.genus,    color: "#d2a8ff" },
                    { rank: "Species",  emoji: "🧬", value: taxonomyResult.species,  color: "#ff7b72" },
                  ].map((row, i) => (
                    <div key={row.rank} style={{ display: "flex", alignItems: "stretch" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: "16px", width: "20px" }}>
                        <div style={{ width: "2px", background: i === 0 ? "transparent" : "#30363d", flex: "0 0 16px" }} />
                        <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: row.color, flexShrink: 0 }} />
                        <div style={{ width: "2px", background: "#30363d", flex: 1, minHeight: "16px" }} />
                      </div>
                      <div style={{ paddingBottom: "16px", paddingTop: "4px" }}>
                        <span style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{row.emoji} {row.rank}</span>
                        <div style={{ fontSize: "16px", fontWeight: 600, color: row.color, fontStyle: row.rank === "Species" || row.rank === "Genus" ? "italic" : "normal" }}>
                          {row.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {taxonomyResult.funFact && (
                  <div style={{ marginTop: "16px", background: "#161b22", borderLeft: "3px solid #b5936a", padding: "12px 16px", borderRadius: "0 8px 8px 0" }}>
                    <span style={{ color: "#b5936a", fontWeight: 700, fontSize: "12px" }}>🪐 ROCKY'S ERIDIAN FACT</span>
                    <p style={{ color: "#c9d1d9", fontSize: "13px", margin: "4px 0 0" }}>{taxonomyResult.funFact}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
