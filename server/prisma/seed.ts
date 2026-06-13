import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Initial Users
  const usersData = [
    { name: 'Aisha', email: 'aisha@example.com' },
    { name: 'Rohan', email: 'rohan@example.com' },
    { name: 'Priya', email: 'priya@example.com' },
    { name: 'Meera', email: 'meera@example.com' },
    { name: 'Dev', email: 'dev@example.com' },
    { name: 'Sam', email: 'sam@example.com' },
    { name: 'Kabir', email: 'kabir@example.com' },
  ];

  const users = await Promise.all(
    usersData.map((u) =>
      prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          ...u,
          password: hashedPassword,
        },
      })
    )
  );

  console.log('Users seeded');

  // Primary Group
  const group = await prisma.group.upsert({
    where: { id: 'primary-group-id' },
    update: {},
    create: {
      id: 'primary-group-id',
      name: 'Flat 402',
    },
  });

  console.log('Group seeded');

  // Memberships
  // Meera moved out at the end of March
  // Sam moved in mid-April
  const memberships = [
    { name: 'Aisha', joinedAt: new Date('2026-02-01'), leftAt: null },
    { name: 'Rohan', joinedAt: new Date('2026-02-01'), leftAt: null },
    { name: 'Priya', joinedAt: new Date('2026-02-01'), leftAt: null },
    { name: 'Meera', joinedAt: new Date('2026-02-01'), leftAt: new Date('2026-03-31T23:59:59') },
    { name: 'Dev', joinedAt: new Date('2026-02-01'), leftAt: null }, // Dev is a visitor but let's keep him in for splits
    { name: 'Sam', joinedAt: new Date('2026-04-15'), leftAt: null },
    { name: 'Kabir', joinedAt: new Date('2026-03-11'), leftAt: new Date('2026-03-11T23:59:59') },
  ];

  for (const m of memberships) {
    const user = users.find((u) => u.name === m.name);
    if (user) {
      await prisma.groupMember.upsert({
        where: { groupId_userId: { groupId: group.id, userId: user.id } },
        update: { joinedAt: m.joinedAt, leftAt: m.leftAt },
        create: {
          groupId: group.id,
          userId: user.id,
          joinedAt: m.joinedAt,
          leftAt: m.leftAt,
        },
      });
    }
  }

  console.log('Memberships seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
