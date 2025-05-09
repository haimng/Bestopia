ALTER TABLE reviews ADD COLUMN tags VARCHAR(255) DEFAULT NULL;
CREATE INDEX idx_reviews_tags ON reviews (tags);

ALTER TABLE reviews ADD COLUMN title_tsvector TSVECTOR;
CREATE INDEX idx_reviews_title_tsvector ON reviews USING GIN (title_tsvector);

CREATE OR REPLACE FUNCTION update_reviews_title_tsvector() RETURNS TRIGGER AS $$
BEGIN
  NEW.title_tsvector := to_tsvector('english', NEW.title);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reviews_title_tsvector
BEFORE INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_reviews_title_tsvector();

UPDATE reviews SET title_tsvector = to_tsvector('english', title);

CREATE INDEX idx_products_review_id ON products (review_id);

CREATE INDEX idx_product_reviews_product_id ON product_reviews (product_id);
CREATE INDEX idx_product_reviews_user_id ON product_reviews (user_id);

CREATE INDEX idx_product_comparisons_review_id ON product_comparisons (review_id);
CREATE INDEX idx_product_comparisons_product_id ON product_comparisons (product_id);