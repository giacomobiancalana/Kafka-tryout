import { Kafka } from "kafkajs";


export const kafka = new Kafka({
  clientId: "my-node-ts-app",
  brokers: ["localhost:9092"], // cambia se hai un altro host
});

export const topicName = "test-topic";
