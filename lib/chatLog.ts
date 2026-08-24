import { hashVisitor, type VisitDb } from "./visitLog";

export interface LogChatTurnParams {
  db: VisitDb;
  ip: string;
  salt: string;
  userMessage: string;
  assistantResponse: string;
  now?: Date;
}

const RETENTION_DAYS = 30;

export async function logChatTurn({
  db,
  ip,
  salt,
  userMessage,
  assistantResponse,
  now = new Date(),
}: LogChatTurnParams): Promise<void> {
  const visitorHash = await hashVisitor(ip, salt);

  await db
    .prepare(
      "INSERT INTO chat_messages (created_at, visitor_hash, user_message, assistant_response) VALUES (?, ?, ?, ?)"
    )
    .bind(now.toISOString(), visitorHash, userMessage, assistantResponse)
    .run();

  const cutoff = new Date(now.getTime() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  await db
    .prepare("DELETE FROM chat_messages WHERE created_at < ?")
    .bind(cutoff.toISOString())
    .run();
}
