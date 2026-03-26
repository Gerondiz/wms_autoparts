/**
 * Unit тесты для утилит
 * 
 * Тестируют вспомогательные функции: cn, rtl утилиты
 */

import { describe, it, expect } from '@jest/globals';
import { cn } from '@/lib/utils/cn';
import {
  isRTL,
  isLTR,
  getDirection,
  getLang,
  rtlClass,
  rtlSpacing,
  rtlText,
  rtlFlex,
  rtlPosition,
  rtlBorderRadius,
  rtlIcon,
  getRTLClasses,
  getRTLStyles,
} from '@/lib/utils/rtl';

describe('Utils', () => {
  describe('cn', () => {
    it('должен объединять классы', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('должен игнорировать falsy значения', () => {
      expect(cn('class1', false, null, undefined, 'class2')).toBe('class1 class2');
    });

    it('должен обрабатывать условные классы', () => {
      const isActive = true;
      expect(cn('base', isActive && 'active')).toBe('base active');
    });

    it('должен обрабатывать объекты с условиями', () => {
      expect(cn({ class1: true, class2: false })).toBe('class1');
    });

    it('должен возвращать пустую строку если нет классов', () => {
      expect(cn()).toBe('');
    });

    it('должен обрабатывать массивы классов', () => {
      expect(cn(['class1', 'class2'])).toBe('class1 class2');
    });
  });

  describe('RTL утилиты', () => {
    describe('isRTL', () => {
      it('должен вернуть true для арабской локали', () => {
        expect(isRTL('ar')).toBe(true);
      });

      it('должен вернуть false для русской локали', () => {
        expect(isRTL('ru')).toBe(false);
      });

      it('должен вернуть false для английской локали', () => {
        expect(isRTL('en')).toBe(false);
      });
    });

    describe('isLTR', () => {
      it('должен вернуть true для русской локали', () => {
        expect(isLTR('ru')).toBe(true);
      });

      it('должен вернуть true для английской локали', () => {
        expect(isLTR('en')).toBe(true);
      });

      it('должен вернуть false для арабской локали', () => {
        expect(isLTR('ar')).toBe(false);
      });
    });

    describe('getDirection', () => {
      it('должен вернуть "rtl" для арабской локали', () => {
        expect(getDirection('ar')).toBe('rtl');
      });

      it('должен вернуть "ltr" для русской локали', () => {
        expect(getDirection('ru')).toBe('ltr');
      });

      it('должен вернуть "ltr" для английской локали', () => {
        expect(getDirection('en')).toBe('ltr');
      });
    });

    describe('getLang', () => {
      it('должен вернуть "ru" для русской локали', () => {
        expect(getLang('ru')).toBe('ru');
      });

      it('должен вернуть "en" для английской локали', () => {
        expect(getLang('en')).toBe('en');
      });

      it('должен вернуть "ar" для арабской локали', () => {
        expect(getLang('ar')).toBe('ar');
      });
    });

    describe('rtlClass', () => {
      it('должен объединять LTR и RTL классы', () => {
        expect(rtlClass('ml-4', 'rtl:ml-0 rtl:mr-4')).toBe('ml-4 rtl:ml-0 rtl:mr-4');
      });

      it('должен вернуть только LTR класс если RTL не указан', () => {
        expect(rtlClass('text-left')).toBe('text-left');
      });

      it('должен работать с пустыми строками', () => {
        expect(rtlClass('', 'rtl:text-right')).toBe(' rtl:text-right');
      });
    });

    describe('rtlSpacing', () => {
      it('должен генерировать классы для mx', () => {
        expect(rtlSpacing.mx('4')).toBe('ml-4 rtl:ml-0 rtl:mr-4');
      });

      it('должен генерировать классы для px', () => {
        expect(rtlSpacing.px('4')).toBe('pl-4 rtl:pl-0 rtl:pr-4');
      });

      it('должен генерировать классы для ml', () => {
        expect(rtlSpacing.ml('4')).toBe('ml-4 rtl:ml-0 rtl:mr-4');
      });

      it('должен генерировать классы для mr', () => {
        expect(rtlSpacing.mr('4')).toBe('mr-4 rtl:mr-0 rtl:ml-4');
      });

      it('должен генерировать классы для pl', () => {
        expect(rtlSpacing.pl('4')).toBe('pl-4 rtl:pl-0 rtl:pr-4');
      });

      it('должен генерировать классы для pr', () => {
        expect(rtlSpacing.pr('4')).toBe('pr-4 rtl:pr-0 rtl:pl-4');
      });
    });

    describe('rtlText', () => {
      it('должен содержать классы для left', () => {
        expect(rtlText.left).toBe('text-left rtl:text-right');
      });

      it('должен содержать классы для right', () => {
        expect(rtlText.right).toBe('text-right rtl:text-left');
      });

      it('должен содержать классы для center', () => {
        expect(rtlText.center).toBe('text-center');
      });

      it('должен содержать классы для justify', () => {
        expect(rtlText.justify).toBe('text-justify');
      });
    });

    describe('rtlFlex', () => {
      it('должен содержать классы для row', () => {
        expect(rtlFlex.row).toBe('flex-row rtl:flex-row-reverse');
      });

      it('должен содержать классы для rowReverse', () => {
        expect(rtlFlex.rowReverse).toBe('flex-row-reverse rtl:flex-row');
      });

      it('должен содержать классы для itemsStart', () => {
        expect(rtlFlex.itemsStart).toBe('items-start rtl:items-end');
      });

      it('должен содержать классы для itemsEnd', () => {
        expect(rtlFlex.itemsEnd).toBe('items-end rtl:items-start');
      });

      it('должен содержать классы для justifyStart', () => {
        expect(rtlFlex.justifyStart).toBe('justify-start rtl:justify-end');
      });

      it('должен содержать классы для justifyEnd', () => {
        expect(rtlFlex.justifyEnd).toBe('justify-end rtl:justify-start');
      });
    });

    describe('rtlPosition', () => {
      it('должен генерировать классы для left', () => {
        expect(rtlPosition.left('4')).toBe('left-4 rtl:left-auto rtl:right-4');
      });

      it('должен генерировать классы для right', () => {
        expect(rtlPosition.right('4')).toBe('right-4 rtl:right-auto rtl:left-4');
      });

      it('должен содержать классы для topLeft', () => {
        expect(rtlPosition.topLeft).toBe('top-0 left-0 rtl:left-auto rtl:right-0');
      });

      it('должен содержать классы для topRight', () => {
        expect(rtlPosition.topRight).toBe('top-0 right-0 rtl:right-auto rtl:left-0');
      });
    });

    describe('rtlBorderRadius', () => {
      it('должен генерировать классы для left', () => {
        expect(rtlBorderRadius.left('4')).toBe('rounded-l-4 rtl:rounded-l-none rtl:rounded-r-4');
      });

      it('должен генерировать классы для right', () => {
        expect(rtlBorderRadius.right('4')).toBe('rounded-r-4 rtl:rounded-r-none rtl:rounded-l-4');
      });
    });

    describe('rtlIcon', () => {
      it('должен содержать класс для flip', () => {
        expect(rtlIcon.flip).toBe('rtl:scale-x-[-1]');
      });

      it('должен содержать пустую строку для noFlip', () => {
        expect(rtlIcon.noFlip).toBe('');
      });
    });

    describe('getRTLClasses', () => {
      it('должен вернуть правильный объект для RTL локали', () => {
        const classes = getRTLClasses('ar');
        
        expect(classes.direction).toBe('rtl');
        expect(classes.isRTL).toBe(true);
        expect(classes.isLTR).toBe(false);
        expect(classes.spacing).toBeDefined();
        expect(classes.text).toBeDefined();
        expect(classes.flex).toBeDefined();
      });

      it('должен вернуть правильный объект для LTR локали', () => {
        const classes = getRTLClasses('ru');
        
        expect(classes.direction).toBe('ltr');
        expect(classes.isRTL).toBe(false);
        expect(classes.isLTR).toBe(true);
      });
    });

    describe('getRTLStyles', () => {
      it('должен вернуть стили с direction: rtl для арабской локали', () => {
        const styles = getRTLStyles('ar');
        expect(styles.direction).toBe('rtl');
      });

      it('должен вернуть стили с direction: ltr для русской локали', () => {
        const styles = getRTLStyles('ru');
        expect(styles.direction).toBe('ltr');
      });

      it('должен вернуть CSS свойства', () => {
        const styles = getRTLStyles('en');
        expect(styles).toHaveProperty('direction');
      });
    });
  });
});
