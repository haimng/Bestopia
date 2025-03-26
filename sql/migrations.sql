ALTER TABLE reviews ADD COLUMN tags VARCHAR(255) DEFAULT NULL;
CREATE INDEX idx_reviews_tags ON reviews (tags);