import { Injectable } from '@nestjs/common'

@Injectable()
export class FootprintTable {
  footprints: string[] = []

  print(label?: string) {
    this.footprints.push(label ?? Date.now().toString())
  }
}
