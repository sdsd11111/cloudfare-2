import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const prisma = new PrismaClient();

async function runTest() {
  try {
    const payload = {
      title: "Test Error 500",
      client: {
        name: "test test test",
        ruc: "", email: "", phone: "", address: "", city: "", notes: ""
      },
      type: "OTHER",
      subtype: "Test",
      status: "LEAD",
      startDate: new Date().toISOString(),
      endDate: null,
      address: "",
      city: "",
      categoryList: ["OTRO"],
      contractTypeList: ["OTHER"],
      technicalSpecs: { description: "test" },
      budgetItems: [],
      files: [],
      clientId: null,
      team: []
    };

    const project = await prisma.$transaction(async (tx) => {
      let targetClientId = payload.clientId ? Number(payload.clientId) : null;

      if (!targetClientId && payload.client?.name) {
        const existingClient = await tx.client.findFirst({
          where: { name: payload.client.name }
        });

        if (existingClient) {
          targetClientId = existingClient.id;
        } else {
          const createdClient = await tx.client.create({
            data: {
              name: payload.client.name,
            }
          });
          targetClientId = createdClient.id;
        }
      }

      console.log('Target Client ID:', targetClientId);

      const newProject = await tx.project.create({
        data: {
          title: payload.title,
          type: payload.type as any,
          subtype: payload.subtype || null,
          status: payload.status as any,
          startDate: new Date(payload.startDate),
          address: payload.address || null,
          city: payload.city || null,
          clientId: targetClientId,
          createdBy: 1, // Assume Admin ID is 1
          estimatedBudget: 0,
          categoryList: JSON.stringify(payload.categoryList),
          contractTypeList: JSON.stringify(payload.contractTypeList),
          technicalSpecs: JSON.stringify(payload.technicalSpecs),
          budgetItems: { create: [] },
          phases: { create: [] },
          team: { create: [] },
          gallery: { create: [] }
        }
      });
      console.log('Created Project ID:', newProject.id);
      return newProject;
    });

    console.log("Success", project);

    // cleanup
    await prisma.project.delete({ where: { id: project.id } });

  } catch (error) {
    fs.writeFileSync('error_log.txt', String(error));
  } finally {
    await prisma.$disconnect();
  }
}
runTest();
