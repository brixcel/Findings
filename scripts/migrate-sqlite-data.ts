import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const dumpPath = path.join(__dirname, '../prisma/sqlite_dump.json');
  if (!fs.existsSync(dumpPath)) {
    throw new Error('Dump file not found');
  }

  const raw = fs.readFileSync(dumpPath, 'utf-8');
  const data = JSON.parse(raw);

  console.log(`Importing ${data.questions.length} questions...`);
  for (const q of data.questions) {
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

  console.log(`Importing ${data.respondents.length} respondents...`);
  for (const r of data.respondents) {
    await prisma.respondent.upsert({
      where: { id: r.id },
      update: {
        respondentType: r.respondentType,
        academicProgram: r.academicProgram,
        yearLevel: r.yearLevel,
        deviceUsed: r.deviceUsed,
        status: r.status,
        remarks: r.remarks ?? null,
        isDemo: Boolean(r.isDemo),
        createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
        updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
      },
      create: {
        id: r.id,
        respondentType: r.respondentType,
        academicProgram: r.academicProgram,
        yearLevel: r.yearLevel,
        deviceUsed: r.deviceUsed,
        status: r.status,
        remarks: r.remarks ?? null,
        isDemo: Boolean(r.isDemo),
        createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
        updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
      },
    });
  }

  console.log(`Importing ${data.answers.length} answers...`);
  const chunkSize = 100;
  for (let i = 0; i < data.answers.length; i += chunkSize) {
    const batch = data.answers.slice(i, i + chunkSize);
    await prisma.$transaction(
      batch.map((a: any) =>
        prisma.answer.upsert({
          where: {
            respondentId_itemId: {
              respondentId: a.respondentId,
              itemId: a.itemId,
            },
          },
          update: {
            criterion: a.criterion,
            rating: a.rating,
            createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
            updatedAt: a.updatedAt ? new Date(a.updatedAt) : new Date(),
          },
          create: {
            id: a.id,
            respondentId: a.respondentId,
            itemId: a.itemId,
            criterion: a.criterion,
            rating: a.rating,
            createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
            updatedAt: a.updatedAt ? new Date(a.updatedAt) : new Date(),
          },
        })
      )
    );
    process.stdout.write(`\rImported answers batch ${Math.floor(i / chunkSize) + 1}/${Math.ceil(data.answers.length / chunkSize)}`);
  }

  console.log('\nData import successfully completed!');
  const respCount = await prisma.respondent.count();
  const ansCount = await prisma.answer.count();
  console.log(`Render PostgreSQL now has: ${respCount} respondents, ${ansCount} answers.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
