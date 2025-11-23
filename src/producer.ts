import { serializzatore } from "./jsonSerde";
import { kafka, prepareTopics } from "./kafka";
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
  await prepareTopics(topicName);

  try {
    await producer.connect();

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

run();
