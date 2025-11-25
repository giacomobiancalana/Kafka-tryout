import { serializzatore } from "./jsonSerde";
import { kafka, createTopicIfNotExists } from "./kafka";
import { UserAction, UserEvent } from "./types";

function getActionFromArg(arg?: string): UserAction {
  const allowed: UserAction[] = ["LOGIN", "LOGOUT", "SIGNUP"];
  if (!arg) return "LOGIN";
  const upper = arg.toUpperCase();
  return (allowed.includes(upper as UserAction) ? upper : "LOGIN") as UserAction;
}

async function run() {
  const producer = kafka.producer();
  const topicName = `${process.env.DEFAULT_TOPIC}`;
  await createTopicIfNotExists(topicName);

  try {
    await producer.connect();
  } catch (error) {
    console.error("Non è stato possibile creare/connettere il producer");
  }

  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      try {
        console.log(`\n### Ricevuto ${signal}, stoppo e disconnetto il producer... ###`);
        await producer.disconnect();
        process.exit(0);
      } catch (error) {
        console.error(`Errore durante shutdown del producer:\n${error}`);
        process.exit(1);
      }
    });
  });

  try {
    const userId = process.argv[2] ?? "user-123";
    const action = getActionFromArg(process.argv[3]);

    const event: UserEvent = {
      userId,
      action,
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
  } catch (err) {
    console.error("[producer] Errore:\n", err);
  } finally {
    await producer.disconnect();
  }
}

// MAIN FUNCTION
try {
  run();
} catch (error) {
  console.error('Errore nella main function del producer:\n', error);
  process.exit(1);  
}
