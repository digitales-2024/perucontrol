"use client";

import { Result } from "@/utils/result";
import { FetchError } from "./backend";
import { toast } from "sonner";

type ToastMessages<E> = {
    loading: string;
    success: string;
    error?: (e: FetchError<E>) => string;
};

function defaultErrorFunction(e: FetchError)
{
    return e.message;
}

/*
 * Wraps a Result<A,B> inside a sonner toast,
 * and immediately returns the original promise.
 */
export function toastWrapper<Success, Error>(
    promise: Promise<Result<Success, FetchError<Error>>>,
    messages: ToastMessages<Error>,
): Promise<Result<Success, FetchError<Error>>>
{
    const errorfn = messages.error ?? defaultErrorFunction;

    toast.promise(
        new Promise((resolve, reject) =>
        {
            promise.then(([data, error]) =>
            {
                if (error) reject(error);
                else resolve(data);
            }, reject);
        }),
        { ...messages, error: errorfn },
    );
    return promise;
}
