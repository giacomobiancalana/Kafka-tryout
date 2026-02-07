import { Producer } from "kafkajs";
import { serializzatore } from "./jsonSerde";
import { kafka, createTopicIfNotExists, sleep } from "./kafka";
import { UserAction, UserEvent } from "./types";

const timeBetweenTwoMessagesInMs = 3000;

async function run(producer: Producer, topicName: string) {
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
      await sleep(timeBetweenTwoMessagesInMs);
    }

  } catch (err) {
    console.error("[producer] Errore:\n", err);
  } finally {
    await producer.disconnect();
  }
}

/** Funzione/Handler per la gestione delle interruzioni */
async function handlerInterruption(signal: NodeJS.Signals, shuttingDown: boolean, producer: Producer) {
  if (shuttingDown) {
    return null;
  }
  shuttingDown = true;
  try {
    console.log(`\n### Ricevuto ${signal}, stoppo e disconnetto il multiple messages producer... ###`);
    await producer.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`Errore durante shutdown del producer:\n${error}`);
    process.exit(1);
  }
}

function wrapperHandlersInterruptions(producer: Producer) {
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  let shuttingDown = false;
  signals.forEach((signal) => {
    process.on(signal, () => handlerInterruption(signal, shuttingDown, producer));
  });
}

// MAIN FUNCTION
async function main() {

  // 1) Creo il producer Kafka
  const producer = kafka.producer();
  const topicName = `${process.env.DEFAULT_TOPIC}`;

  // 2) Il topic DEVE essere creato o esistere già
  try {
    await createTopicIfNotExists(topicName);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  // 3) Il producer DEVE essere connesso
  try {
    await producer.connect();
  } catch (error) {
    console.error("Non è stato possibile creare/connettere il producer");
  }

  // 4) Gestione interruzioni: chiusura migliore, poi il restart sarà più veloce
  wrapperHandlersInterruptions(producer);

  // 5) Ora posso eseguire la funzione principale
  try {
    run(producer, topicName);
  } catch (error) {
    console.error(`Errore nella main function del multiple messages producer:\n${error}`);
    process.exit(1);
  }

}

main();
