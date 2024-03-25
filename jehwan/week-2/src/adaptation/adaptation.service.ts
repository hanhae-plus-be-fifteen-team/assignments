import { Injectable } from '@nestjs/common'

@Injectable()
export class AdaptationService {
  public adapt<S, P>(
    service: new (...args: unknown[]) => S,
    providers?: P[],
  ): S {
    return new service(...(providers ?? []))
  }
}
