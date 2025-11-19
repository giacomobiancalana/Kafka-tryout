import { kafka, prepareTopics } from "./kafka";

async function run() {
  const producer = kafka.producer();
  const topicName = `${process.env.DEFAULT_TOPIC}`;
  await prepareTopics(topicName);

  try {
    await producer.connect();

    // prendo il messaggio dalla CLI, altrimenti uso un default
    const message = process.argv[2] ?? "Messaggio di default dal producer TS";

    console.log("[producer] Invio messaggio:", message);

    await producer.send({
      topic: topicName,
      messages: [
        {
          key: "key1",
          value: message,
        },
      ],
    });

    console.log("[producer] Messaggio inviato!");
  } catch (err) {
    console.error("[producer] Errore:", err);
  } finally {
    await producer.disconnect();
  }
}

run();
