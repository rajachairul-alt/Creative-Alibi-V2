/**
 * @fileoverview In-memory session store with simple persistence.
 */

import type { WritingSession } from '../../../shared/src/types';

class SessionStoreImpl {
  private sessions = new Map<string, WritingSession>();

  save(session: WritingSession): void {
    this.sessions.set(session.sessionId, session);
  }

  get(sessionId: string): WritingSession | undefined {
    return this.sessions.get(sessionId);
  }

  update(sessionId: string, session: WritingSession): void {
    this.sessions.set(sessionId, session);
  }

  delete(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  getAll(): WritingSession[] {
    return Array.from(this.sessions.values());
  }
}

export const SessionStore = new SessionStoreImpl();
