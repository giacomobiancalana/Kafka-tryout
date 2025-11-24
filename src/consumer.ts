import { deserializzatore } from "./jsonSerde";
import { kafka, prepareTopics } from "./kafka";

async function run() {
  const groupId = process.env.GROUP_ID ?? "default-consumer-group";
  const consumer = kafka.consumer({ groupId });
  const topicName = `${process.env.DEFAULT_TOPIC}`;
  await prepareTopics(topicName);

  try {
    await consumer.connect();

    const consumerDescription = await consumer.describeGroup()
    console.log("describe group del consumer:\n", consumerDescription);

    // Chiusura migliore, poi il restart sarà più veloce (scelta del group coordinator)
    process.on("SIGINT", async () => {
      console.log("SIGINT ⇒ stop consumer");
      await consumer.stop();
      await consumer.disconnect();
      process.exit(0);
    });

    await consumer.subscribe({ topic: topicName, fromBeginning: true });

    console.log(`[consumer ${groupId}] In ascolto sul topic: ${topicName}`);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const key = message.key?.toString();
        const value = message.value?.toString();
        const valueDeser = deserializzatore(value);
        const offset = message.offset;

        console.log(`[Consumer] topic: ${topic} partition: [${partition}] offset: ${offset} key: ${key}\n value:`, valueDeser);
      },
    });
  } catch (err) {
    console.error("[consumer] Errore:", err);
    process.exit(1);
  }
}

// CALLING MAIN FUNCTION
run();
