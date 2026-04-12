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
