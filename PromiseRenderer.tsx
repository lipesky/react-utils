import { ReactNode, useEffect, useState } from "react";

export type PromiseFulfilledBuilder<T> = (value: T) => JSX.Element;
export type PromiseRejectedBuilder = (reason: any) => JSX.Element;
export type PromiseBuilder<T> = (value: T) => JSX.Element;

interface PromiseRendererProps<T>{
    promise: Promise<T>;
    fulfilledBuilder: PromiseFulfilledBuilder<T>;
    rejectedBuilder?: PromiseRejectedBuilder;
    pendingBuilder?: () => ReactNode;
}

enum PromiseState {
    pending,
    fulfilled,
    rejected,
}
export const PromiseRenderer = <T extends unknown>(props: PromiseRendererProps<T>): JSX.Element => {

    const [promiseState, setPromiseState] = useState<PromiseState>(PromiseState.pending);
    const [value, setValue] = useState<any>(null);

    useEffect(
        () =>{
            props.promise.then(
                (value) =>{
                    setPromiseState(PromiseState.fulfilled);
                    setValue(value);
                },
                (value) =>{
                    setPromiseState(PromiseState.rejected);
                    setValue(value);
                },
            )
        },
        []
    );

    switch(promiseState){
        case PromiseState.pending: 
            return props.pendingBuilder ? props.pendingBuilder() : (<></>) as any;
        case PromiseState.rejected:
            return props.rejectedBuilder ? props.rejectedBuilder(value) : props.fulfilledBuilder(value);
        default: //PromiseState.fulfilled:
            return props.fulfilledBuilder(value);
    }
}