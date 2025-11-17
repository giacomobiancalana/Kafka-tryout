import { kafka, topicName } from "./kafka";

async function run() {
  const groupId = process.env.GROUP_ID ?? "default-consumer-group";
  const consumer = kafka.consumer({ groupId });

  try {
    await consumer.connect();
    await consumer.subscribe({ topic: topicName, fromBeginning: true });

    console.log(`[consumer ${groupId}] In ascolto sul topic: ${topicName}`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const key = message.key?.toString();
        const value = message.value?.toString();
        const offset = message.offset;

        console.log(`[consumer] ${topic} [${partition}] offset ${offset} key=${key} value=${value}`);
      },
    });
  } catch (err) {
    console.error("[consumer] Errore:", err);
    process.exit(1);
  }
}

run()
