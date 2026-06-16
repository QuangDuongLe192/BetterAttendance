import { useTranslation } from 'react-i18next';
import { ScreenHeader } from '../shared/components/ui/ScreenHeader';
import { Icons } from '../shared/components/Icons';

const LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt', sub: 'Vietnamese' },
  { code: 'en', label: 'English',    sub: 'Tiếng Anh'  },
];

export function LanguagePage() {
  const { t, i18n } = useTranslation();

  return (
    <div className="cd-page">
      <ScreenHeader title={t('language.title')} />

      {LANGUAGES.map(lang => {
        const isSelected = i18n.language === lang.code;
        return (
          <button
            key={lang.code}
            className={`cd-lang-card${isSelected ? ' cd-lang-card--sel' : ''}`}
            onClick={() => i18n.changeLanguage(lang.code)}
          >
            <div style={{ flex: 1 }}>
              <div className="cd-lang-card__name">{lang.label}</div>
              <div className="cd-lang-card__sub">{lang.sub}</div>
            </div>
            <span className="cd-lang-card__check">
              {isSelected && <Icons.check size={13} sw={2.5} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
