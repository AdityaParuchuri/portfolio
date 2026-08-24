CREATE TABLE visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visited_at TEXT NOT NULL,
  path TEXT NOT NULL,
  country TEXT,
  city TEXT,
  region TEXT,
  visitor_hash TEXT NOT NULL
);

CREATE INDEX idx_visits_visited_at ON visits(visited_at);
