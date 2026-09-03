export interface PlantSpecies {
  name: string;
  scientific_name: string;
  role: "structural" | "accent" | "groundcover" | "grass";
  ratio: number; // percentage/ratio of mix
  bloom_months: string[];
  height_cm: string;
  description_en: string;
  description_de: string;
}

export interface SeasonalCare {
  spring: string;
  summer: string;
  autumn: string;
  winter: string;
}

export interface GardenPackage {
  id: string;
  title_de: string;
  title_en: string;
  tagline_de: string;
  tagline_en: string;
  image_url: string;
  price_eur: number;
  water_requirement: "low" | "medium" | "high";
  soil_type: string[];
  featured_plants: string[];
  description_de: string;
  description_en: string;
  min_height_cm: number;
  max_height_cm: number;
  maintenance_level: "low" | "medium" | "high";
  sunlight: ("full_sun" | "partial_shade" | "full_shade")[];
  color_palette: string[];
  tags: string[];
  characteristics: string[];
  plants_detail?: PlantSpecies[];
  seasonal_care?: SeasonalCare;
  planting_density_per_sqm?: number;
}


export const GARDEN_PACKAGES: GardenPackage[] = [
  {
    id: "elegant-hell",
    title_de: "Elegant & Hell",
    title_en: "Elegant & Bright",
    tagline_de:
      "Zeitlose Eleganz in edlen Blatt- und Blütenformen, die in zarten Nuancen von Creme, Rosé und Silber dein Beet zum Leuchten bringen und es in der Sonne erstrahlen lassen.",
    tagline_en:
      "Timeless elegance in noble leaf and flower shapes that illuminate your bed in delicate shades of cream, rosé, and silver, making it shine in the sun.",
    image_url: "/garden/elegant_hell.jpeg",
    price_eur: 149.0,
    water_requirement: "medium",
    soil_type: ["well_drained", "humus_rich", "loamy"],
    featured_plants: [
      "Anemone",
      "Arenaria",
      "Calamagrostis 'Karl Foerster'",
      "Paeonia",
    ],
    description_de:
      "Schmücke deinen Garten mit einem eleganten, hellen Konzept, das das ganze Jahr über begeistert und eine frische, lichte Atmosphäre schafft. Strahlend reine Blüten – von klassischen Blütenköpfen bis hin zu üppig gefüllten Formen und Kerzenblüten – leuchten in zarten Nuancen von Creme, Rosé und Silber. Ziergräser verleihen eine natürliche Fülle bei einer Wuchshöhe von etwa 80 cm. Calamagrostis setzt mit bis zu 1,40 m Höhe architektonische Akzente. Bodendeckende Gräser und krautige Dauerblüher reduzieren Unkrautwuchs und Pflegeaufwand deutlich.",
    description_en:
      "Adorn your garden with an elegant, bright concept that delights year-round and creates a fresh, luminous atmosphere. Radiantly pure blooms—from classic flower heads to lush double blooms and candle flowers—shine in delicate shades of cream, rosé, and silver. Ornamental grasses add natural fullness reaching a growth height of around 80 cm, while Calamagrostis creates architectural highlights up to 1.40 m. Ground-covering grasses and long-blooming perennials significantly reduce weed growth and maintenance effort.",
    min_height_cm: 80,
    max_height_cm: 140,
    maintenance_level: "low",
    sunlight: ["full_sun"],
    color_palette: ["cream", "rose", "silver"],
    tags: ["weed_suppressing", "year_round_interest", "architectural"],
    characteristics: [
      "pflegeleicht",
      "unkrautreduzierend",
      "ganzjährig attraktiv",
      "sonnig",
    ],
  },
  {
    id: "elegant-dunkel",
    title_de: "Elegant & Dunkel",
    title_en: "Elegant & Dark",
    tagline_de:
      "Tiefe, dunkle Farben – Magenta, Blau, Grün und leuchtenden Akzenten – verschmelzen zu einem mysteriösen, spannungsvollen Farbspiel.",
    tagline_en:
      "Deep, dark colors – magenta, blue, green, and vibrant accents – merge into a mysterious, exciting play of colors.",
    image_url: "/garden/dunkel.jpeg",
    price_eur: 139.0,
    water_requirement: "low",
    soil_type: ["well_drained", "permeable", "moderate_nutrients"],
    featured_plants: ["Agastache", "Lithodora", "Iris"],
    description_de:
      "Tiefe, dunkle Farbtöne in Magenta, Blau, mattem Grün und leuchtenden Akzenten verschmelzen zu einem geheimnisvollen Farbspiel. Agastache bereichert das Beet mit insektenfreundlichen Blütenkerzen, Iris mit matten, immergrünen Blättern, während Lithodora die Fläche weich füllt. Bodendeckende Gräser reduzieren den Pflegeaufwand und den Wasserverbrauch deutlich.",
    description_en:
      "Deep, dark tones in magenta, blue, matte green, and vibrant accents merge into a mysterious play of colors. Agastache enriches the bed with insect-friendly flower candles, Iris brings matte, evergreen leaves, while Lithodora softly carpets the ground. Ground-covering grasses significantly reduce both maintenance effort and water consumption.",
    min_height_cm: 30,
    max_height_cm: 80,
    maintenance_level: "low",
    sunlight: ["full_sun", "partial_shade"],
    color_palette: ["magenta", "blue", "dark_green"],
    tags: [
      "bee_friendly",
      "drought_resistant",
      "evergreen_accents",
      "ground_cover",
    ],
    characteristics: [
      "insektenfreundlich",
      "wassersparend",
      "pflegeleicht",
      "immergrüne Akzente",
    ],
  },
  {
    id: "feurig-lebendig",
    title_de: "Feurig & Lebendig",
    title_en: "Fiery & Lively",
    tagline_de:
      "Feurige Orange-, Rot- und Gelbtöne – pure Energie für den Garten.",
    tagline_en:
      "Fiery orange, red, and yellow tones – pure energy for the garden.",
    image_url: "/garden/feurig.jpeg",
    price_eur: 159.0,
    water_requirement: "medium",
    soil_type: ["nutrient_rich", "loamy", "moist_well_drained"],
    featured_plants: ["Euphatorium", "Bistorta", "Miscanthus"],
    description_de:
      "Das Beet begeistert mit feurigen Orange-, Rot- und Gelbtönen für ein kraftvolles Farbspiel. Höhere Stauden schaffen eine Grundhöhe von ca. 80 cm, während Miscanthus als Strukturgerüst Akzente bis 1,40 m setzt. Bistorta sorgt bis in den späten Herbst hinein für feurige Highlights.",
    description_en:
      "This bed delights with fiery orange, red, and yellow tones for a powerful play of colors. Taller perennials establish a base height of approximately 80 cm, while Miscanthus acts as a structural frame setting accents up to 1.40 m. Bistorta delivers fiery highlights well into late autumn.",
    min_height_cm: 80,
    max_height_cm: 140,
    maintenance_level: "medium",
    sunlight: ["full_sun"],
    color_palette: ["orange", "red", "yellow"],
    tags: ["late_blooming", "vibrant", "structured", "dynamic"],
    characteristics: [
      "herbstblühend",
      "farbenfroh",
      "strukturreich",
      "dynamisch",
    ],
  },
  {
    id: "romantisch-zart",
    title_de: "Romantisch & Zart",
    title_en: "Romantic & Delicate",
    tagline_de:
      "Harmonisch und träumerisch, sanfte Pink- und Cremetöne mit Akzenten in kräftigem Lila.",
    tagline_en:
      "Harmonious and dreamy, soft pink and cream tones with accents in vibrant purple.",
    image_url: "/garden/romantisch.jpeg",
    price_eur: 129.0,
    water_requirement: "low",
    soil_type: ["dry", "sandy", "permeable"],
    featured_plants: ["Allium", "Perovskia", "Stipa"],
    description_de:
      "Zarte Farbtöne aus sanftem Pink, Creme und kräftigem Lila schaffen eine ruhige, elegante Atmosphäre. Mit kugelförmigen Blütenbällen (Allium), duftenden aufrechten Stauden (Perovskia) und federleichtem Gras (Stipa). Ideal für sonnige Standorte mit wassersparender und robuster Pflanzenauswahl.",
    description_en:
      "Delicate shades of soft pink, cream, and vibrant purple create a calm, elegant atmosphere. Featuring spherical flower globes (Allium), fragrant upright perennials (Perovskia), and feather-light grass (Stipa). Ideal for sunny locations with a water-saving, robust plant selection.",
    min_height_cm: 40,
    max_height_cm: 100,
    maintenance_level: "medium",
    sunlight: ["full_sun"],
    color_palette: ["pink", "cream", "purple"],
    tags: ["fragrant", "drought_resistant", "bee_friendly", "light_movement"],
    characteristics: [
      "duftend",
      "wassersparend",
      "sonnenliebend",
      "insektenfreundlich",
    ],
  },
  {
    id: "wild-hoch",
    title_de: "Wild & Hoch",
    title_en: "Wild & Tall",
    tagline_de:
      "Hohe Gräser und Stauden wiegen sich im Wind und formen eine lebendige, wilde Kulisse.",
    tagline_en:
      "Tall grasses and perennials sway in the wind, forming a lively, wild backdrop.",
    image_url: "/garden/wild_hoch.jpeg",
    price_eur: 169.0,
    water_requirement: "medium",
    soil_type: ["humus_rich", "deep", "loamy"],
    featured_plants: ["Verbascum", "Panicum", "Malve"],
    description_de:
      "Eindrucksvolle Pflanzung mit Höhen von bis zu 2 Metern aus lanzenförmigen Blütenständen (Verbascum), üppigen Panicum-Gräsern und Malven. Dient gleichzeitig als Sichtschutz, Insektenparadies und naturnahes Highlight.",
    description_en:
      "An impressive planting design with heights reaching up to 2 meters, composed of lance-shaped flower spikes (Verbascum), lush Panicum grasses, and mallows. Serves as a natural privacy screen, pollinator haven, and eco-friendly garden highlight.",
    min_height_cm: 120,
    max_height_cm: 200,
    maintenance_level: "medium",
    sunlight: ["full_sun", "partial_shade"],
    color_palette: ["natural_green", "yellow", "pink"],
    tags: ["privacy_screen", "bee_friendly", "wildlife_haven", "tall_growth"],
    characteristics: [
      "Sichtschutz",
      "Insektenparadies",
      "naturnah",
      "hoher Wuchs",
    ],
  },
  {
    id: "heiss-steinig",
    title_de: "Heiß & Steinig",
    title_en: "Hot & Stony",
    tagline_de:
      "Kiesgarten mit hitzeresistenten, kriechenden Pflanzen – farbenprächtig und extrem pflegeleicht.",
    tagline_en:
      "Gravel garden with heat-resistant, creeping plants – colorful and extremely low-maintenance.",
    image_url: "/garden/heiz_steinig.jpeg",
    price_eur: 119.0,
    water_requirement: "low",
    soil_type: ["gravelly", "sandy", "dry", "lean"],
    featured_plants: ["Aubrieta", "Armeria", "Festuca"],
    description_de:
      "Hitzeresistente, kriechende Pflanzen wie Aubrieta und Armeria gedeihen selbst auf heißem Stein. Das blaugrüne Gras Festuca bringt mit seinem polsterartigen Wuchs Ruhe und Form. Extrem pflegeleicht und benötigt minimales Gießen auch bei Trockenheit.",
    description_en:
      "Heat-resistant, creeping plants such as Aubrieta and Armeria thrive even on hot stone. The blue-green Festuca grass brings structure and serenity with its cushion-like growth. Extremely low-maintenance and requires minimal watering even during dry periods.",
    min_height_cm: 10,
    max_height_cm: 30,
    maintenance_level: "low",
    sunlight: ["full_sun"],
    color_palette: ["blue_green", "purple", "pink"],
    tags: [
      "heat_resistant",
      "drought_resistant",
      "gravel_garden",
      "ground_cover",
    ],
    characteristics: [
      "hitzeresistent",
      "trockenheitsverträglich",
      "extrem pflegeleicht",
      "Bodendecker",
    ],
  },
  {
    id: "gruen-pflegeleicht",
    title_de: "Grün & Pflegeleicht",
    title_en: "Green & Easy-Care",
    tagline_de:
      "Moderne Gräser, saftig grün und extrem pflegeleicht, geschmückt mit dauerblühenden Stauden.",
    tagline_en:
      "Modern grasses, lush green and extremely easy-care, adorned with continuous blooming perennials.",
    image_url: "/garden/grun.jpeg",
    price_eur: 129.0,
    water_requirement: "medium",
    soil_type: ["well_drained", "fresh", "humus_rich"],
    featured_plants: ["Carex", "Geranium", "Kniphofia"],
    description_de:
      "Saftig grüne Ziergräser bilden die Basis dieses modernen Beets. Carex deckt den Boden unkrautdicht ab, während Geranium bis zu 5 Monate am Stück blüht. Kniphofia setzt leuchtende Höhepunkte. Benötigt lediglich einen Rückschnitt im Frühjahr.",
    description_en:
      "Lush green ornamental grasses form the foundation of this modern garden bed. Carex covers the soil to suppress weeds, while Geranium blooms for up to 5 months continuously. Kniphofia adds striking, vibrant focal points. Requires only a single pruning in spring.",
    min_height_cm: 30,
    max_height_cm: 80,
    maintenance_level: "low",
    sunlight: ["full_sun", "partial_shade"],
    color_palette: ["lush_green", "yellow", "orange"],
    tags: ["long_blooming", "weed_suppressing", "bee_friendly", "easy_care"],
    characteristics: [
      "extrem pflegeleicht",
      "Dauerblüher",
      "unkrautunterdrückend",
      "insektenfreundlich",
    ],
  },
  {
    id: "mediterran-duftend",
    title_de: "Mediterran & Duftend",
    title_en: "Mediterranean & Fragrant",
    tagline_de:
      "Der Verwöhngarten: Urlaubsfeeling und Dufterlebnis durch besondere Gräser und dauerblühende Stauden.",
    tagline_en:
      "The pampering garden: holiday vibes and sensory fragrance through unique grasses and continuous bloomers.",
    image_url: "/garden/mediterran.jpeg",
    price_eur: 139.0,
    water_requirement: "low",
    soil_type: ["well_drained", "sandy", "chalky", "dry"],
    featured_plants: ["Thymian", "Bergminze", "Sesleria"],
    description_de:
      "Bringt Urlaubsfeeling in den Garten mit intensiv duftenden Stauden und mediterraner Anmutung. Kriechender Thymian bildet duftende Ränder, Bergminze zieht Bestäuber an, und Sesleria sorgt das ganze Jahr über für grüne Struktur. Wassersparend und pflegeleicht.",
    description_en:
      "Brings holiday vibes to your garden with intensely fragrant perennials and a Mediterranean charm. Creeping thyme creates aromatic borders, calamint attracts pollinators, and Sesleria provides evergreen structure all year round. Water-saving and easy to maintain.",
    min_height_cm: 15,
    max_height_cm: 50,
    maintenance_level: "low",
    sunlight: ["full_sun"],
    color_palette: ["mediterranean_green", "purple", "white"],
    tags: ["fragrant", "drought_resistant", "bee_friendly", "mediterranean"],
    characteristics: [
      "intensiv duftend",
      "mediterran",
      "wassersparend",
      "bienenfreundlich",
    ],
  },
];
