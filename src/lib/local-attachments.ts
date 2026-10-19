const DATABASE_NAME = "xyz-pvt-ltd-portal-files";
const STORE_NAME = "attachments";

export type LocalAttachmentPayload = {
  blob: Blob;
  encoding: "text" | "data-url";
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Browser file storage could not be opened."));
  });
}

export async function saveLocalAttachment(id: string, file: File): Promise<void> {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put(file, id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("The attachment could not be saved."));
      transaction.onabort = () => reject(transaction.error ?? new Error("The attachment save was cancelled."));
    });
  } finally {
    database.close();
  }
}

export async function getLocalAttachment(id: string): Promise<Blob | null> {
  const database = await openDatabase();
  try {
    return await new Promise<Blob | null>((resolve, reject) => {
      const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(id);
      request.onsuccess = () => resolve(request.result instanceof Blob ? request.result : null);
      request.onerror = () => reject(request.error ?? new Error("The attachment could not be opened."));
    });
  } finally {
    database.close();
  }
}

export async function removeLocalAttachment(id: string): Promise<void> {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("The attachment could not be removed."));
    });
  } finally {
    database.close();
  }
}

export async function migrateLegacyAttachment(id: string, content: string, encoding: "text" | "data-url", type: string): Promise<void> {
  if (!content) return;
  const blob = encoding === "text"
    ? new Blob([content], { type })
    : await (await fetch(content)).blob();
  await saveLocalAttachment(id, new File([blob], "legacy-attachment", { type: type || blob.type }));
}