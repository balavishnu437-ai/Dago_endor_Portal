CREATE TABLE `dailyRevenue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`totalRevenue` double NOT NULL DEFAULT 0,
	`orderCount` int NOT NULL DEFAULT 0,
	CONSTRAINT `dailyRevenue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `earnings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`orderId` int NOT NULL,
	`amount` double NOT NULL,
	`fee` double NOT NULL DEFAULT 0,
	`netAmount` double NOT NULL,
	`status` enum('pending','paid','refunded') NOT NULL DEFAULT 'pending',
	`payoutDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `earnings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`productName` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`unitPrice` double NOT NULL,
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`orderNumber` varchar(64) NOT NULL,
	`status` enum('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`totalAmount` double NOT NULL,
	`customerName` varchar(255),
	`customerEmail` varchar(320),
	`shippingAddress` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`price` double NOT NULL,
	`category` varchar(128),
	`imageUrl` text,
	`stockQuantity` int NOT NULL DEFAULT 0,
	`sku` varchar(64),
	`status` enum('active','draft','archived') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `storeSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`storeName` varchar(255) NOT NULL,
	`storeDescription` text,
	`contactEmail` varchar(320),
	`contactPhone` varchar(32),
	`emailNotifications` enum('on','off') NOT NULL DEFAULT 'on',
	`orderNotifications` enum('on','off') NOT NULL DEFAULT 'on',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `storeSettings_id` PRIMARY KEY(`id`)
);
