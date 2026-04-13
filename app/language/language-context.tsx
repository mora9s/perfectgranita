import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type AppLanguage = 'fr' | 'en';

const DEFAULT_LANGUAGE: AppLanguage = 'fr';

const DICTIONARY = {
  fr: {
    settingsTitle: '⚙️ Paramètres',
    appearanceSectionTitle: 'Apparence',
    languageSectionTitle: 'Langue',
    themeLight: 'Clair',
    themeDark: 'Sombre',
    themeSystem: 'Système',
    activeThemeLabel: 'Thème actif',
    activeThemeLight: 'Clair',
    activeThemeDark: 'Sombre',
    languageFrench: 'Français',
    languageEnglish: 'English',
    currentLanguageLabel: 'Langue active',
    homeTitle: '🍧 Choisir votre machine',
    homeSubtitle: 'Sélectionnez une Ninja Slushi pour adapter automatiquement les proportions.',
    homeSelectedMachine: 'Active',
    homeCapacityLabel: 'Capacité',
    homeChooseButton: 'Choisir et voir les recettes',
    myRecipesTitle: '📖 Mes Recettes',
    myRecipesSubtitle: 'Vos créations personnalisées',
    myRecipesEmptyTitle: 'Aucune recette personnalisée',
    myRecipesEmptyDescription: 'Créez votre première recette de granita personnalisée !',
    myRecipesCreateButton: '+ Créer une recette',
    tabHome: 'Accueil',
    tabExplore: 'Explorer',
    tabMyRecipes: 'Mes Recettes',
    tabSettings: 'Paramètres',
    exploreTitle: '🔍 Recettes',
    exploreSubtitle: 'Proportions adaptées à',
    exploreFiltersTitle: 'Filtres',
    exploreReset: 'Réinitialiser',
    exploreFiltersActiveHint: 'Filtres actifs, touche pour modifier.',
    exploreFiltersCollapsedHint: 'Touche pour filtrer par alcool ou Monin.',
    exploreAlcoholLabel: 'Alcool',
    exploreMoninLabel: 'Monin',
    exploreAll: 'Tous',
    exploreWithoutMonin: 'Sans Monin',
    exploreNoRecipesTitle: 'Aucune recette',
    exploreNoRecipesDescription: 'Ajuste ou réinitialise les filtres pour voir plus de recettes.',
    alcoholTequila: 'Tequila',
    alcoholRhum: 'Rhum',
    alcoholVodka: 'Vodka',
    alcoholGin: 'Gin',
    alcoholSpritz: 'Spritz',
    alcoholWine: 'Vin',
    alcoholMixed: 'Mixte',
    alcoholOther: 'Autre',
    recipeVisualSectionTitle: '🍸 VISUEL SERVICE',
    recipeIngredientsSectionTitle: '📋 INGREDIENTS',
    recipeMachineSectionTitle: '🧊 MACHINE',
    recipeActiveMachineLabel: 'Machine active',
    recipeProgramLabel: 'Programme',
    recipeTargetVolumeLabel: 'Volume cible',
    recipeEstimatedAbvLabel: 'ABV estimé',
    recipeMachineTimeLabel: 'Temps machine',
    recipeMachineStepsTitle: 'Etapes machine',
    recipePrepareBeforeTitle: 'A préparer avant de verser',
    recipePourRunTitle: 'Ajouter / Verser / Lancer',
    recipeBasePreparationTitle: '📝 PREPARATION BASE',
    recipeTipsTitle: '💡 CONSEILS',
    recipeTimeSectionTitle: '⏱ TEMPS',
    recipeTimePrep: 'Préparation',
    recipeTimeFreezing: 'Congélation',
    recipeTimeTotal: 'Total',
    recipeNoteLabel: 'Note',
    recipeMissingTitle: 'Recette introuvable',
    recipeMissingDescription: "La recette que vous recherchez n'existe pas.",
    recipeBackButton: 'Retour',
    proportionWater: 'Eau',
    proportionSugar: 'Sucre',
    proportionFlavor: 'Base aromatique',
    recipeDefaultBeforeStart1: 'Prépare une base homogène et bien froide.',
    recipeDefaultBeforeStart2: 'Filtre les morceaux ou fibres pour protéger la machine.',
    recipeDefaultPourRun1: 'Verse la préparation dans la cuve sans dépasser le max.',
    recipeDefaultPourRun2: 'Lance un cycle granita puis ajuste selon la texture souhaitée.',
    modalTitle: '✨ Nouvelle Recette',
    modalNameLabel: 'Nom de la recette',
    modalNamePlaceholder: 'Ex: Mojito Frozen',
    modalDescriptionLabel: 'Description',
    modalDescriptionPlaceholder: 'Décrivez votre recette...',
    modalCreateButton: 'Créer la recette',
    modalDefaultDescription: 'Ma recette personnalisée',
  },
  en: {
    settingsTitle: '⚙️ Settings',
    appearanceSectionTitle: 'Appearance',
    languageSectionTitle: 'Language',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',
    activeThemeLabel: 'Active theme',
    activeThemeLight: 'Light',
    activeThemeDark: 'Dark',
    languageFrench: 'Français',
    languageEnglish: 'English',
    currentLanguageLabel: 'Current language',
    homeTitle: '🍧 Choose your machine',
    homeSubtitle: 'Select a Ninja Slushi to automatically adapt the proportions.',
    homeSelectedMachine: 'Active',
    homeCapacityLabel: 'Capacity',
    homeChooseButton: 'Choose and view recipes',
    myRecipesTitle: '📖 My Recipes',
    myRecipesSubtitle: 'Your custom creations',
    myRecipesEmptyTitle: 'No custom recipes yet',
    myRecipesEmptyDescription: 'Create your first custom granita recipe!',
    myRecipesCreateButton: '+ Create a recipe',
    tabHome: 'Home',
    tabExplore: 'Explore',
    tabMyRecipes: 'My Recipes',
    tabSettings: 'Settings',
    exploreTitle: '🔍 Recipes',
    exploreSubtitle: 'Proportions adapted to',
    exploreFiltersTitle: 'Filters',
    exploreReset: 'Reset',
    exploreFiltersActiveHint: 'Filters are active, tap to adjust them.',
    exploreFiltersCollapsedHint: 'Tap to filter by alcohol or Monin.',
    exploreAlcoholLabel: 'Alcohol',
    exploreMoninLabel: 'Monin',
    exploreAll: 'All',
    exploreWithoutMonin: 'Without Monin',
    exploreNoRecipesTitle: 'No recipes',
    exploreNoRecipesDescription: 'Adjust or reset the filters to see more recipes.',
    alcoholTequila: 'Tequila',
    alcoholRhum: 'Rum',
    alcoholVodka: 'Vodka',
    alcoholGin: 'Gin',
    alcoholSpritz: 'Spritz',
    alcoholWine: 'Wine',
    alcoholMixed: 'Mixed',
    alcoholOther: 'Other',
    recipeVisualSectionTitle: '🍸 SERVING VISUAL',
    recipeIngredientsSectionTitle: '📋 INGREDIENTS',
    recipeMachineSectionTitle: '🧊 MACHINE',
    recipeActiveMachineLabel: 'Active machine',
    recipeProgramLabel: 'Program',
    recipeTargetVolumeLabel: 'Target volume',
    recipeEstimatedAbvLabel: 'Estimated ABV',
    recipeMachineTimeLabel: 'Machine time',
    recipeMachineStepsTitle: 'Machine steps',
    recipePrepareBeforeTitle: 'Prepare before pouring',
    recipePourRunTitle: 'Add / Pour / Start',
    recipeBasePreparationTitle: '📝 BASE PREPARATION',
    recipeTipsTitle: '💡 TIPS',
    recipeTimeSectionTitle: '⏱ TIME',
    recipeTimePrep: 'Prep',
    recipeTimeFreezing: 'Freezing',
    recipeTimeTotal: 'Total',
    recipeNoteLabel: 'Note',
    recipeMissingTitle: 'Recipe not found',
    recipeMissingDescription: 'The recipe you are looking for does not exist.',
    recipeBackButton: 'Back',
    proportionWater: 'Water',
    proportionSugar: 'Sugar',
    proportionFlavor: 'Flavor base',
    recipeDefaultBeforeStart1: 'Prepare a smooth, very cold base.',
    recipeDefaultBeforeStart2: 'Filter chunks or fibers to protect the machine.',
    recipeDefaultPourRun1: 'Pour the mixture into the bowl without exceeding the max line.',
    recipeDefaultPourRun2: 'Start a granita cycle, then adjust based on the desired texture.',
    modalTitle: '✨ New Recipe',
    modalNameLabel: 'Recipe name',
    modalNamePlaceholder: 'Ex: Frozen Mojito',
    modalDescriptionLabel: 'Description',
    modalDescriptionPlaceholder: 'Describe your recipe...',
    modalCreateButton: 'Create recipe',
    modalDefaultDescription: 'My custom recipe',
  },
} as const;

export type LanguageKey = keyof typeof DICTIONARY.fr;

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: LanguageKey) => string;
  availableLanguages: Array<{ value: AppLanguage; label: string }>;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<AppLanguage>(DEFAULT_LANGUAGE);

  const value = useMemo<LanguageContextValue>(() => {
    const t = (key: LanguageKey) => DICTIONARY[language][key];

    return {
      language,
      setLanguage,
      t,
      availableLanguages: [
        { value: 'fr', label: DICTIONARY[language].languageFrench },
        { value: 'en', label: DICTIONARY[language].languageEnglish },
      ],
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }

  return context;
}
