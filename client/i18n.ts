export type Language = 'ar' | 'en';

export const translations = {
  en: {
    title: 'Code Editor',
    subtitle: 'Professional HTML/CSS/JavaScript Editor',
    tabs: {
      html: 'HTML',
      css: 'CSS / SCSS',
      javascript: 'JavaScript / TypeScript'
    },
    toolbar: {
      save: 'Save Project',
      load: 'Load Project',
      download: 'Download ZIP',
      undo: 'Undo',
      redo: 'Redo',
      format: 'Format Code',
      search: 'Search & Replace'
    },
    editor: {
      theme: 'Theme',
      fontSize: 'Font Size',
      fontFamily: 'Font Family',
      lightMode: 'Light',
      darkMode: 'Dark'
    },
    sounds: {
      title: 'Keyboard Sounds',
      type: 'Sound Type',
      mechanical: 'Mechanical',
      soft: 'Soft',
      classic: 'Classic',
      volume: 'Volume',
      mute: 'Mute'
    },
    autoTyping: {
      title: 'Auto-Typing',
      code: 'Enter Code',
      speed: 'Speed (chars/sec)',
      target: 'Target',
      play: 'Play',
      pause: 'Pause',
      stop: 'Stop'
    },
    preview: {
      title: 'Live Preview',
      libraries: 'Libraries & CDN'
    },
    messages: {
      saved: 'Project saved successfully',
      loaded: 'Project loaded successfully',
      downloaded: 'Project downloaded successfully',
      error: 'An error occurred',
      selectProject: 'Select a project to load'
    }
  },
  ar: {
    title: 'محرر الأكواد',
    subtitle: 'محرر HTML/CSS/JavaScript احترافي',
    tabs: {
      html: 'HTML',
      css: 'CSS / SCSS',
      javascript: 'JavaScript / TypeScript'
    },
    toolbar: {
      save: 'حفظ المشروع',
      load: 'تحميل المشروع',
      download: 'تنزيل ZIP',
      undo: 'تراجع',
      redo: 'إعادة',
      format: 'تنسيق الكود',
      search: 'بحث واستبدال'
    },
    editor: {
      theme: 'المظهر',
      fontSize: 'حجم الخط',
      fontFamily: 'نوع الخط',
      lightMode: 'فاتح',
      darkMode: 'داكن'
    },
    sounds: {
      title: 'أصوات لوحة المفاتيح',
      type: 'نوع الصوت',
      mechanical: 'ميكانيكي',
      soft: 'ناعم',
      classic: 'كلاسيكي',
      volume: 'مستوى الصوت',
      mute: 'كتم الصوت'
    },
    autoTyping: {
      title: 'الكتابة التلقائية',
      code: 'أدخل الكود',
      speed: 'السرعة (حروف/ثانية)',
      target: 'الهدف',
      play: 'تشغيل',
      pause: 'إيقاف مؤقت',
      stop: 'إيقاف'
    },
    preview: {
      title: 'المعاينة المباشرة',
      libraries: 'المكتبات و CDN'
    },
    messages: {
      saved: 'تم حفظ المشروع بنجاح',
      loaded: 'تم تحميل المشروع بنجاح',
      downloaded: 'تم تنزيل المشروع بنجاح',
      error: 'حدث خطأ',
      selectProject: 'اختر مشروعًا لتحميله'
    }
  }
};

export function getTranslation(lang: Language, key: string): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}
