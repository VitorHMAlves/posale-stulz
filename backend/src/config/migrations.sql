-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'technician',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipments Table
CREATE TABLE IF NOT EXISTS equipments (
  id SERIAL PRIMARY KEY,
  serial_number VARCHAR(255) UNIQUE NOT NULL,
  model VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  delivery_date TIMESTAMP NOT NULL,
  installation_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Startups Table
CREATE TABLE IF NOT EXISTS startups (
  id SERIAL PRIMARY KEY,
  equipment_id INTEGER REFERENCES equipments(id),
  technician_id INTEGER REFERENCES users(id),
  startup_date TIMESTAMP NOT NULL,
  observations TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
  id SERIAL PRIMARY KEY,
  equipment_id INTEGER REFERENCES equipments(id),
  technician_id INTEGER REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  priority VARCHAR(50) DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Images Table
CREATE TABLE IF NOT EXISTS images (
  id SERIAL PRIMARY KEY,
  startup_id INTEGER REFERENCES startups(id),
  file_path VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_equipments_serial ON equipments(serial_number);
CREATE INDEX IF NOT EXISTS idx_startups_equipment ON startups(equipment_id);
CREATE INDEX IF NOT EXISTS idx_startups_technician ON startups(technician_id);
CREATE INDEX IF NOT EXISTS idx_support_equipment ON support_tickets(equipment_id);
CREATE INDEX IF NOT EXISTS idx_images_startup ON images(startup_id);