CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) DEFAULT NULL,
  avatar VARCHAR(255) DEFAULT NULL,
  role VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255) NOT NULL,
  introduction TEXT NOT NULL,
  cover_photo VARCHAR(255) DEFAULT NULL,  
  tags VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  title_tsvector TSVECTOR
);

CREATE UNIQUE INDEX idx_reviews_slug ON reviews(slug);
CREATE INDEX idx_reviews_tags ON reviews (tags);
CREATE INDEX idx_reviews_title_tsvector ON reviews USING GIN (title_tsvector);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  review_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,  
  image_url VARCHAR(255) DEFAULT NULL,
  product_page VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,  
  FOREIGN KEY (review_id) REFERENCES reviews(id)
);

CREATE INDEX idx_products_review_id ON products (review_id);

CREATE TABLE product_reviews (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT NOT NULL,  
  rating FLOAT CHECK (rating >= 0 AND rating <= 5.0),
  review_text TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_product_reviews_product_id ON product_reviews (product_id);
CREATE INDEX idx_product_reviews_user_id ON product_reviews (user_id);

CREATE TABLE product_comparisons (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL,
  aspect VARCHAR(255) NOT NULL,
  comparison_point TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX idx_product_comparisons_product_id ON product_comparisons (product_id);
CREATE UNIQUE INDEX unique_product_aspect ON public.product_comparisons USING btree (product_id, aspect);

CREATE TABLE support_requests (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_reviews_title_tsvector() RETURNS TRIGGER AS $$
BEGIN
  NEW.title_tsvector := to_tsvector('english', NEW.title);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reviews_title_tsvector
BEFORE INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_reviews_title_tsvector();

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dbuser;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO dbuser;