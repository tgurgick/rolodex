/**
 * Event system for entity lifecycle events
 */

type EventHandler<T = unknown> = (data: T) => void | Promise<void>;

interface EventMap {
  // Contact events
  'contact.created': { contact: unknown; actor: string };
  'contact.updated': { contact: unknown; changes: Record<string, unknown>; actor: string };
  'contact.deleted': { contactId: string; actor: string };

  // Company events
  'company.created': { company: unknown; actor: string };
  'company.updated': { company: unknown; changes: Record<string, unknown>; actor: string };
  'company.deleted': { companyId: string; actor: string };

  // Deal events
  'deal.created': { deal: unknown; actor: string };
  'deal.updated': { deal: unknown; changes: Record<string, unknown>; actor: string };
  'deal.stage_changed': { deal: unknown; previousStage: string; newStage: string; actor: string };
  'deal.closed': { deal: unknown; status: 'won' | 'lost'; actor: string };
  'deal.deleted': { dealId: string; actor: string };

  // Activity events
  'activity.created': { activity: unknown; actor: string };
  'activity.updated': { activity: unknown; changes: Record<string, unknown>; actor: string };
  'activity.completed': { activity: unknown; actor: string };
  'activity.deleted': { activityId: string; actor: string };

  // Task events
  'task.created': { task: unknown; actor: string };
  'task.updated': { task: unknown; changes: Record<string, unknown>; actor: string };
  'task.completed': { task: unknown; actor: string };
  'task.deleted': { taskId: string; actor: string };

  // Workflow events
  'workflow.created': { workflow: unknown; actor: string };
  'workflow.updated': { workflow: unknown; actor: string };
  'workflow.triggered': { workflow: unknown; triggerId: string };
  'workflow.completed': { workflow: unknown; triggerId: string; result: unknown };
  'workflow.failed': { workflow: unknown; triggerId: string; error: string };

  // AI events
  'ai.operation.started': { operation: string; agentId: string };
  'ai.operation.completed': { operation: string; agentId: string; result: unknown };
  'ai.operation.failed': { operation: string; agentId: string; error: string };
  'ai.approval.requested': { approvalId: string; operation: string; agentId: string };
  'ai.approval.granted': { approvalId: string; approvedBy: string };
  'ai.approval.denied': { approvalId: string; deniedBy: string; reason?: string };

  // Audit events
  'audit.log': { action: string; actor: string; resource: string; details: unknown };
}

type EventName = keyof EventMap;

/**
 * Type-safe event emitter for Rolodex events
 */
class RolodexEventEmitter {
  private handlers: Map<EventName, Set<EventHandler<unknown>>> = new Map();
  private asyncHandlers: Map<EventName, Set<EventHandler<unknown>>> = new Map();

  /**
   * Subscribe to an event (synchronous handler)
   */
  on<E extends EventName>(event: E, handler: EventHandler<EventMap[E]>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler as EventHandler<unknown>);

    // Return unsubscribe function
    return () => {
      this.handlers.get(event)?.delete(handler as EventHandler<unknown>);
    };
  }

  /**
   * Subscribe to an event (async handler - runs after sync handlers)
   */
  onAsync<E extends EventName>(event: E, handler: EventHandler<EventMap[E]>): () => void {
    if (!this.asyncHandlers.has(event)) {
      this.asyncHandlers.set(event, new Set());
    }
    this.asyncHandlers.get(event)!.add(handler as EventHandler<unknown>);

    return () => {
      this.asyncHandlers.get(event)?.delete(handler as EventHandler<unknown>);
    };
  }

  /**
   * Subscribe to an event once
   */
  once<E extends EventName>(event: E, handler: EventHandler<EventMap[E]>): () => void {
    const unsubscribe = this.on(event, (data) => {
      unsubscribe();
      handler(data);
    });
    return unsubscribe;
  }

  /**
   * Emit an event
   */
  emit<E extends EventName>(event: E, data: EventMap[E]): void {
    // Run sync handlers first
    const syncHandlers = this.handlers.get(event);
    if (syncHandlers) {
      for (const handler of syncHandlers) {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      }
    }

    // Run async handlers without blocking
    const asyncHandlerSet = this.asyncHandlers.get(event);
    if (asyncHandlerSet) {
      for (const handler of asyncHandlerSet) {
        Promise.resolve()
          .then(() => handler(data))
          .catch((error) => {
            console.error(`Error in async event handler for ${event}:`, error);
          });
      }
    }
  }

  /**
   * Emit an event and wait for all handlers to complete
   */
  async emitAsync<E extends EventName>(event: E, data: EventMap[E]): Promise<void> {
    const allHandlers = [
      ...(this.handlers.get(event) || []),
      ...(this.asyncHandlers.get(event) || []),
    ];

    await Promise.all(
      allHandlers.map((handler) =>
        Promise.resolve()
          .then(() => handler(data))
          .catch((error) => {
            console.error(`Error in event handler for ${event}:`, error);
          })
      )
    );
  }

  /**
   * Remove all handlers for an event
   */
  off(event: EventName): void {
    this.handlers.delete(event);
    this.asyncHandlers.delete(event);
  }

  /**
   * Remove all handlers for all events
   */
  clear(): void {
    this.handlers.clear();
    this.asyncHandlers.clear();
  }

  /**
   * Get the number of handlers for an event
   */
  listenerCount(event: EventName): number {
    return (
      (this.handlers.get(event)?.size || 0) +
      (this.asyncHandlers.get(event)?.size || 0)
    );
  }
}

// Singleton event emitter instance
export const events = new RolodexEventEmitter();

// Export types
export type { EventMap, EventName, EventHandler };
export { RolodexEventEmitter };
