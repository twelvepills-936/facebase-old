declare module "bcryptjs" {
  export function hash(password: string, salt: string): Promise<string>;
  export function genSalt(rounds: number): Promise<string>;
  export function compare(password: string, hash: string): Promise<boolean>;
}
