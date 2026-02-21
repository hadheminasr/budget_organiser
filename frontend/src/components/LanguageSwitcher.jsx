import { useTranslation } from 'react-i18next';
import SharedButton from '../SharedComponents/SharedButton';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    <div className="flex gap-2 w-fit">
      <SharedButton
        variant={i18n.language === 'fr' ? 'primary' : 'secondary'}
        onClick={() => i18n.changeLanguage('fr')}
        className="w-auto px-4 py-2 text-sm"
      >
        🇫🇷 FR
      </SharedButton>

      <SharedButton
        variant={i18n.language === 'en' ? 'primary' : 'secondary'}
        onClick={() => i18n.changeLanguage('en')}
        className="w-auto px-4 py-2 text-sm"
      >
        🇬🇧 EN
      </SharedButton>
    </div>
  );
};

export default LanguageSwitcher;