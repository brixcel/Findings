export interface QuestionConfig {
  itemId: string;
  criterion: string;
  itemNumber: number;
  questionText: string;
  applicableRespondentType: 'STUDENT' | 'EXPERT' | 'ALL';
  displayOrder: number;
}

export const CRITERIA_ORDER = [
  'Functionality',
  'Reliability',
  'Usability',
  'Efficiency',
  'Portability',
  'Maintainability',
  'Educational Effectiveness',
] as const;

export const SHARED_CRITERIA = [
  'Functionality',
  'Reliability',
  'Usability',
  'Efficiency',
  'Portability',
] as const;

export const DEFAULT_QUESTIONS: QuestionConfig[] = [
  // A. FUNCTIONALITY (5 items - ALL)
  {
    itemId: 'FUNC_1',
    criterion: 'Functionality',
    itemNumber: 1,
    questionText: 'The AR-DUINO-M correctly displays Arduino pin functions and components.',
    applicableRespondentType: 'ALL',
    displayOrder: 1,
  },
  {
    itemId: 'FUNC_2',
    criterion: 'Functionality',
    itemNumber: 2,
    questionText: 'The AR-DUINO-M performs its intended functions accurately.',
    applicableRespondentType: 'ALL',
    displayOrder: 2,
  },
  {
    itemId: 'FUNC_3',
    criterion: 'Functionality',
    itemNumber: 3,
    questionText: 'The AR-DUINO-M supports interaction with sensors, LEDs, and motors effectively.',
    applicableRespondentType: 'ALL',
    displayOrder: 3,
  },
  {
    itemId: 'FUNC_4',
    criterion: 'Functionality',
    itemNumber: 4,
    questionText: 'The AR-DUINO-M provides useful real-time feedback during operation.',
    applicableRespondentType: 'ALL',
    displayOrder: 4,
  },
  {
    itemId: 'FUNC_5',
    criterion: 'Functionality',
    itemNumber: 5,
    questionText: 'The AR-DUINO-M provides accurate step-by-step guidance for wiring and operating Arduino components.',
    applicableRespondentType: 'ALL',
    displayOrder: 5,
  },

  // B. RELIABILITY (5 items - ALL)
  {
    itemId: 'RELI_1',
    criterion: 'Reliability',
    itemNumber: 1,
    questionText: 'The AR tracking is stable and consistent during use.',
    applicableRespondentType: 'ALL',
    displayOrder: 6,
  },
  {
    itemId: 'RELI_2',
    criterion: 'Reliability',
    itemNumber: 2,
    questionText: 'The AR-DUINO-M runs smoothly without lag or crashes.',
    applicableRespondentType: 'ALL',
    displayOrder: 7,
  },
  {
    itemId: 'RELI_3',
    criterion: 'Reliability',
    itemNumber: 3,
    questionText: 'The AR-DUINO-M performs well under normal usage conditions.',
    applicableRespondentType: 'ALL',
    displayOrder: 8,
  },
  {
    itemId: 'RELI_4',
    criterion: 'Reliability',
    itemNumber: 4,
    questionText: 'The AR-DUINO-M can continuously operate without unexpected errors.',
    applicableRespondentType: 'ALL',
    displayOrder: 9,
  },
  {
    itemId: 'RELI_5',
    criterion: 'Reliability',
    itemNumber: 5,
    questionText: 'The AR-DUINO-M recovers properly after interruptions or errors.',
    applicableRespondentType: 'ALL',
    displayOrder: 10,
  },

  // C. USABILITY (5 items - ALL)
  {
    itemId: 'USAB_1',
    criterion: 'Usability',
    itemNumber: 1,
    questionText: 'The AR-DUINO-M is easy to learn and use, with clear instructions and prompts for beginners.',
    applicableRespondentType: 'ALL',
    displayOrder: 11,
  },
  {
    itemId: 'USAB_2',
    criterion: 'Usability',
    itemNumber: 2,
    questionText: 'Navigation and interaction with virtual components and controls are simple and intuitive.',
    applicableRespondentType: 'ALL',
    displayOrder: 12,
  },
  {
    itemId: 'USAB_3',
    criterion: 'Usability',
    itemNumber: 3,
    questionText: 'The AR-DUINO-M minimizes confusion when performing tasks.',
    applicableRespondentType: 'ALL',
    displayOrder: 13,
  },
  {
    itemId: 'USAB_4',
    criterion: 'Usability',
    itemNumber: 4,
    questionText: 'The design, layout, and interface elements (buttons, menus, labels) are visually appealing and well-organized.',
    applicableRespondentType: 'ALL',
    displayOrder: 14,
  },
  {
    itemId: 'USAB_5',
    criterion: 'Usability',
    itemNumber: 5,
    questionText: 'The AR overlays are clear and provide an immersive, engaging AR experience.',
    applicableRespondentType: 'ALL',
    displayOrder: 15,
  },

  // D. EFFICIENCY (5 items - ALL)
  {
    itemId: 'EFFI_1',
    criterion: 'Efficiency',
    itemNumber: 1,
    questionText: 'The AR-DUINO-M responds quickly to user actions.',
    applicableRespondentType: 'ALL',
    displayOrder: 16,
  },
  {
    itemId: 'EFFI_2',
    criterion: 'Efficiency',
    itemNumber: 2,
    questionText: 'The AR-DUINO-M loads AR features within an acceptable time.',
    applicableRespondentType: 'ALL',
    displayOrder: 17,
  },
  {
    itemId: 'EFFI_3',
    criterion: 'Efficiency',
    itemNumber: 3,
    questionText: 'Resource usage such as battery and memory consumption is efficient.',
    applicableRespondentType: 'ALL',
    displayOrder: 18,
  },
  {
    itemId: 'EFFI_4',
    criterion: 'Efficiency',
    itemNumber: 4,
    questionText: 'The AR-DUINO-M maintains good performance during prolonged use.',
    applicableRespondentType: 'ALL',
    displayOrder: 19,
  },
  {
    itemId: 'EFFI_5',
    criterion: 'Efficiency',
    itemNumber: 5,
    questionText: 'The AR-DUINO-M efficiently processes user inputs and outputs.',
    applicableRespondentType: 'ALL',
    displayOrder: 20,
  },

  // E. PORTABILITY (5 items - ALL)
  {
    itemId: 'PORT_1',
    criterion: 'Portability',
    itemNumber: 1,
    questionText: 'The AR-DUINO-M ran smoothly on the device I used.',
    applicableRespondentType: 'ALL',
    displayOrder: 21,
  },
  {
    itemId: 'PORT_2',
    criterion: 'Portability',
    itemNumber: 2,
    questionText: "The AR-DUINO-M's requirements (storage, sensors, camera) are minimal and can generally be met by many Android devices.",
    applicableRespondentType: 'ALL',
    displayOrder: 22,
  },
  {
    itemId: 'PORT_3',
    criterion: 'Portability',
    itemNumber: 3,
    questionText: 'The AR-DUINO-M can be installed and used easily on supported devices.',
    applicableRespondentType: 'ALL',
    displayOrder: 23,
  },
  {
    itemId: 'PORT_4',
    criterion: 'Portability',
    itemNumber: 4,
    questionText: 'The AR-DUINO-M worked properly without requiring extra setup or configuration on my device.',
    applicableRespondentType: 'ALL',
    displayOrder: 24,
  },
  {
    itemId: 'PORT_5',
    criterion: 'Portability',
    itemNumber: 5,
    questionText: 'The AR-DUINO-M functions properly across different real-world conditions (e.g., lighting, surface, or workspace setup).',
    applicableRespondentType: 'ALL',
    displayOrder: 25,
  },

  // F. MAINTAINABILITY (5 items - EXPERTS ONLY)
  {
    itemId: 'MAIN_1',
    criterion: 'Maintainability',
    itemNumber: 1,
    questionText: 'The AR-DUINO-M design allows easy modification and improvement of features.',
    applicableRespondentType: 'EXPERT',
    displayOrder: 26,
  },
  {
    itemId: 'MAIN_2',
    criterion: 'Maintainability',
    itemNumber: 2,
    questionText: 'Errors and issues in the AR-DUINO-M can be easily identified and corrected.',
    applicableRespondentType: 'EXPERT',
    displayOrder: 27,
  },
  {
    itemId: 'MAIN_3',
    criterion: 'Maintainability',
    itemNumber: 3,
    questionText: 'The AR-DUINO-M structure supports future updates and enhancements.',
    applicableRespondentType: 'EXPERT',
    displayOrder: 28,
  },
  {
    itemId: 'MAIN_4',
    criterion: 'Maintainability',
    itemNumber: 4,
    questionText: 'The AR-DUINO-M components are organized properly for maintenance purposes.',
    applicableRespondentType: 'EXPERT',
    displayOrder: 29,
  },
  {
    itemId: 'MAIN_5',
    criterion: 'Maintainability',
    itemNumber: 5,
    questionText: 'The AR-DUINO-M can be improved without affecting overall functionality.',
    applicableRespondentType: 'EXPERT',
    displayOrder: 30,
  },

  // G. EDUCATIONAL EFFECTIVENESS (5 items - STUDENTS ONLY)
  {
    itemId: 'EDUC_1',
    criterion: 'Educational Effectiveness',
    itemNumber: 1,
    questionText: 'The AR-DUINO-M improves my understanding of Arduino and microcontrollers.',
    applicableRespondentType: 'STUDENT',
    displayOrder: 31,
  },
  {
    itemId: 'EDUC_2',
    criterion: 'Educational Effectiveness',
    itemNumber: 2,
    questionText: 'AR visualization helps me connect theory with actual hardware.',
    applicableRespondentType: 'STUDENT',
    displayOrder: 32,
  },
  {
    itemId: 'EDUC_3',
    criterion: 'Educational Effectiveness',
    itemNumber: 3,
    questionText: 'The AR-DUINO-M application enhances my problem-solving skills.',
    applicableRespondentType: 'STUDENT',
    displayOrder: 33,
  },
  {
    itemId: 'EDUC_4',
    criterion: 'Educational Effectiveness',
    itemNumber: 4,
    questionText: 'The AR-DUINO-M increases my engagement and interest in learning.',
    applicableRespondentType: 'STUDENT',
    displayOrder: 34,
  },
  {
    itemId: 'EDUC_5',
    criterion: 'Educational Effectiveness',
    itemNumber: 5,
    questionText: 'The AR-DUINO-M is an effective tool for hands-on learning.',
    applicableRespondentType: 'STUDENT',
    displayOrder: 35,
  },
];

export function getApplicableQuestions(respondentType: 'STUDENT' | 'EXPERT'): QuestionConfig[] {
  return DEFAULT_QUESTIONS.filter((q) => {
    if (respondentType === 'STUDENT') {
      return q.applicableRespondentType === 'ALL' || q.applicableRespondentType === 'STUDENT';
    } else {
      return q.applicableRespondentType === 'ALL' || q.applicableRespondentType === 'EXPERT';
    }
  }).sort((a, b) => a.displayOrder - b.displayOrder);
}
