CREATE TABLE "cars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand" varchar(80) NOT NULL,
	"model" varchar(120) NOT NULL,
	"version" varchar(120),
	"year" integer NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"fuel" varchar(30),
	"transmission" varchar(30),
	"mileage" integer,
	"image_url" varchar(2048),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
