import { PrismaClient } from '@prisma/client';
import { DEFAULT_QUESTIONS } from '../src/lib/questionnaire-config';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding official 35 questionnaire indicators from research questionnaire...');

  for (const q of DEFAULT_QUESTIONS) {
    await prisma.question.upsert({
      where: { itemId: q.itemId },
      update: {
        criterion: q.criterion,
        itemNumber: q.itemNumber,
        questionText: q.questionText,
        applicableRespondentType: q.applicableRespondentType,
        displayOrder: q.displayOrder,
      },
      create: {
        itemId: q.itemId,
        criterion: q.criterion,
        itemNumber: q.itemNumber,
        questionText: q.questionText,
        applicableRespondentType: q.applicableRespondentType,
        displayOrder: q.displayOrder,
      },
    });
  }

  const count = await prisma.question.count();
  console.log(`Seeding complete. ${count} questions in database.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
