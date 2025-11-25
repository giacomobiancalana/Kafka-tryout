import * as dotenv from 'dotenv';
dotenv.config();

import { Kafka } from "kafkajs";


export const kafka = new Kafka({
  clientId: "my-node-ts-app",
  brokers: [`localhost:${process.env.KAFKA_1_PORT}`, `localhost:${process.env.KAFKA_2_PORT}`, `localhost:${process.env.KAFKA_3_PORT}`],
});

export const topicName = process.env.DEFAULT_TOPIC;

export async function createTopicIfNotExists(topicName: string) {
  const admin = kafka.admin();
  try {
    await admin.connect();
  } catch (error) {
    console.error('Non è stato possibile connettere un admin');
    throw error;
  }

  try {
    const topicsList = await admin.listTopics();
    console.log("Ecco i topics:", topicsList);
    if (!topicsList.includes(topicName)) {
      await admin.createTopics({
        topics: [
          {
            topic: topicName,
            numPartitions: 3,
            replicationFactor: 3,
          },
        ]
      });
      console.log(`Topic "${topicName}" creato.`);
    } else {
      console.log(`Topic "${topicName}" esiste già.`);
    }
  } catch(error) {
    console.error(`Non è stato possibile listare i topic già esistenti o creare il topic "${topicName}"`);
    throw error;
  } finally {
    await admin.disconnect();
  }
}

export async function sleep(milliSecs: number): Promise<void> {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res();
    }, milliSecs);
  })
}
