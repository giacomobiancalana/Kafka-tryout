- Serve di scrivere ciò che è stato fatto finora e come navigare i file

- ricordati del .env: quali sono le variabili importanti?

- apri 3 terminali:
  - uno per avviare i 4 container kafka (1 di ui, gli altri 3 sono ognuno sia controller che broker, sennò ne dovremmo fare 6);
  - uno per il consumer (sennò fai più tab terminale aperte per più consumer, ci sta! ognuno magari con un identificativo diverso??
    Riguardati la teoria su partizioni (penso concetto relativo ai topic e messaggi) e group_id dei consumer)
  - uno per il producer (o un send multiple messages producer, oppure sennò fai più tab terminale aperte per più producer)

# comandi principali sul package.json
- ricordati che di solito dobbiamo mettere la variabile GROUP_ID prima del comando del consumer, ecco:
    GROUP_ID=1 npm run consumer, che sarebbe GROUP_ID=1 ts-node src/consumer.ts
- sul producer o sul multiple-messages-producer invece basta il comando normale

# TODO
- Non ricordo per quale motivo ho provato a creare il file reader-consumer.ts, perché è uguale a consumer.ts (non so cosa avevo in mente di fare)

# Comandi utili
- dentro container (o facendo docker exec -it \<comando>): kafka-topics --list --bootstrap-server localhost:9092

# Entra nel container
docker exec -it kafka bash

# (dentro al container) crea un topic di test
/opt/kafka/bin/kafka-topics.sh --create \
  --topic test-topic \
  --bootstrap-server localhost:9092 \
  --partitions 1 --replication-factor 1

# Producer
/opt/kafka/bin/kafka-console-producer.sh \
  --topic test-topic \
  --bootstrap-server localhost:9092
# scrivi qualche riga e invia con Invio

# Consumer (nuova shell nel container o nuova exec)
# vedrai i messaggi che hai scritto
/opt/kafka/bin/kafka-console-consumer.sh \
  --topic test-topic \
  --from-beginning \
  --bootstrap-server localhost:9092

# Creare un topic specificando partizioni e replication factor
kafka-topics.sh \
  --create \
  --bootstrap-server localhost:9092 \
  --topic my-topic \
  --partitions 3 \
  --replication-factor 2

# Forzare un replica assignment custom
  kafka-topics.sh \
  --create \
  --bootstrap-server localhost:9092 \
  --topic my-topic \
  --replica-assignment 0:1,1:2,2:0