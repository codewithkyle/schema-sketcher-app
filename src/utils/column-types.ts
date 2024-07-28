export const MYSQL_TYPES = [
  // Numeric Types
  "TINYINT",
  "SMALLINT",
  "MEDIUMINT",
  "INT",
  "INTEGER",
  "BIGINT",
  "FLOAT",
  "DOUBLE",
  "DECIMAL",
  "NUMERIC",

  // Date and Time Types
  "DATE",
  "DATETIME",
  "TIMESTAMP",
  "TIME",
  "YEAR",

  // String Types
  "CHAR",
  "VARCHAR",
  "BINARY",
  "VARBINARY",
  "TINYBLOB",
  "BLOB",
  "MEDIUMBLOB",
  "LONGBLOB",
  "TINYTEXT",
  "TEXT",
  "MEDIUMTEXT",
  "LONGTEXT",
  "ENUM",
  "SET",

  // Spatial Types
  "GEOMETRY",
  "POINT",
  "LINESTRING",
  "POLYGON",
  "MULTIPOINT",
  "MULTILINESTRING",
  "MULTIPOLYGON",
  "GEOMETRYCOLLECTION",

  // JSON Type
  "JSON"
];

export const POSTGRES_TYPES = [
  // Numeric Types
  "SMALLINT",
  "INTEGER",
  "BIGINT",
  "DECIMAL",
  "NUMERIC",
  "REAL",
  "DOUBLE PRECISION",
  "SERIAL",
  "BIGSERIAL",

  // Monetary Types
  "MONEY",

  // Character Types
  "CHAR",
  "VARCHAR",
  "TEXT",

  // Binary Types
  "BYTEA",

  // Date/Time Types
  "DATE",
  "TIME",
  "TIMESTAMP",
  "TIMESTAMPTZ", // timestamp with time zone
  "INTERVAL",

  // Boolean Type
  "BOOLEAN",

  // Enumerated Type
  "ENUM",

  // Geometric Types
  "POINT",
  "LINE",
  "LSEG",
  "BOX",
  "PATH",
  "POLYGON",
  "CIRCLE",

  // Network Address Types
  "CIDR",
  "INET",
  "MACADDR",
  "MACADDR8",

  // Bit String Types
  "BIT",
  "VARBIT", // variable length bit string

  // Text Search Types
  "TSVECTOR",
  "TSQUERY",

  // UUID Type
  "UUID",

  // XML Type
  "XML",

  // JSON Types
  "JSON",
  "JSONB"
];

export const SQLITE_TYPES = [
  // Numeric Types
  "INTEGER",
  "REAL",
  "NUMERIC",

  // Text Type
  "TEXT",

  // Blob Type
  "BLOB",

  // Special Type
  "NULL"
];

export const SQL_SERVER_TYPES = [
  // Exact Numeric Types
  "BIT",
  "TINYINT",
  "SMALLINT",
  "INT",
  "BIGINT",
  "DECIMAL",
  "NUMERIC",
  "SMALLMONEY",
  "MONEY",

  // Approximate Numeric Types
  "FLOAT",
  "REAL",

  // Date and Time Types
  "DATE",
  "TIME",
  "DATETIME",
  "SMALLDATETIME",
  "DATETIME2",
  "DATETIMEOFFSET",

  // Character String Types
  "CHAR",
  "VARCHAR",
  "TEXT",

  // Unicode Character String Types
  "NCHAR",
  "NVARCHAR",
  "NTEXT",

  // Binary String Types
  "BINARY",
  "VARBINARY",
  "IMAGE",

  // Other Data Types
  "CURSOR",
  "TABLE",
  "UNIQUEIDENTIFIER",
  "XML",

  // Spatial Data Types
  "GEOGRAPHY",
  "GEOMETRY",

  // JSON Type
  "JSON",

  // Rowversion Type
  "ROWVERSION",

  // SQL_VARIANT Type
  "SQL_VARIANT"
];
