import { Injectable } from '@nestjs/common';
const RouterOSClient = require('routeros-client').RouterOSClient;

@Injectable()
export class MikrotikService {
  private async getClient() {
    const client = new RouterOSClient({
      host: process.env.MIKROTIK_HOST || '192.168.88.1',
      user: process.env.MIKROTIK_USER || 'admin',
      password: process.env.MIKROTIK_PASSWORD || 'password',
    });
    return await client.connect();
  }

  async enableUser(username: string) {
    try {
      const api = await this.getClient();
      const users = await api.menu('/ppp/secret').where('name', username).get();
      if (users.length === 0) {
        console.warn(`MikroTik: User "${username}" not found`);
        api.close();
        return;
      }
      await api.menu('/ppp/secret').where('name', username).update({ disabled: 'no' });
      console.log(`MikroTik: "${username}" enabled ✅`);
      api.close();
    } catch (err: any) {
      console.error(`MikroTik enableUser error:`, err.message);
    }
  }

  async disableUser(username: string) {
    try {
      const api = await this.getClient();
      const users = await api.menu('/ppp/secret').where('name', username).get();
      if (users.length === 0) {
        console.warn(`MikroTik: User "${username}" not found`);
        api.close();
        return;
      }
      await api.menu('/ppp/secret').where('name', username).update({ disabled: 'yes' });
      console.log(`MikroTik: "${username}" disabled 🔴`);
      api.close();
    } catch (err: any) {
      console.error(`MikroTik disableUser error:`, err.message);
    }
  }
}