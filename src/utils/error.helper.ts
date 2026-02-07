// Types for the result object with discriminated union
type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  data: null;
  error: E;
};

type Result<T, E = Error> = Success<T> | Failure<E>;

// Main wrapper function (source: youtube, "Theo - t3․gg")
export async function tryCatchino<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}

// Other function, very similar (source: youtube, "Web Dev Simplified")
export async function catchError<T>(promise: Promise<T>): Promise<[undefined, T] | [Error]> {
  return promise
    .then(data => {
      return [undefined, data] as [undefined, T]
    })
    .catch((error: Error) => {
      return [error]}
    )
}


// ######################
// Funzioni che permettono di loggare dove sia stato catchato/catturato l'errore, non solo dove si è generato.
// Utile soprattutto quando si usano funzioni di altre librerie, che magari rimandano al codice di queste.

const frasePerCatchErroreConAnadataACapo = `Dove è stato catchato l'errore -> Guarda il secondo risultato dello stack (il primo sarà error.helper.ts):\n`;

function provaTryCatchConLogPosizioneFileErrore() {
  let str: string;
  try {
    str = 'dscnjds';
    console.log(str);
  } catch (error) {
    const catchSite = new Error("Catch site").stack;
    console.error(frasePerCatchErroreConAnadataACapo, catchSite);
    throw error;
  }
}


export function catchErrorCodeForFilePosition(error: Error) {
  const catchSite = new Error("Catch site").stack;
  console.error(frasePerCatchErroreConAnadataACapo, catchSite);
  throw error;
}
