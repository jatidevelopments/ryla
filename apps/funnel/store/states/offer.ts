import type { IStoreState } from "@/store/state";

export interface IOfferState {
    isSpecialOfferOpened: boolean;
    setIsSpecialOfferOpened: (value: boolean) => void;
}

export const createOfferStore: IStoreState<IOfferState> = (set) => ({
    isSpecialOfferOpened: false,
    setIsSpecialOfferOpened: (value) =>
        set((state) => {
            state.offer.isSpecialOfferOpened = value;
        }),
});
