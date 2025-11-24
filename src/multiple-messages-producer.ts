import { serializzatore } from "./jsonSerde";
import { kafka, prepareTopics, sleep } from "./kafka";
import { UserAction, UserEvent } from "./types";

async function run() {
  const producer = kafka.producer();
  const topicName = `${process.env.DEFAULT_TOPIC}`;
  await prepareTopics(topicName);

  try {
    await producer.connect();
  } catch (error) {
    console.error("Non è stato possibile creare/connettere il producer");
  }

  process.on("SIGINT", async () => {
    console.log("SIGINT ⇒ stop multiple messages producer");
    await producer.disconnect();
    process.exit(0);
  });

  try {

    for (let i = 0; i < 1000; i++) {
      const randomnum = Math.random() * 100;
      const action: UserAction = randomnum <= 33 ? 'LOGIN' : randomnum < 67 ? 'LOGOUT' : 'SIGNUP';
      const userId = `user-${Math.trunc(Math.random()*1000)}`;

      const event: UserEvent = {
        userId,
        action,
        // TODO: aggiungi messaggio
        timestamp: new Date().toISOString(),
        metadata: {
          source: "cli",
          note: "esempio Kafka TypeScript",
        },
      };
  
      console.log("[producer] Invio evento JSON:", event);
  
      await producer.send({
        topic: topicName,
        messages: [
          {
            key: event.userId,
            value: serializzatore<UserEvent>(event),
          },
        ],
      });
  
      console.log("[producer] Messaggio inviato!");
      await sleep(1500);
      
    }

  } catch (err) {
    console.error("[producer] Errore:\n", err);
  } finally {
    await producer.disconnect();
  }
}

run();
