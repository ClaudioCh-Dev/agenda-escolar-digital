export class ApiError {
  constructor(
    readonly code: string,
    readonly message: string,
    readonly detail: string | null = null,
  ) {}
}
