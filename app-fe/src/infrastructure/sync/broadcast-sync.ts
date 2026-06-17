export const SYNC_CHANNEL_NAME = "vault-track-sync";

export type SyncMessage = {
  type: "DATA_CHANGED";
};

export function notifyDataChanged(): void {
  if (typeof BroadcastChannel === "undefined") {
    return;
  }

  const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  channel.postMessage({ type: "DATA_CHANGED" } satisfies SyncMessage);
  channel.close();
}

export function subscribeToDataChanges(onChange: () => void): () => void {
  if (typeof BroadcastChannel === "undefined") {
    return () => undefined;
  }

  const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  channel.onmessage = (event: MessageEvent<SyncMessage>) => {
    if (event.data?.type === "DATA_CHANGED") {
      onChange();
    }
  };

  return () => channel.close();
}
