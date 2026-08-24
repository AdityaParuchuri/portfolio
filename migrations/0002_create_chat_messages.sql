CREATE TABLE chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  visitor_hash TEXT NOT NULL,
  user_message TEXT NOT NULL,
  assistant_response TEXT NOT NULL
);

CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
