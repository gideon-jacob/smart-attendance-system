import { Response } from 'express';

class SseBroker {
  private channels = new Map<string, Set<Response>>();

  subscribe(channel: string, res: Response) {
    if (!this.channels.has(channel)) this.channels.set(channel, new Set());
    const set = this.channels.get(channel)!;
    set.add(res);
    res.on('close', () => {
      set.delete(res);
    });
  }

  publish(channel: string, event: string, data: unknown) {
    const set = this.channels.get(channel);
    if (!set) return;
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of set) {
      res.write(payload);
    }
  }
}

export const sseBroker = new SseBroker();
