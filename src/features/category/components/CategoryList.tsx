import React from 'react';
import { Category } from '../../../types/category';
import { useTranslation } from 'react-i18next';


interface Props {
  categories: Category[];
  onSelect?: (category: Category) => void;
}

export const CategoryList: React.FC<Props> = ({ categories, onSelect }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ti') ? 'ti' : 'en';

  const getCategoryName = (category: Category): string => {
    if (category.name_display) return category.name_display;

    const name = category.name;
    if (typeof name === 'string') return name;

    return (name as any)?.[lang] ?? (name as any)?.en ?? (name as any)?.ti ?? '';
  };

  return (
    <ul>
      {categories.map((category) => (
        <li key={category.id} onClick={() => onSelect?.(category)}>
          {getCategoryName(category)}
        </li>
      ))}
    </ul>
  );
};
