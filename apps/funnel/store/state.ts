import type { StateCreator } from "zustand";
import { createStore } from "zustand";
import { useStore as useZustandStore } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { createModalStore, IModalState } from "@/store/states/modal";
import { createOfferStore, IOfferState } from "@/store/states/offer";

export type IStoreState<T> = StateCreator<
    IStore,
    [["zustand/immer", never], ["zustand/devtools", never]],
    [],
    T
>;

export interface IStore {
    modal: IModalState;
    offer: IOfferState;
}

export const store = createStore<IStore>()(
    immer(
        devtools(
            (...a) => ({
                modal: createModalStore(...a),
                offer: createOfferStore(...a),
            }),
            {
                enabled: true,
                name: "MDC Store",
            },
        ),
    ),
);

export function useStore<T>(selector: (state: IStore) => T) {
    return useZustandStore(store, selector);
}

export function getStore() {
    return store.getState();
}
