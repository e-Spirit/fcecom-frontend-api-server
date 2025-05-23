import { Section } from 'fsxa-api';
import { filterEmptySections } from './sectionFilter';

describe('sectionFilter', () => {
  describe('sectionFilter', () => {
    it('removes untranslated sections', () => {
      // Arrange
      const sections = [
        {
          children: [],
          type: 'Section',
          data: {
            name: 'VALUE',
          },
          id: 'TRANSLATED_SECTION',
          previewId: 'PreviewId',
          sectionType: 'SECTIONTYPE',
        },
        {
          children: [],
          type: 'Section',
          data: {
            name: null,
          },
          id: 'UNTRANSLATED_SECTION_NULL',
          previewId: 'PreviewId',
          sectionType: 'SECTIONTYPE',
        },
        {
          children: [],
          type: 'Section',
          data: {
            name: null,
            option: {
              type: 'Option',
            },
          },
          id: 'UNTRANSLATED_SECTION_WITH_OPTION',
          previewId: 'PreviewId',
          sectionType: 'SECTIONTYPE',
        },
        {
          children: [],
          type: 'Section',
          data: {
            name: [],
          },
          id: 'UNTRANSLATED_SECTION_WITH_ARRAY',
          previewId: 'PreviewId',
          sectionType: 'SECTIONTYPE',
        },
      ] as Section[];

      // Act
      const result = filterEmptySections(sections);

      // Assert
      expect(result.length).toEqual(1);
      expect(result[0].id).toEqual('TRANSLATED_SECTION');
    });
  });
});
