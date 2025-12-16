import type { IStoreState } from "@/store/state";

export interface IModalState {
    open: boolean;
    type?: string;
    trigger: string | number;
    title?: string;
    // eslint-disable-next-line
    payload?: any;
    setOpen: (properties: Pick<IModalState, "trigger" | "type" | "title" | "payload">) => void;
    setOpenChange: (opened: boolean) => void;
    setClose: () => void;
    reset: () => void;
}

const InitialState: Omit<IModalState, "setOpen" | "setOpenChange" | "setClose" | "reset"> = {
    open: false,
    type: "create",
    title: "",
    trigger: "",
    payload: null,
};

export const createModalStore: IStoreState<IModalState> = (set) => ({
    ...InitialState,
    setOpen: (properties) =>
        set((state) => {
            state.modal.open = true;
            state.modal.type = properties.type;
            state.modal.trigger = properties.trigger;
            state.modal.title = properties.title;
            state.modal.payload = properties.payload;
        }),
    setOpenChange: (opened) =>
        set((state) => {
            state.modal.open = opened;
        }),
    setClose: () =>
        set((state) => {
            state.modal.open = false;
        }),
    reset: () =>
        set((state) => {
            state.modal.open = InitialState.open;
            state.modal.type = InitialState.type;
            state.modal.title = InitialState.title;
            state.modal.trigger = InitialState.trigger;
            state.modal.payload = InitialState.payload;
        }),
});
