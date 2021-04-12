import { ServiceError } from "./ServiceError";

export type ServiceResponse<T> = T | ServiceError