
export const checkIndexedDB = (databaseName, item, cutoff) => {
    const request = window.indexedDB.open(databaseName, 1)

    request.onerror = (event) => {
        console.log('Unable to open the database.');
    }

    request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(item, 'readonly');
        const objectStore = transaction.objectStore(item);
        const timestamp = objectStore.index('timestamp');

        const range = IDBKeyRange.lowerBound(cutoff);

        const request = timestamp.openCursor(range);

        request.onerror = (event) => {
            console('Error reading from indexedDB.');
        };

        const results = [];

        request.onsuccess = (event) => {
            const cursor = event.target.result;

           console.log({cursor})
        };

    }

    request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(item)) {
            db.createObjectStore(item, { keypath: 'timestamp' })
        }

    }


}