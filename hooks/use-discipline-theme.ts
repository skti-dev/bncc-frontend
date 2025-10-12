import { BaseColors, DisciplineColors } from '@/constants/theme';
import { Disciplina } from '@/services/questionsApi';
import { useMemo } from 'react';

export interface DisciplineTheme {
  primary: string;
  secondary: string;
  light: string;
  dark: string;
  gradient: string[];
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

export function useDisciplineTheme(disciplina?: Disciplina): DisciplineTheme {
  return useMemo(() => {
    const getThemeColors = () => {
      switch (disciplina) {
        case Disciplina.PORTUGUES:
          return DisciplineColors.portugues;
        case Disciplina.MATEMATICA:
          return DisciplineColors.matematica;
        case Disciplina.CIENCIAS:
          return DisciplineColors.ciencias;
        default:
          return {
            primary: BaseColors.gray[600],
            secondary: BaseColors.gray[500],
            light: BaseColors.gray[100],
            dark: BaseColors.gray[800],
            gradient: [BaseColors.gray[600], BaseColors.gray[500]],
            accent: BaseColors.info,
          };
      }
    };

    const colors = getThemeColors();

    return {
      ...colors,
      background: colors.light,
      surface: BaseColors.white,
      text: BaseColors.gray[900],
      textSecondary: BaseColors.gray[600],
    };
  }, [disciplina]);
}

export function getDisciplineEmoji(disciplina: Disciplina): string {
  switch (disciplina) {
    case Disciplina.PORTUGUES:
      return '📚';
    case Disciplina.MATEMATICA:
      return '🔢';
    case Disciplina.CIENCIAS:
      return '🔬';
    default:
      return '📖';
  }
}

export function getDisciplineName(disciplina: Disciplina): string {
  switch (disciplina) {
    case Disciplina.PORTUGUES:
      return 'Português';
    case Disciplina.MATEMATICA:
      return 'Matemática';
    case Disciplina.CIENCIAS:
      return 'Ciências';
    default:
      return 'Disciplina';
  }
}