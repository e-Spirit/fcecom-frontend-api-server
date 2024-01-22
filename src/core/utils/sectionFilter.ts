import { Section } from 'fsxa-api';

/**
 * Removes empty sections.
 * A section is empty if it has no values set in their data.
 *
 * @private
 * @param contentSlot The slot to check.
 * @return Whether or not the slot is empty.
 */
export const filterEmptySections = (sections: Section[]) => {
  const isEntryEmpty = (entry: any) => {
    if (entry === null) {
      return true;
    }
    if (Array.isArray(entry) && entry.length === 0) {
      return true;
    }
    if (typeof entry === 'object' && entry.type === 'Option') {
      return true;
    }
    return false;
  };

  return sections.filter((section) => {
    let isEmpty = true;
    if (section.data) {
      Object.keys(section.data).forEach((key) => {
        const entry = (section.data as any)[key];
        if (!isEntryEmpty(entry)) {
          isEmpty = false;
        }
      });
    }

    return !isEmpty;
  });
};
