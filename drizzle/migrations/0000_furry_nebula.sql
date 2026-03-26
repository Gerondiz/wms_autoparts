CREATE TABLE IF NOT EXISTS "accounts" (
	"user_id" integer NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "item_hierarchy" (
	"id" serial PRIMARY KEY NOT NULL,
	"parent_id" integer,
	"node_type_id" integer,
	"name" varchar(255) NOT NULL,
	"path" varchar(1024) NOT NULL,
	"sort_order" integer,
	"attributes" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "node_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"display_name" varchar(100),
	"icon" varchar(50),
	"default_attributes" jsonb,
	"can_have_children" boolean DEFAULT true,
	"can_have_parts" boolean DEFAULT false,
	"sort_order" integer,
	CONSTRAINT "node_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer,
	"part_id" integer,
	"quantity" integer NOT NULL,
	"quantity_fulfilled" integer DEFAULT 0,
	"status" varchar(20) DEFAULT 'pending'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_statuses" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"display_name" varchar(100),
	"color" varchar(20),
	"is_final" boolean DEFAULT false,
	"is_editable" boolean DEFAULT false,
	"allowed_transitions" integer[],
	CONSTRAINT "order_statuses_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"mechanic_id" integer,
	"repair_manager_id" integer,
	"status_id" integer,
	"priority" integer,
	"notes" text,
	"approved_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "part_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"part_id" integer,
	"image_url" varchar(500) NOT NULL,
	"is_primary" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "parts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"part_number" varchar(100) NOT NULL,
	"description" text,
	"stock" integer DEFAULT 0 NOT NULL,
	"price" numeric(10, 2),
	"min_stock_level" integer DEFAULT 0,
	"location" varchar(100),
	"hierarchy_id" integer,
	"specifications" jsonb,
	CONSTRAINT "parts_part_number_unique" UNIQUE("part_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "role_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"display_name" varchar(100),
	"permissions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sort_order" integer,
	"is_system" boolean DEFAULT false,
	CONSTRAINT "role_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"session_token" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stock_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"part_id" integer,
	"user_id" integer,
	"quantity_change" integer NOT NULL,
	"reason" varchar(100) NOT NULL,
	"order_id" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"full_name" varchar(255),
	"role_type_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification_tokens" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_item_hierarchy_path" ON "item_hierarchy" ("path");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_item_hierarchy_parent_id" ON "item_hierarchy" ("parent_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_item_hierarchy_node_type_id" ON "item_hierarchy" ("node_type_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_node_types_name" ON "node_types" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_order_items_order_id" ON "order_items" ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_order_items_part_id" ON "order_items" ("part_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_order_items_status" ON "order_items" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_order_statuses_name" ON "order_statuses" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_orders_mechanic_id" ON "orders" ("mechanic_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_orders_repair_manager_id" ON "orders" ("repair_manager_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_orders_status_id" ON "orders" ("status_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_orders_created_at" ON "orders" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_orders_priority_status" ON "orders" ("priority","status_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_part_images_part_id" ON "part_images" ("part_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_part_images_is_primary" ON "part_images" ("is_primary");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parts_part_number" ON "parts" ("part_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parts_hierarchy_id" ON "parts" ("hierarchy_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parts_name" ON "parts" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parts_stock" ON "parts" ("stock");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parts_stock_min" ON "parts" ("stock","min_stock_level");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_role_types_name" ON "role_types" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_stock_history_part_id" ON "stock_history" ("part_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_stock_history_user_id" ON "stock_history" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_stock_history_order_id" ON "stock_history" ("order_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_stock_history_created_at" ON "stock_history" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_stock_history_part_created" ON "stock_history" ("part_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_role_type_id" ON "users" ("role_type_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_is_active" ON "users" ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verification_tokens_pk" ON "verification_tokens" ("identifier","token");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verification_tokens_token" ON "verification_tokens" ("token");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "item_hierarchy" ADD CONSTRAINT "item_hierarchy_parent_id_item_hierarchy_id_fk" FOREIGN KEY ("parent_id") REFERENCES "item_hierarchy"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "item_hierarchy" ADD CONSTRAINT "item_hierarchy_node_type_id_node_types_id_fk" FOREIGN KEY ("node_type_id") REFERENCES "node_types"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_items" ADD CONSTRAINT "order_items_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "parts"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_mechanic_id_users_id_fk" FOREIGN KEY ("mechanic_id") REFERENCES "users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_repair_manager_id_users_id_fk" FOREIGN KEY ("repair_manager_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_status_id_order_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "order_statuses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "part_images" ADD CONSTRAINT "part_images_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "parts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "parts" ADD CONSTRAINT "parts_hierarchy_id_item_hierarchy_id_fk" FOREIGN KEY ("hierarchy_id") REFERENCES "item_hierarchy"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_history" ADD CONSTRAINT "stock_history_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "parts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_history" ADD CONSTRAINT "stock_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_history" ADD CONSTRAINT "stock_history_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_role_type_id_role_types_id_fk" FOREIGN KEY ("role_type_id") REFERENCES "role_types"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
