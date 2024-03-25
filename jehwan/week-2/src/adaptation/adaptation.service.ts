import { Injectable } from '@nestjs/common'

@Injectable()
export class AdaptationService {
  public adapt<T>(service: new (...args: any[]) => T): T {
    return new service()
  }
}
