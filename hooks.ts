import { useRef } from "react";

export const useLazyCachingValue = <T>(callback: Function) =>{
    const computedValue = useRef<T | null>(null);
    const callbackPromise = useRef<Promise<T> | null>(null);
    return () => {
        if((callback as any)[Symbol.toStringTag] === 'AsyncFunction'){
            callbackPromise.current ??= callback();
            callbackPromise.current!.then((value: T) => {
                computedValue.current = value;
            });
        }else{
            computedValue.current ??= callback();
            callbackPromise.current = Promise.resolve<T>(computedValue.current!);
        }
        return {
            value: computedValue.current,
            promise: callbackPromise.current
        };
    };
}