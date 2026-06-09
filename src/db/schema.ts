export const schemaSql = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  language TEXT DEFAULT 'en'
);

CREATE TABLE IF NOT EXISTS incidents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  description TEXT,
  latitude REAL,
  longitude REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  incident_id INTEGER NOT NULL,
  service_type TEXT NOT NULL,
  provider TEXT,
  phone TEXT,
  status TEXT DEFAULT 'pending',
  FOREIGN KEY(incident_id) REFERENCES incidents(id)
);
`;

export const defaultCache = {
  emergencyContacts: [
    { label: 'Ambulance', phone: '+911234567890' },
    { label: 'Hospital', phone: '+911234567891' },
    { label: 'Police', phone: '+911234567892' }
  ]
};
