import { deserializzatore } from "./jsonSerde";
import { kafka, prepareTopics } from "./kafka";

async function run() {
  const groupId = process.env.GROUP_ID ?? "default-consumer-group";
  const consumer = kafka.consumer({ groupId });
  const topicName = `${process.env.DEFAULT_TOPIC}`;
  await prepareTopics(topicName);

  try {
    await consumer.connect();
  } catch (error) {
    console.error("Non è stato possibile connettere il consumer")
  }

  // Chiusura migliore, poi il restart sarà più veloce (scelta del group coordinator più veloce)
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      try {
        console.log(`Ricevuto ${signal}, stoppo e disconnetto il consumer...`);
        await consumer.stop();
        await consumer.disconnect();
        process.exit(0);
      } catch (error) {
        console.error(`Errore durante shutdown del consumer:\n${error}`);
        process.exit(1);
      }
    });
  });

  try {
    const consumerDescription = await consumer.describeGroup()
    console.log("describe group del consumer:\n", consumerDescription);

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
try {
  run();
} catch (error) {
  console.error('Errore nella main function del consumer:\n', error);
  process.exit(1);
}
