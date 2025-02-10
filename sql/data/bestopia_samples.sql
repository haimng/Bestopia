INSERT INTO users (username, email, password, display_name, avatar) VALUES
('emily_johnson', 'emily.johnson@example.com', 'password123', 'Emily Johnson', '/img/avatars/emily_johnson.png'),
('olivia_smith', 'olivia.smith@example.com', 'password123', 'Olivia Smith', '/img/avatars/olivia_smith.png'),
('sophia_brown', 'sophia.brown@example.com', 'password123', 'Sophia Brown', '/img/avatars/sophia_brown.png'),
('james_smith', 'james.smith@example.com', 'password123', 'James Smith', '/img/avatars/james_smith.png'),
('michael_johnson', 'michael.johnson@example.com', 'password123', 'Michael Johnson', '/img/avatars/michael_johnson.png'),
('emma_davis', 'emma.davis@example.com', 'password123', 'Emma Davis', '/img/avatars/emma_davis.png'),
('isabella_wilson', 'isabella.wilson@example.com', 'password123', 'Isabella Wilson', '/img/avatars/isabella_wilson.png'),
('ava_martinez', 'ava.martinez@example.com', 'password123', 'Ava Martinez', '/img/avatars/ava_martinez.png'),
('william_brown', 'william.brown@example.com', 'password123', 'William Brown', '/img/avatars/william_brown.png'),
('david_miller', 'david.miller@example.com', 'password123', 'David Miller', '/img/avatars/david_miller.png');

INSERT INTO reviews (title, subtitle, introduction, cover_photo) VALUES
('Top Smartphones of 2025', 'The best smartphones you can buy right now.', 'Looking for a new smartphone? We have tested and reviewed the latest models from Apple, Samsung, Google, and more. Whether you need the best camera, the longest battery life, or the most powerful processor, we have got you covered. Check out our top picks for the best smartphones of 2025.', 'https://picsum.photos/700/400'),
('Best Laptops for Work and Play', 'Our favorite laptops for productivity and entertainment.', 'In the market for a new laptop? We have reviewed the latest models from Dell, HP, Apple, and more. Whether you need a powerful machine for work or a sleek device for entertainment, we have got you covered. Here are our top picks for the best laptops for work and play.', 'https://picsum.photos/600/500'),
('Top Fitness Trackers', 'The best fitness trackers to help you stay in shape.', 'Want to stay fit and healthy? A fitness tracker can help you monitor your activity, sleep, and heart rate. We have tested the latest models from Fitbit, Garmin, and more. Check out our top picks for the best fitness trackers to help you stay in shape.', 'https://picsum.photos/650/400'),
('Best Smart Home Devices', 'Our favorite smart home devices to make your life easier.', 'Looking to upgrade your home with smart devices? We have reviewed the latest smart home products from Amazon, Google, and more. Whether you need a smart speaker, a smart thermostat, or a smart security system, we have got you covered. Here are our top picks for the best smart home devices.', 'https://picsum.photos/800/400'),
('Top Gaming Consoles', 'The best gaming consoles for every type of gamer.', 'Ready to level up your gaming experience? We have reviewed the latest gaming consoles from Sony, Microsoft, and Nintendo. Whether you are a casual gamer or a hardcore enthusiast, we have got you covered. Check out our top picks for the best gaming consoles for every type of gamer.', 'https://picsum.photos/600/600');

INSERT INTO products (review_id, name, description, image_url) VALUES
(1, 'TV Model 1', repeat('A high-quality OLED TV with stunning picture quality. ', 20), 'https://picsum.photos/600/400'),
(1, 'TV Model 2', repeat('A budget-friendly LED TV with great features. ', 20), 'https://picsum.photos/600/410'),
(1, 'TV Model 3', repeat('A mid-range QLED TV with excellent color accuracy. ', 20), 'https://picsum.photos/600/420'),
(1, 'TV Model 4', repeat('A premium 4K TV with advanced smart features. ', 20), 'https://picsum.photos/600/430'),
(1, 'TV Model 5', repeat('An affordable HD TV perfect for small rooms. ', 20), 'https://picsum.photos/600/440');

INSERT INTO product_reviews (product_id, user_id, rating, review_text) VALUES
(1, 1, 5, 'I love this TV! The picture quality is amazing, and the sound is great too.'),
(2, 2, 4, 'A solid TV for the price. The picture is clear, and the colors are vibrant.'),
(3, 3, 3, 'Decent TV with good color accuracy. The sound could be better, though.'),
(4, 4, 5, 'This TV is worth every penny. The picture is crystal clear, and the smart features are a game-changer.'),
(5, 5, 4, 'Great TV for the price. The picture is sharp, and the size is perfect for my bedroom.');